'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BlogEditor from '@/components/editor/BlogEditor';
import { Save, Send, Calendar, Trash2, CheckCircle2, AlertCircle, Tag, Layers } from 'lucide-react';
import debounce from 'lodash.debounce';
import { uploadImage } from '@/lib/editor-utils';
import { getAllCategories, getAllTags } from '@/lib/strapi';

export default function WritePage() {
  const { user, jwt } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [publishDate, setPublishDate] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  // Load categories & tags
  useEffect(() => {
    getAllCategories().then(setAvailableCategories);
    getAllTags().then(setAvailableTags);
  }, []);

  // Load from LocalStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('blog_draft');
    if (draft) {
      const { title: dTitle, description: dDesc, content: dContent } = JSON.parse(draft);
      setTitle(dTitle || '');
      setDescription(dDesc || '');
      setContent(dContent || '');
    }
  }, []);

  // Local Auto-save
  const localSave = useCallback(
    debounce((data: any) => {
      localStorage.setItem('blog_draft', JSON.stringify(data));
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    }, 1000),
    []
  );

  useEffect(() => {
    if (title || description || content) {
      setStatus('saving');
      localSave({ title, description, content });
    }
  }, [title, description, content, localSave]);

  const handlePublish = async () => {
    if (!title || !content) {
      alert('Please provide at least a title and content.');
      return;
    }

    try {
      setStatus('saving');
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title,
            description,
            slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 8),
            content,
            scheduledPublishAt: isScheduled ? publishDate : null,
            author_user: user?.id,
            categories: selectedCategories,
            tags: selectedTags,
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // If not scheduled, publish it immediately
        if (!isScheduled) {
          await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${result.data.documentId}/actions/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${jwt}` },
          });
        }
        localStorage.removeItem('blog_draft');
        if (result?.data?.slug) {
          router.push(`/blog/${result.data.slug}`);
        } else {
          router.push('/');
        }
      } else {
        const errorData = await response.json();
        console.error('Strapi validation error:', errorData);
        alert(`Failed to save post: ${errorData?.error?.message || 'Unknown error'}`);
        setStatus('error');
      }
    } catch (error: any) {
      console.error('Publish error:', error);
      alert(`An error occurred: ${error.message}`);
      setStatus('error');
    }
  };



  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Create New Story
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-white/50 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            {status === 'saving' && <><Save className="animate-pulse mr-2" size={14} /> Saving...</>}
            {status === 'saved' && <><CheckCircle2 className="text-green-400 mr-2" size={14} /> Saved locally</>}
            {status === 'idle' && <><Save className="mr-2" size={14} /> Draft ready</>}
            {status === 'error' && <><AlertCircle className="text-red-400 mr-2" size={14} /> Save failed</>}
          </div>
          
          <button 
            onClick={handlePublish}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-all shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-white/20"
          />
          
          <textarea
            placeholder="Short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-lg bg-transparent border-none focus:outline-none placeholder:text-white/20 resize-none h-20"
          />

          <div className="min-h-[500px]">
            <BlogEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-400" />
              Publishing Options
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={!isScheduled} 
                  onChange={() => setIsScheduled(false)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">Publish Immediately</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isScheduled} 
                  onChange={() => setIsScheduled(true)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">Schedule Post</span>
              </label>

              {isScheduled && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="datetime-local" 
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/90 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category Selector */}
          {availableCategories.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-purple-400" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat: any) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategories(prev =>
                        prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedCategories.includes(cat.id)
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Selector */}
          {availableTags.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag size={18} className="text-blue-400" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag: any) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to discard this draft?')) {
                localStorage.removeItem('blog_draft');
                router.refresh();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl border border-red-500/20 transition-all"
          >
            <Trash2 size={16} />
            Discard Draft
          </button>
        </div>
      </div>
    </div>
  );
}

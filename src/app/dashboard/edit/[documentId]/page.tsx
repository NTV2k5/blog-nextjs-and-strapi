'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BlogEditor from '@/components/editor/BlogEditor';
import { Save, Send, Calendar, History, Trash2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import debounce from 'lodash.debounce';
import Link from 'next/link';

export default function EditPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = use(params);
  const { user, jwt } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [publishDate, setPublishDate] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function loadPost() {
      if (!jwt) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${documentId}?populate=*&status=all`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const { data } = await response.json();
        if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setContent(data.content || '');
          setIsPublished(!!data.publishedAt);
          if (data.scheduledPublishAt) {
            setPublishDate(new Date(data.scheduledPublishAt).toISOString().slice(0, 16));
            setIsScheduled(true);
          }
          fetchVersions(data.id);
        }
      } catch (error) {
        console.error('Error loading post:', error);
      }
    }
    loadPost();
  }, [documentId, jwt]);

  const fetchVersions = async (postId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/post-versions?filters[post][id]=${postId}&sort=createdAt:desc`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await response.json();
      setVersions(data.data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const handleUpdate = async (publish: boolean = false) => {
    try {
      setStatus('saving');
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title,
            description,
            content,
            scheduledPublishAt: isScheduled ? publishDate : null,
          }
        }),
      });

      if (response.ok) {
        if (publish && !isPublished) {
          await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${documentId}/actions/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${jwt}` },
          });
          setIsPublished(true);
        }
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
        // Refresh versions
        const { data } = await (await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${documentId}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        })).json();
        if (data) fetchVersions(data.id);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Update error:', error);
      setStatus('error');
    }
  };

  const restoreVersion = (version: any) => {
    if (confirm('Are you sure you want to restore this version? Your current changes will be overwritten.')) {
      setTitle(version.title);
      setDescription(version.description);
      setContent(version.content);
      setShowHistory(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Edit Story
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm text-white/50 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            {status === 'saving' && <><Save className="animate-pulse mr-2" size={14} /> Saving...</>}
            {status === 'saved' && <><CheckCircle2 className="text-green-400 mr-2" size={14} /> Changes saved</>}
            {status === 'idle' && <><Save className="mr-2" size={14} /> No unsaved changes</>}
            {status === 'error' && <><AlertCircle className="text-red-400 mr-2" size={14} /> Save failed</>}
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            title="Version History"
          >
            <History size={20} />
          </button>
          
          <button 
            onClick={() => handleUpdate(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-all shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
            {isPublished ? 'Update Post' : 'Publish Changes'}
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
              <div className="text-sm mb-2">
                Status: {isPublished ? <span className="text-green-400 font-bold">Published</span> : <span className="text-gray-400">Draft</span>}
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={!isScheduled} 
                  onChange={() => setIsScheduled(false)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">Manual Publish</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isScheduled} 
                  onChange={() => setIsScheduled(true)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">Schedule Update</span>
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

          {showHistory && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History size={18} className="text-purple-400" />
                History
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {versions.length > 0 ? versions.map((v, i) => (
                  <div 
                    key={i} 
                    onClick={() => restoreVersion(v)}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-white/40">Version {versions.length - i}</span>
                      <span className="text-[10px] text-white/30">{new Date(v.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-1 group-hover:text-white transition-colors">{v.title}</p>
                  </div>
                )) : (
                  <p className="text-sm text-white/30 text-center py-4 italic">No history yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

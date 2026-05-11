'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Post } from '@/lib/strapi';
import { Plus, Edit3, Trash2, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { jwt, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserPosts() {
      if (jwt && user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?filters[author_user][id]=${user.id}&populate=*&status=all`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const data = await response.json();
          setPosts(data.data || []);
        } catch (error) {
          console.error('Error loading posts:', error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }
    loadUserPosts();
  }, [jwt, user, authLoading]);

  const deletePost = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.documentId !== documentId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Author Dashboard</h1>
          <p className="text-gray-400">Manage your stories and publishing schedule.</p>
        </div>
        
        <Link 
          href="/dashboard/write"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Write New Story
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.length > 0 ? posts.map((post: any, index) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col md:flex-row items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <div className="w-full md:w-32 h-20 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
              {post.cover ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${Array.isArray(post.cover) ? post.cover[0].url : post.cover.url}`} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <FileText size={24} />
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                
                {post.publishedAt ? (
                  <div className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full text-xs font-medium border border-green-400/20">
                    <CheckCircle2 size={12} />
                    Published
                  </div>
                ) : post.scheduledPublishAt ? (
                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full text-xs font-medium border border-amber-400/20">
                    <Clock size={12} />
                    Scheduled: {new Date(post.scheduledPublishAt).toLocaleString()}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-2 py-0.5 rounded-full text-xs font-medium border border-white/10">
                    <AlertCircle size={12} />
                    Draft
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href={`/dashboard/edit/${post.documentId}`}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-blue-400 transition-colors"
                title="Edit"
              >
                <Edit3 size={18} />
              </Link>
              <button 
                onClick={() => deletePost(post.documentId)}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No stories yet</h3>
            <p className="text-gray-400 mb-8">Start sharing your thoughts with the world.</p>
            <Link 
              href="/dashboard/write"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all border border-white/10"
            >
              Write Your First Story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSavedPosts, Post } from '@/lib/strapi';
import PostCard from '@/components/glass/PostCard';
import { Bookmark, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SavedPostsPage() {
  const { jwt, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedPosts() {
      if (jwt) {
        setLoading(true);
        const savedPosts = await getSavedPosts(jwt);
        setPosts(savedPosts);
        setLoading(false);
      } else if (!authLoading) {
        setLoading(false);
      }
    }
    loadSavedPosts();
  }, [jwt, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-400 font-medium">Fetching your collection...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Bookmark className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Please Sign In</h2>
        <p className="text-gray-400 max-w-sm mb-8">
          You need to be logged in to view and manage your saved articles.
        </p>
        <Link 
          href="/login" 
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/20"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <header className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl border border-white/10 backdrop-blur-xl">
          <Bookmark className="w-8 h-8 text-blue-400 fill-current" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white">Your Library</h1>
          <p className="text-gray-400 mt-1">
            {posts.length > 0 
              ? `You have ${posts.length} article${posts.length === 1 ? '' : 's'} saved for later.`
              : 'Your reading list is currently empty.'
            }
          </p>
        </div>
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-20 text-center backdrop-blur-sm"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6 border border-white/10">
            <BookOpen className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Start your collection</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-10 leading-relaxed">
            Find articles that inspire you and save them to read whenever you're ready.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all border border-white/10"
          >
            Explore Articles
          </Link>
        </motion.div>
      )}
    </div>
  );
}

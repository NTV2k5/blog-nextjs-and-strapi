'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { motion } from 'framer-motion';

interface SeriesPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
}

interface Series {
  name: string;
  posts: SeriesPost[];
}

export default function SeriesNavigation({ series, currentSlug }: { series: Series, currentSlug: string }) {
  if (!series || !series.posts) return null;

  const currentIndex = series.posts.findIndex(p => p.slug === currentSlug);
  const prevPost = currentIndex > 0 ? series.posts[currentIndex - 1] : null;
  const nextPost = currentIndex < series.posts.length - 1 ? series.posts[currentIndex + 1] : null;

  return (
    <div className="my-12 p-8 rounded-[40px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-500/20 rounded-2xl border border-blue-500/30">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60">Part of series</span>
            <h3 className="text-xl font-black text-white">{series.name}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {prevPost ? (
            <Link 
              href={`/blog/${prevPost.slug}`}
              className="group/btn flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
            >
              <div className="p-2 rounded-xl bg-white/5 group-hover/btn:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white/40 group-hover/btn:text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/30 uppercase">Previous Part</span>
                <p className="text-sm font-bold text-white group-hover/btn:text-blue-400 transition-colors line-clamp-1">{prevPost.title}</p>
              </div>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link 
              href={`/blog/${nextPost.slug}`}
              className="group/btn flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-right"
            >
              <div className="flex-grow">
                <span className="text-[10px] font-bold text-white/30 uppercase">Next Part</span>
                <p className="text-sm font-bold text-white group-hover/btn:text-blue-400 transition-colors line-clamp-1">{nextPost.title}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 group-hover/btn:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-white/40 group-hover/btn:text-white" />
              </div>
            </Link>
          ) : <div />}
        </div>

        <details className="group/details">
          <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/70 transition-colors select-none">
            <List size={14} />
            View all {series.posts.length} parts in this series
          </summary>
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {series.posts.map((post, index) => (
              <Link 
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  post.slug === currentSlug 
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' 
                    : 'hover:bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                <span className="text-xs font-black w-4">{index + 1}</span>
                <span className="text-sm font-medium">{post.title}</span>
                {post.slug === currentSlug && <span className="ml-auto text-[10px] font-black uppercase bg-blue-500/30 px-2 py-0.5 rounded-full">Current</span>}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

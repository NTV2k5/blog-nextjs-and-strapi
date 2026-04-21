'use client';

import React, { useEffect, useState } from 'react';
import { getLatestPosts, Post } from '@/lib/strapi';
import PostCard from '@/components/glass/PostCard';
import { Loader2 } from 'lucide-react';

export default function LatestPosts() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getLatestPosts();
        setLatestPosts(data);
      } catch (error) {
        console.error("Lỗi khi fetch Latest Posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          🔥 Featured: {latestPosts.length} {latestPosts.length > 1 ? 'Most Recent' : 'Latest Article'}
        </h2>
        <div className="h-px flex-grow mx-8 bg-gradient-to-r from-white/20 to-transparent" />
      </div>
      
      {latestPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post, index) => (
            <PostCard key={`latest-${post.id}`} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 glass rounded-3xl">
          <p className="text-muted-foreground">No recent articles found.</p>
        </div>
      )}
    </section>
  );
}

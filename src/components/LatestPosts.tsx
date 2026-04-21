import React from 'react';
import { getLatestPosts } from '@/lib/strapi';
import PostCard from '@/components/glass/PostCard';

export default async function LatestPosts() {
  // ISR: Revalidate every 60 seconds. Không truyền limit để Strapi tự dùng mặc định (5 bài)
  const latestPosts = await getLatestPosts({ limit: 3, revalidate: 60 });

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


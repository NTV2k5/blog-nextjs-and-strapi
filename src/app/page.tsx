// src/app/page.tsx
import React from 'react';
import { getPosts } from '@/lib/strapi';
import PostCard from '@/components/glass/PostCard';
import { Sparkles } from 'lucide-react';
import LatestPosts from '@/components/LatestPosts'; // Import Client Component

export default async function HomePage() {

  const allPosts = await getPosts();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span>Discover the latest in tech</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Insight. Innovation. <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Glassy Perspectives.
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome to our premium blog. Dive deep into stories about technology, 
          design, and the future of the digital world.
        </p>
      </section>

      <LatestPosts />

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">All Articles</h2>
          <div className="h-px flex-grow mx-8 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
        
        {allPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post, index) => (
              <PostCard key={`all-${post.id}`} post={post} index={index + 3} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-3xl">
            <h3 className="text-2xl font-bold">No articles found</h3>
            <p className="text-muted-foreground mt-2">Check back later for new content from Strapi.</p>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="glass p-12 rounded-3xl text-center space-y-6 mt-20">
        <h2 className="text-3xl font-bold">Stay Updated</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Get the latest articles and insights delivered straight to your inbox. 
          No spam, just pure value.
        </p>
        <div className="flex max-w-md mx-auto items-center space-x-2">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow bg-white/10 border-white/20 rounded-xl px-4 py-2.5 outline-none focus:ring-2 ring-primary/50"
          />
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}

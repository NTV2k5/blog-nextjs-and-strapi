import React from 'react';
import { Search as SearchIcon, Newspaper } from 'lucide-react';
import { searchPosts } from '@/lib/strapi';
import PostCard from '@/components/glass/PostCard';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;
  const results = query ? await searchPosts(query) : [];

  return (
    <div className="py-12 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <SearchIcon className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Search Results</h1>
            <p className="text-gray-400 mt-1 text-lg">
              {query ? (
                <>Showing insights for <span className="text-blue-400 font-semibold">"{query}"</span></>
              ) : (
                'Enter a keyword to explore our blog'
              )}
            </p>
          </div>
        </div>
        
        {results.length > 0 && (
          <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 backdrop-blur-md">
            Found <span className="text-white font-bold">{results.length}</span> {results.length === 1 ? 'article' : 'articles'}
          </div>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-20 text-center backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 mb-8 animate-pulse">
              <Newspaper className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No results found</h3>
            <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
              We couldn't find any articles matching your search across titles, authors, content, or dates. 
              <br />
              <span className="text-sm mt-4 block text-gray-500 italic">Try searching for "Technology", "Design", or a specific date.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

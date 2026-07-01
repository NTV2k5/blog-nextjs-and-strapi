import React from 'react';
import { getPostsByTag, getAllTags } from '@/lib/strapi';
import PostCard from '@/components/glass/PostCard';
import { notFound } from 'next/navigation';
import { Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 90;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [posts, allTags] = await Promise.all([
    getPostsByTag(slug),
    getAllTags(),
  ]);

  const tag = allTags.find((t) => t.slug === slug);
  if (!tag) notFound();

  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-6">
          <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <Hash className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-1">Tag</p>
            <h1 className="text-5xl font-black text-white tracking-tight">#{tag.name}</h1>
            <p className="text-white/40 mt-1">
              {posts.length} article{posts.length !== 1 ? 's' : ''} with this tag
            </p>
          </div>
        </div>

        {/* Other tags cloud */}
        <div className="flex flex-wrap gap-2 mt-8">
          {allTags.map((t) => (
            <Link
              key={t.id}
              href={`/tag/${t.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                t.slug === slug
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              #{t.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <PostCard key={post.id} post={post} index={idx} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-[40px]">
          <p className="text-xl text-white/20 font-bold italic">
            No articles with this tag yet.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPostBySlug, Post, getStrapiURL, renderBlocks, getTextContent } from '@/lib/strapi';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPostBySlug(slug);
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return <PostLoader />;
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Post not found</h1>
        <Link href="/" className="text-primary hover:underline">Return to home</Link>
      </div>
    );
  }

  const cover = Array.isArray(post.cover) ? post.cover[0] : post.cover;
  const coverUrl = cover ? getStrapiURL(cover.url) : null;
  const authorAvatar = post.author?.avatar ? getStrapiURL(post.author.avatar.url) : null;

  const title = getTextContent(post.title);
  const description = getTextContent(post.description);

  return (
    <article className="max-w-4xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to feed
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Article</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            {title || 'Untitled Post'}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/10">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border border-white/20">
                {authorAvatar ? (
                  <AvatarImage src={authorAvatar} />
                ) : (
                  <AvatarFallback>{post.author?.name?.charAt(0) || 'A'}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{post.author?.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Draft'}</span>
            </div>
          </div>
        </div>

        {coverUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl glass shadow-2xl">
            <img 
              src={coverUrl} 
              alt={title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none mt-12 text-foreground/80 leading-relaxed">
          {description && <p className="text-xl text-foreground font-medium mb-8">{description}</p>}
          
          {/* Blocks Rendering Logic */}
          <div className="space-y-6">
            {renderBlocks(post.content) || (
              <p>This post has no content blocks yet. Please add content in the Strapi editor.</p>
            )}
          </div>
        </div>


        <div className="pt-12 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors border border-white/10">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Like</span>
            </button>
            <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors border border-white/10">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

function PostLoader() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <Skeleton className="h-6 w-32 rounded-full" />
      <div className="space-y-4">
        <Skeleton className="h-16 w-3/4 rounded-xl" />
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}


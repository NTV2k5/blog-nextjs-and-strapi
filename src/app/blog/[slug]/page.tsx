import React from 'react';
import { getPostBySlug, getPosts, getStrapiURL, renderBlocks, getTextContent } from '@/lib/strapi';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';
import { ClientMotionWrapper } from '@/components/glass/ClientMotionWrapper';
import PostInteractions from '@/components/glass/PostInteractions';

// ISR Configuration: Revalidate every hour (3600s)
export const revalidate = 7200;

// Pre-render blog posts during build
export async function generateStaticParams() {
  console.log('\nlog của hàm generateStaticParams');
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  console.log('log của hàm postBySlug\n', params);
  const { slug } = await params;
  const post = await getPostBySlug(slug, revalidate);

  if (!post) {
    notFound();
  }

  const cover = Array.isArray(post.cover) ? post.cover[0] : post.cover;
  const coverUrl = cover ? getStrapiURL(cover.url) : null;
  const authorAvatar = post.author?.avatar ? getStrapiURL(post.author.avatar.url) : null;

  const title = getTextContent(post.title);
  const description = getTextContent(post.description);

  return (
    <article className="max-w-4xl mx-auto pb-20">
      <ClientMotionWrapper
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to feed
        </Link>
      </ClientMotionWrapper>

      <ClientMotionWrapper
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
              alt={title || 'Cover image'}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none mt-12 text-foreground/80 leading-relaxed">
          {description && <p className="text-xl text-foreground font-medium mb-8">{description}</p>}
          
          <div className="space-y-6">
            {renderBlocks(post.content) || (
              <p>This post has no content blocks yet. Please add content in the Strapi editor.</p>
            )}
          </div>
        </div>


        <div className="pt-12 border-t border-white/10">
          <PostInteractions 
            postId={post.id} 
            postTitle={title} 
            postSlug={post.slug} 
          />
        </div>
      </ClientMotionWrapper>
    </article>
  );
}



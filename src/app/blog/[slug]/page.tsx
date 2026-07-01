import React from 'react';
import { getPostBySlug, getPosts, getStrapiURL, renderBlocks, getTextContent } from '@/lib/strapi';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';
import { ClientMotionWrapper } from '@/components/glass/ClientMotionWrapper';
import PostInteractions from '@/components/glass/PostInteractions';
import CommentSection from '@/components/blog/CommentSection';
import TableOfContents from '@/components/blog/TableOfContents';
import SeriesNavigation from '@/components/blog/SeriesNavigation';
import { Hash } from 'lucide-react';

// ISR Configuration: Revalidate every 2 hours
export const revalidate = 60;

// Pre-render blog posts during build
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, revalidate);

  if (!post) {
    notFound();
  }

  const cover = Array.isArray(post.cover) ? post.cover[0] : post.cover;
  const coverUrl = cover ? getStrapiURL(cover.url) : null;
  // Prefer author_user (Users & Permissions) over legacy author relation
  const authorAvatar = post.author_user?.avatar ? getStrapiURL(post.author_user.avatar.url)
    : post.author?.avatar ? getStrapiURL((post.author.avatar as any).url)
    : null;

  const title = getTextContent(post.title);
  const description = getTextContent(post.description);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto pb-20 px-6">
      <article className="lg:col-span-8">
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
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {post.categories?.map((cat) => (
                <Badge key={cat.id} className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30 transition-colors cursor-pointer">
                  {cat.name}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-white tracking-tighter">
              {title || 'Untitled Post'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 py-6 border-y border-white/10">
              {/* Author */}
              {(post.author_user?.username || post.author?.name) ? (
                <Link
                  href={post.author_user?.username ? `/author/${post.author_user.username}` : '#'}
                  className="flex items-center space-x-3 group/author"
                >
                  <Avatar className="w-12 h-12 border-2 border-white/10 group-hover/author:border-blue-500/50 transition-colors">
                    {authorAvatar ? (
                      <AvatarImage src={authorAvatar} />
                    ) : (
                      <AvatarFallback className="bg-white/5 text-white/50">
                        {(post.author_user?.username || post.author?.name || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-white group-hover/author:text-blue-400 transition-colors">
                      {post.author_user?.username || post.author?.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-white/40">
                      {post.author_user?.jobTitle || 'Story Architect'}
                    </p>
                  </div>
                </Link>
              ) : null}
              
              <div className="h-8 w-px bg-white/10" />
              
              <div className="flex items-center space-x-2 text-sm text-white/40">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Draft Mode'}</span>
              </div>
            </div>
          </div>

          {coverUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-[40px] border border-white/10 shadow-2xl group">
              <img 
                src={coverUrl} 
                alt={title || 'Cover image'}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          {post.series && (
            <SeriesNavigation series={post.series} currentSlug={post.slug} />
          )}

          <div id="article-content" className="prose prose-invert prose-lg max-w-none mt-12 text-white/80 leading-relaxed selection:bg-blue-500/30">
            {description && (
              <p className="text-2xl text-white font-medium mb-12 italic border-l-4 border-blue-500 pl-6 py-2 bg-blue-500/5 rounded-r-2xl">
                {description}
              </p>
            )}
            
            <div className="space-y-8">
              {renderBlocks(post.content) || (
                <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
                  <p className="text-white/30 italic">Patience is a virtue. Content is being prepared...</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-12">
            {post.tags?.map((tag) => (
              <Link 
                key={tag.id} 
                href={`/search?q=%23${tag.slug}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all group"
              >
                <Hash size={12} className="group-hover:text-blue-400" />
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="pt-12 border-t border-white/10">
            <PostInteractions 
              postId={post.id} 
              postTitle={title} 
              postSlug={post.slug} 
            />
            
            <CommentSection postId={post.id} />
          </div>
        </ClientMotionWrapper>
      </article>

      <aside className="lg:col-span-4 hidden lg:block">
        <TableOfContents contentId="article-content" />
      </aside>
    </div>
  );
}



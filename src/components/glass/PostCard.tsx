'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Post, getStrapiURL, StrapiImage } from '@/lib/strapi';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
  index: number;
}

// Helper to extract text from Strapi Blocks if the user accidentally used them for title/description
const getTextContent = (content: any): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((block: any) => {
        if (block.children && Array.isArray(block.children)) {
          return block.children.map((child: any) => child.text).join(' ');
        }
        return '';
      })
      .join(' ');
  }
  return '';
};

export default function PostCard({ post, index }: PostCardProps) {
  // Handle cover being a single object or an array (multiple media)
  const cover = Array.isArray(post.cover) ? post.cover[0] : post.cover;
  const coverUrl = cover ? getStrapiURL(cover.url) : null;
  // Prefer author_user (Users & Permissions) for username link, fallback to author (legacy)
  const authorName = post.author_user?.username || post.author?.name || 'Anonymous';
  const authorUsername = post.author_user?.username;
  const authorAvatar = post.author_user?.avatar ? getStrapiURL(post.author_user.avatar.url)
    : post.author?.avatar ? getStrapiURL(post.author.avatar.url) : null;

  const title = getTextContent(post.title);
  const description = getTextContent(post.description);
  const slug = getTextContent(post.slug);

  // Fallback to extract first image from HTML content if cover is missing
  let finalCoverUrl = coverUrl;
  if (!finalCoverUrl && typeof post.content === 'string') {
    const match = post.content.match(/<img[^>]+src="([^">]+)"/);
    if (match) {
      finalCoverUrl = match[1];
    }
  }

  // Fallback to random gradient if no image at all
  const hasImage = !!finalCoverUrl;

  // Calculate read time
  let readTime = post.readTime || 1;
  if (!post.readTime && typeof post.content === 'string') {
    const textLength = post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    readTime = Math.max(1, Math.ceil(textLength / 200));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass-card overflow-hidden h-full flex flex-col border-0 relative group">
        <Link href={`/blog/${slug}`} className="absolute inset-0 z-10" aria-label={`Read ${title}`} />
        
        {finalCoverUrl ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={finalCoverUrl} 
              alt={cover?.alternativeText || title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
              <div className="absolute top-4 left-4 flex gap-2">
                {post.categories && post.categories.length > 0 && (
                  <Badge className="bg-blue-600/40 backdrop-blur-md border-blue-400/30 text-white hover:bg-blue-600/60">
                    {post.categories[0].name}
                  </Badge>
                )}
                <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30">
                  Article
                </Badge>
              </div>
          </div>
        ) : (
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              {post.categories && post.categories.length > 0 && (
                <Badge className="bg-blue-600/40 backdrop-blur-md border-blue-400/30 text-white hover:bg-blue-600/60">
                  {post.categories[0].name}
                </Badge>
              )}
              <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30">
                Article
              </Badge>
            </div>
            <h3 className="text-2xl font-black text-white/20 px-6 text-center line-clamp-2">{title}</h3>
          </div>
        )}
          <CardHeader className="flex-grow">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
              <Calendar className="w-3 h-3" />
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Draft'}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3 h-3" />
              <span>{readTime} min read</span>
            </div>
            <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {title || 'Untitled Post'}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {description || 'No description available.'}
            </CardDescription>
          </CardHeader>

          <CardFooter className="pt-0 flex items-center justify-between border-t border-white/10 mt-auto py-4">
            {authorUsername ? (
              <Link
                href={`/author/${authorUsername}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity group/author relative z-20"
              >
                <Avatar className="w-8 h-8 border border-white/20">
                  {authorAvatar ? (
                    <AvatarImage src={authorAvatar} />
                  ) : (
                    <AvatarFallback className="text-xs">{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium group-hover/author:underline">{authorName}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8 border border-white/20">
                  {authorAvatar ? (
                    <AvatarImage src={authorAvatar} />
                  ) : (
                    <AvatarFallback className="text-xs">{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium">{authorName}</span>
              </div>
            )}
            <div className="text-primary flex items-center text-sm font-semibold">
              Read More <ChevronRight className="ml-1 w-4 h-4" />
            </div>
          </CardFooter>
        </Card>
    </motion.div>
  );
}


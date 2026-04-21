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
  const authorAvatar = post.author?.avatar ? getStrapiURL(post.author.avatar.url) : null;

  const title = getTextContent(post.title);
  const description = getTextContent(post.description);
  const slug = getTextContent(post.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/blog/${slug}`}>
        <Card className="glass-card overflow-hidden h-full flex flex-col border-0">
          {coverUrl && (
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={coverUrl} 
                alt={cover?.alternativeText || title}
                className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30">
                  Article
                </Badge>
              </div>
            </div>
          )}
          
          <CardHeader className="flex-grow">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
              <Calendar className="w-3 h-3" />
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
              <span className="mx-1">•</span>
              <Clock className="w-3 h-3" />
              <span>5 min read</span>
            </div>
            <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {title || 'Untitled Post'}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {description || 'No description available.'}
            </CardDescription>
          </CardHeader>

          <CardFooter className="pt-0 flex items-center justify-between border-t border-white/10 mt-auto py-4">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 border border-white/20">
                {authorAvatar ? (
                  <AvatarImage src={authorAvatar} />
                ) : (
                  <AvatarFallback>{post.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium">{post.author?.name || 'Anonymous'}</span>
            </div>
            <div className="text-primary flex items-center text-sm font-semibold">
              Read More <ChevronRight className="ml-1 w-4 h-4" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}


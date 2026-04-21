'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAboutContent, getStrapiURL, renderBlocks, getTextContent } from '@/lib/strapi';
import { Skeleton } from '@/components/ui/skeleton';

export default function AboutPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getAboutContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse pt-12">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center glass rounded-3xl mt-12">
        <h1 className="text-3xl font-bold">About content not found</h1>
        <p className="text-muted-foreground mt-4">Please add content to the About single type in Strapi.</p>
      </div>
    );
  }

  const displayTitle = getTextContent(content.title);
  const displayDescription = getTextContent(content.description);
  const displayContent = content.content;
  const imageUrl = content.image ? getStrapiURL(content.image.url) : null;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold">{displayTitle || "About Us"}</h1>
          {displayDescription && <p className="text-xl text-muted-foreground">{displayDescription}</p>}
        </div>

        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl glass shadow-2xl">
            <img 
              src={imageUrl} 
              alt={displayTitle || "About us"}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="glass p-8 md:p-12 rounded-3xl prose prose-invert prose-lg max-w-none">
          {displayContent ? (
            renderBlocks(displayContent)
          ) : (
            <p className="text-muted-foreground text-center">No content blocks available.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}


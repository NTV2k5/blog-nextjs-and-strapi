import React from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Core fetch utility for Strapi
 */
async function fetchStrapi(endpoint: string, options: RequestInit = {}) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Strapi error:', error);
    throw new Error(`Strapi Fetch Error: ${response.statusText}`);
  }

  return response.json();
}

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  name: string;
  formats?: {
    small?: { url: string };
    medium?: { url: string };
    thumbnail?: { url: string };
  };
}

export interface Post {
  id: number;
  documentId: string;
  title: string | any;
  description: string | any;
  content: any; // Dynamic content from Strapi (Rich Text/Blocks)
  slug: string | any;
  createdAt: string;
  publishedAt: string;
  cover?: StrapiImage | StrapiImage[]; // Handle both single and multiple
  author?: {
    name: string;
    avatar?: StrapiImage;
  };
}

export const getPosts = async (revalidate: number = 3600) => {
  try {
    const response = await fetchStrapi('/posts?populate=*', {
      next: { revalidate },
    });
    return (response.data || []) as Post[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getLatestPosts = async (limit: number = 5, revalidate: number = 60) => {
  try {
    const response = await fetchStrapi(`/blog-lastest?limit=${limit}`, {
      next: { revalidate },
    });
    return (response.data || []) as Post[];
  } catch (error) {
    console.error(`Error fetching ${limit} latest posts:`, error);
    return [];
  }
};

export const getPostBySlug = async (slug: string, revalidate: number = 3600) => {
  try {
    const response = await fetchStrapi(`/posts?filters[slug][$eq]=${slug}&populate=*`, {
      next: { revalidate },
    });
    return (response.data?.[0] || null) as Post | null;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
};

export const getAboutContent = async () => {
  try {
    const response = await fetchStrapi('/about?populate=*', {
      next: { revalidate: 3600 },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching about content:', error);
    return null;
  }
};

export const getContactContent = async () => {
  try {
    const response = await fetchStrapi('/contact?populate=*', {
      next: { revalidate: 3600 },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contact content:', error);
    return null;
  }
};

export const getStrapiURL = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('//')) return path;
  return `${STRAPI_URL}${path}`;
};

// Utilities for rendering Strapi Blocks
export const getTextContent = (content: any): string => {
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

export const renderBlocks = (content: any) => {
  if (!content) return null;
  if (typeof content === 'string') return <p>{content}</p>;
  if (!Array.isArray(content)) return null;

  return content.map((block: any, i: number) => {
    switch (block.type) {
      case 'paragraph':
        return <p key={i}>{block.children?.map((c: any) => c.text).join('')}</p>;
      case 'heading':
        const HeadingTag = `h${block.level || 2}` as any;
        return <HeadingTag key={i} className={`font-bold mt-8 mb-4 ${block.level === 1 ? 'text-4xl' : 'text-2xl'}`}>{block.children?.map((c: any) => c.text).join('')}</HeadingTag>;
      default:
        return null;
    }
  });
};


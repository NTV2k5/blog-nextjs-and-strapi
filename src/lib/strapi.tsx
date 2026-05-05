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

export const getPosts = async (revalidate: number = 90) => {
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

export const getLatestPosts = async ({ 
  limit, 
  revalidate = 60 
}: { 
  limit?: number; 
  revalidate?: number 
} = {}) => {
  try {
    const url = limit ? `/blog-lastest?limit=${limit}` : '/blog-lastest';
    const response = await fetchStrapi(url, {
      next: { revalidate },
    });
    return (response.data || []) as Post[];
  } catch (error) {
    console.error(`Error fetching latest posts:`, error);
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

/**
 * Search posts by title, content, author name, or date
 */
export const searchPosts = async (query: string) => {
  if (!query) return [];
  
  try {
    const filters = [
      `filters[$or][0][title][$containsi]=${query}`,
      `filters[$or][1][description][$containsi]=${query}`,
      `filters[$or][2][content][$containsi]=${query}`,
      `filters[$or][3][author][name][$containsi]=${query}`,
      `filters[$or][4][publishedAt][$containsi]=${query}`,
    ].join('&');

    const response = await fetchStrapi(`/posts?${filters}&populate=*`, {
      cache: 'no-store',
    });
    
    return (response.data || []) as Post[];
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

/**
 * Fetch saved posts for the current user with deep population
 */
export const getSavedPosts = async (jwt: string) => {
  if (!jwt) return [];
  
  try {
    const response = await fetch(`${STRAPI_URL}/api/users/me?populate[saved_posts][populate][author][populate]=*&populate[saved_posts][populate][cover][populate]=*`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) return [];
    
    const userData = await response.json();
    return (userData.saved_posts || []) as Post[];
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return [];
  }
};

/**
 * Toggle saving a post for the current user
 */
export const toggleSavePost = async (jwt: string, userId: number, postId: number, isCurrentlySaved: boolean) => {
  try {
    const user = await fetch(`${STRAPI_URL}/api/users/me?populate=saved_posts`, {
      headers: { Authorization: `Bearer ${jwt}` },
    }).then(res => res.json());

    const currentSavedIds = user.saved_posts?.map((p: any) => p.id) || [];
    
    let newSavedIds;
    if (isCurrentlySaved) {
      newSavedIds = currentSavedIds.filter((id: number) => id !== postId);
    } else {
      newSavedIds = [...currentSavedIds, postId];
    }

    const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        saved_posts: newSavedIds
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error toggling save:', error);
    return false;
  }
};

/**
 * Toggle liking a post for the current user
 */
export const toggleLikePost = async (jwt: string, userId: number, postId: number, isCurrentlyLiked: boolean) => {
  try {
    const user = await fetch(`${STRAPI_URL}/api/users/me?populate=liked_posts`, {
      headers: { Authorization: `Bearer ${jwt}` },
    }).then(res => res.json());

    const currentLikedIds = user.liked_posts?.map((p: any) => p.id) || [];
    
    let newLikedIds;
    if (isCurrentlyLiked) {
      newLikedIds = currentLikedIds.filter((id: number) => id !== postId);
    } else {
      newLikedIds = [...currentLikedIds, postId];
    }

    const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        liked_posts: newLikedIds
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
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

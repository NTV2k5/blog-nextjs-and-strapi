'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Share2, Bookmark, Check, Copy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toggleSavePost, toggleLikePost } from '@/lib/strapi';

interface PostInteractionsProps {
  postId: number;
  postTitle: string;
  postSlug: string;
}

export default function PostInteractions({ postId, postTitle, postSlug }: PostInteractionsProps) {
  const { user, jwt } = useAuth();
  const router = useRouter();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. Kiểm tra trạng thái ban đầu từ Strapi khi component mount
  useEffect(() => {
    async function checkStatus() {
      if (user && jwt) {
        try {
          // Thêm cache: 'no-store' để tránh Next.js lưu cache kết quả cũ
          const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[saved_posts]=*&populate[liked_posts]=*`, {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: 'no-store'
          });
          if (response.ok) {
            const data = await response.json();
            // Đảm bảo so sánh đúng ID (có thể là p.id hoặc p.documentId tùy phiên bản Strapi)
            setIsSaved(data.saved_posts?.some((p: any) => p.id === postId) || false);
            setIsLiked(data.liked_posts?.some((p: any) => p.id === postId) || false);
          }
        } catch (error) {
          console.error('Error checking post status:', error);
        } finally {
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    }
    checkStatus();
  }, [user, jwt, postId]);

  // 2. Xử lý sự kiện Like
  const handleLike = async () => {
    if (!user || !jwt) {
      router.push('/login');
      return;
    }
    
    setLoadingLike(true);
    const success = await toggleLikePost(jwt, user.id, postId, isLiked);
    if (success) {
      setIsLiked(!isLiked);
    }
    setLoadingLike(false);
  };

  // 3. Xử lý sự kiện Save (Lưu bài viết)
  const handleSave = async () => {
    if (!user || !jwt) {
      router.push('/login');
      return;
    }
    
    setLoadingSave(true);
    const success = await toggleSavePost(jwt, user.id, postId, isSaved);
    if (success) {
      setIsSaved(!isSaved);
    }
    setLoadingSave(false);
  };

  // 4. Xử lý chia sẻ bài viết
  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${postSlug}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: `Check out this article: ${postTitle}`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center space-x-4 py-2">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        <span className="text-sm text-gray-500">Loading interactions...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        {/* Nút Like */}
        <button 
          onClick={handleLike}
          disabled={loadingLike}
          className={`group flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all border ${
            isLiked 
              ? 'bg-pink-500/10 border-pink-500/50 text-pink-500 shadow-lg shadow-pink-500/20' 
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
          } ${loadingLike ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loadingLike ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <motion.div
              whileTap={{ scale: 1.4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : 'group-hover:text-pink-500'}`} />
            </motion.div>
          )}
          <span className="text-sm font-bold">{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        {/* Nút Share */}
        <button 
          onClick={handleShare}
          className="relative flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full transition-all border border-white/10 text-gray-300 group"
        >
          <Share2 className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
          <span className="text-sm font-bold">Share</span>
          
          <AnimatePresence>
            {showCopyFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg shadow-xl flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Link Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Nút Save */}
      <button 
        onClick={handleSave}
        disabled={loadingSave}
        className={`group flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all border ${
          isSaved 
            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/20' 
            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
        } ${loadingSave ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loadingSave ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <motion.div
            whileTap={{ scale: 1.2 }}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'group-hover:text-blue-400'}`} />
          </motion.div>
        )}
        <span className="text-sm font-bold">{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}

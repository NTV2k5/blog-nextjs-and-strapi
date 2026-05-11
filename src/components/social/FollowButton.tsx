'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toggleFollow } from '@/lib/strapi';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetUserId: number;
  initialIsFollowing: boolean;
}

export default function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const { user, jwt } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  // Check initial follow status if user is logged in
  useEffect(() => {
    if (user && jwt) {
      const checkFollow = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=following`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
          const userData = await res.json();
          const isFollowed = userData.following?.some((u: any) => u.id === targetUserId);
          setIsFollowing(!!isFollowed);
        } catch (err) {
          console.error('Error checking follow status:', err);
        }
      };
      checkFollow();
    }
  }, [user, jwt, targetUserId]);

  const handleFollow = async () => {
    if (!user || !jwt) {
      toast.error('Please login to follow authors');
      return;
    }

    if (user.id === targetUserId) {
      toast.error("You can't follow yourself!");
      return;
    }

    setLoading(true);
    try {
      const success = await toggleFollow(jwt, user.id, targetUserId, isFollowing);
      if (success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed author' : 'Author followed!');
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      className={`px-10 py-6 rounded-2xl font-black transition-all ${
        isFollowing 
          ? 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white' 
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20'
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isFollowing ? (
        <><UserMinus className="w-5 h-5 mr-2" /> Unfollow</>
      ) : (
        <><UserPlus className="w-5 h-5 mr-2" /> Follow</>
      )}
    </Button>
  );
}

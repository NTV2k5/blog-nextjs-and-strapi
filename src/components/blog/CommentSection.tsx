'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchStrapi, getStrapiURL } from '@/lib/strapi';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Reply, Trash2, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Comment {
  id: number;
  documentId: string;
  content: string;
  createdAt: string;
  author_user?: {
    username: string;
    avatar?: { url: string };
  };
  replies?: Comment[];
  parent?: { id: number };
  status: 'approved' | 'pending' | 'blocked';
}

// ─── Reply Form: separate component with its own state ───
function ReplyForm({ 
  commentId, 
  username, 
  jwt, 
  postId, 
  onSuccess, 
  onCancel 
}: { 
  commentId: number; 
  username: string; 
  jwt: string; 
  postId: number; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blog-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            content: replyText,
            post: postId,
            parent: commentId,
            status: 'approved',
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to post reply');
      }

      if (result.data?.isSpam || result.data?.status === 'blocked') {
        toast.warning('Reply flagged as potential spam and sent for review.');
      } else {
        toast.success('Reply posted successfully!');
      }

      setReplyText('');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <Textarea
        placeholder={`Reply to ${username}...`}
        className="bg-white/5 border-white/10 rounded-2xl min-h-[100px] text-sm focus:ring-blue-500/50"
        value={replyText}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmitReply}
          disabled={loading || !replyText.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-xs"
        >
          {loading ? 'Posting...' : 'Post Reply'}
        </Button>
      </div>
    </div>
  );
}

// ─── Single Comment Item: standalone component ───
function CommentItem({
  comment,
  depth = 0,
  currentUsername,
  jwt,
  postId,
  onDelete,
  onReplySuccess,
}: {
  comment: Comment;
  depth?: number;
  currentUsername?: string;
  jwt: string | null;
  postId: number;
  onDelete: (documentId: string) => void;
  onReplySuccess: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const avatarUrl = comment.author_user?.avatar
    ? getStrapiURL(comment.author_user.avatar.url)
    : null;
  const isAuthor = currentUsername === comment.author_user?.username;

  const MAX_DEPTH = 2; // 0-indexed: levels 0, 1, 2 = 3 levels total

  return (
    <div className={`space-y-4 ${depth > 0 ? `${depth < 3 ? 'ml-8' : 'ml-4'} mt-4 border-l-2 border-white/5 pl-4` : ''}`}>
      <div className="flex gap-4 group">
        <Avatar className="w-10 h-10 border border-white/10 ring-2 ring-white/5">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} />
          ) : (
            <AvatarFallback>{comment.author_user?.username?.[0]}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-grow space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {comment.author_user?.username || 'Deleted User'}
            </span>
            <span className="text-[10px] text-white/30">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
            {comment.status === 'blocked' && (
              <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                <ShieldAlert size={10} /> Hidden
              </span>
            )}
          </div>

          <p className="text-sm text-white/70 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 pt-1">
            {depth < MAX_DEPTH && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Reply size={12} /> Reply
              </button>
            )}

            {isAuthor && (
              <button
                onClick={() => onDelete(comment.documentId)}
                className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>

          {showReply && jwt && (
            <ReplyForm
              commentId={comment.id}
              username={comment.author_user?.username || 'user'}
              jwt={jwt}
              postId={postId}
              onSuccess={() => {
                setShowReply(false);
                onReplySuccess();
              }}
              onCancel={() => setShowReply(false)}
            />
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          currentUsername={currentUsername}
          jwt={jwt}
          postId={postId}
          onDelete={onDelete}
          onReplySuccess={onReplySuccess}
        />
      ))}
    </div>
  );
}

// ─── Main Comment Section ───
export default function CommentSection({ postId }: { postId: number }) {
  const { user, jwt } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      // Fetch all comments for this post as a flat list (no nesting limit)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blog-comments/flat/${postId}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Failed to fetch comments');
      const json = await res.json();
      const flat: Comment[] = json.data || [];

      // Build tree client-side — supports any nesting depth (capped at 3 in UI)
      const map: Record<number, Comment> = {};
      const roots: Comment[] = [];

      flat.forEach((c) => {
        map[c.id] = { ...c, replies: [] };
      });

      flat.forEach((c) => {
        if (c.parent?.id && map[c.parent.id]) {
          map[c.parent.id].replies!.push(map[c.id]);
        } else {
          roots.push(map[c.id]);
        }
      });

      setComments(roots);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!jwt) {
      toast.error('Please login to comment');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blog-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            content: newComment,
            post: postId,
            status: 'approved',
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Strapi Error Detail:', result);
        throw new Error(result.error?.message || 'Failed to post comment');
      }

      if (result.data?.isSpam || result.data?.status === 'blocked') {
        toast.warning('Comment flagged as potential spam and sent for review.');
      } else {
        toast.success('Comment posted successfully!');
      }

      setNewComment('');
      setTimeout(() => fetchComments(), 500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    if (!jwt) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blog-comments/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!res.ok) throw new Error();

      toast.success('Comment deleted');
      fetchComments();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleReplySuccess = useCallback(() => {
    setTimeout(() => fetchComments(), 500);
  }, [fetchComments]);

  return (
    <section className="mt-20 pt-12 border-t border-white/10">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <MessageSquare className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Community Discussion</h2>
          <p className="text-sm text-white/40">Share your thoughts with the community</p>
        </div>
      </div>

      {/* New comment form */}
      <div className="mb-12 space-y-4">
        <Textarea
          placeholder={user ? 'Write a comment...' : 'Please login to comment'}
          disabled={!user}
          className="bg-white/5 border-white/10 rounded-[32px] p-6 min-h-[120px] text-base focus:ring-blue-500/50 transition-all"
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
        />
        {user && (
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading || !newComment.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-8 py-6 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all"
            >
              {loading ? (
                'Posting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Post Comment
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-10">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUsername={user?.username}
              jwt={jwt}
              postId={postId}
              onDelete={handleDelete}
              onReplySuccess={handleReplySuccess}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
            <p className="text-white/20 italic font-medium">
              No comments yet. Be the first to start the conversation!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

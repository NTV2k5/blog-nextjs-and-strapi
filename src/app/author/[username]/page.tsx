import React from 'react';
import { getUserByUsername, getPosts, getStrapiURL } from '@/lib/strapi';
import { notFound } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/glass/PostCard';
import { ClientMotionWrapper } from '@/components/glass/ClientMotionWrapper';
import { MapPin, Link as LinkIcon, Calendar, Users, Briefcase } from 'lucide-react';
import FollowButton from '@/components/social/FollowButton';

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;
  const author = await getUserByUsername(username);

  if (!author) {
    notFound();
  }

  const posts = await getPosts(60, username);
  const avatarUrl = author.avatar ? getStrapiURL(author.avatar.url) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Profile Section */}
      <ClientMotionWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-20"
      >
        <div className="p-12 rounded-[50px] bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden relative group">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full -ml-48 -mb-48" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
            <div className="relative">
              <Avatar className="w-40 h-40 border-4 border-white/10 shadow-2xl ring-4 ring-white/5">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} />
                ) : (
                  <AvatarFallback className="text-4xl font-black bg-blue-600/20 text-blue-400">
                    {author.username[0].toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 rounded-2xl shadow-xl border-4 border-white/5">
                <Briefcase size={20} className="text-white" />
              </div>
            </div>

            <div className="flex-grow text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-5xl font-black text-white tracking-tighter">{author.username}</h1>
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 font-bold px-4 py-1">Verified Author</Badge>
                </div>
                <p className="text-xl text-white/50 font-medium">{author.jobTitle || 'Digital Creator & Storyteller'}</p>
              </div>

              <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
                {author.bio || "Crafting digital experiences and sharing insights into the world of technology, design, and beyond. Join me on this creative journey."}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-white/40">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-white">{author.followers?.length || 0}</span> Followers
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-400" />
                  Joined {new Date(author.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <FollowButton targetUserId={author.id} initialIsFollowing={false} />
                <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                  <LinkIcon size={18} /> Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </ClientMotionWrapper>

      {/* Author's Posts Section */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tight">Published Works</h2>
            <p className="text-white/40 font-medium">Explore articles written by {author.username}</p>
          </div>
          <div className="hidden md:block h-px flex-grow mx-12 bg-white/5" />
          <div className="text-right">
            <span className="text-4xl font-black text-white/10 tracking-tighter">{posts.length}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Articles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
              <p className="text-xl text-white/20 font-bold italic">This author hasn't shared any stories yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

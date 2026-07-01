import React from 'react';
import { getUserByUsername, getPosts, getStrapiURL } from '@/lib/strapi';
import { notFound } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/glass/PostCard';
import { ClientMotionWrapper } from '@/components/glass/ClientMotionWrapper';
import { MapPin, Calendar, Users, Briefcase, Globe, FileText } from 'lucide-react';
import FollowButton from '@/components/social/FollowButton';
import Link from 'next/link';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;

  // Guard: if username is literally "undefined", show 404
  if (!username || username === 'undefined') {
    notFound();
  }

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
                  <h1 className="text-5xl font-black text-white tracking-tighter">@{author.username}</h1>
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 font-bold px-4 py-1">
                    Author
                  </Badge>
                </div>
                <p className="text-xl text-white/50 font-medium">
                  {author.jobTitle || 'Digital Creator & Storyteller'}
                </p>
              </div>

              <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
                {author.bio || 'Crafting digital experiences and sharing insights into the world of technology, design, and beyond.'}
              </p>

              {/* Meta info row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-white/40">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-white">{posts.length}</span> Articles
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-purple-400" />
                  <span className="text-white">{author.followers?.length || 0}</span> Followers
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-green-400" />
                  Joined {new Date(author.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                {author.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-rose-400" />
                    {author.location}
                  </div>
                )}
              </div>

              {/* Action buttons + Social links */}
              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <FollowButton targetUserId={author.id} initialIsFollowing={false} />

                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <Globe size={18} /> Portfolio
                  </a>
                )}

                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <XIcon />
                  </a>
                )}

                {author.github && (
                  <a
                    href={`https://github.com/${author.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <GithubIcon />
                  </a>
                )}
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
            <p className="text-white/40 font-medium">Explore articles written by @{author.username}</p>
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
              <p className="text-xl text-white/20 font-bold italic">
                This author hasn&apos;t shared any stories yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

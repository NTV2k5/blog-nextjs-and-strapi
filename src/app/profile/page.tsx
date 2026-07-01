'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  User, Mail, Briefcase, MapPin, Link2,
  Camera, Save, CheckCircle2, AlertCircle, Loader2, FileText, Heart, Bookmark as BookmarkIcon,
} from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export default function ProfilePage() {
  const { user, jwt, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    jobTitle: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState({ posts: 0, likes: 0, saved: 0 });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load profile data from Strapi
  useEffect(() => {
    if (!user || !jwt) return;
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[avatar]=*&populate[liked_posts]=*&populate[saved_posts]=*&populate[posts]=*`,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setProfile({
            username: data.username || '',
            email: data.email || '',
            bio: data.bio || '',
            jobTitle: data.jobTitle || '',
            location: data.location || '',
            website: data.website || '',
            twitter: data.twitter || '',
            github: data.github || '',
          });
          if (data.avatar?.url) {
            setAvatarUrl(`${process.env.NEXT_PUBLIC_STRAPI_URL}${data.avatar.url}`);
          }
          setStats({
            posts: data.posts?.length || 0,
            likes: data.liked_posts?.length || 0,
            saved: data.saved_posts?.length || 0,
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    load();
  }, [user, jwt]);

  const handleSave = async () => {
    if (!user || !jwt) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          bio: profile.bio,
          jobTitle: profile.jobTitle,
          location: profile.location,
          website: profile.website,
          twitter: profile.twitter,
          github: profile.github,
        }),
      });
      if (res.ok) {
        setSaveStatus('success');
        await refreshUser();
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm";

  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white">My Profile</h1>
            <p className="text-white/40 mt-1">Manage your public profile and settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/20"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> :
              saveStatus === 'success' ? <CheckCircle2 size={18} /> :
              saveStatus === 'error' ? <AlertCircle size={18} /> :
              <Save size={18} />}
            {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save Changes'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Articles', value: stats.posts, icon: FileText, color: 'text-blue-400' },
            { label: 'Liked', value: stats.likes, icon: Heart, color: 'text-pink-400' },
            { label: 'Saved', value: stats.saved, icon: BookmarkIcon, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-md">
              <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-sm text-white/40 font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Column */}
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 border-4 border-white/10 mx-auto">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} />
                  ) : (
                    <AvatarFallback className="text-4xl font-black bg-blue-600/20 text-blue-400">
                      {profile.username[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full border-4 border-black/50 cursor-pointer hover:bg-blue-500 transition-colors">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
              <div>
                <p className="font-bold text-white text-lg">@{profile.username}</p>
                <p className="text-sm text-white/40">{profile.email}</p>
              </div>
              <p className="text-xs text-white/30 italic">
                Avatar upload via Strapi Admin Panel
              </p>
            </div>

            {/* Public Profile Link */}
            <a
              href={`/author/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 justify-center w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <User size={16} />
              View Public Profile
            </a>
          </div>

          {/* Fields Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
              <h2 className="text-lg font-bold text-white">About Me</h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={12} /> Job Title
                </label>
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={e => setProfile(p => ({ ...p, jobTitle: e.target.value }))}
                  placeholder="e.g. Full-Stack Developer"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell readers about yourself..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={12} /> Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Ho Chi Minh City, Vietnam"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
              <h2 className="text-lg font-bold text-white">Links & Social</h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Link2 size={12} /> Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://your-website.com"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <XIcon /> Twitter / X
                </label>
                <input
                  type="text"
                  value={profile.twitter}
                  onChange={e => setProfile(p => ({ ...p, twitter: e.target.value }))}
                  placeholder="@yourhandle"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <GithubIcon /> GitHub
                </label>
                <input
                  type="text"
                  value={profile.github}
                  onChange={e => setProfile(p => ({ ...p, github: e.target.value }))}
                  placeholder="yourusername"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Account Info (readonly) */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
              <h2 className="text-lg font-bold text-white">Account</h2>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <User size={12} /> Username
                </label>
                <input type="text" value={profile.username} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={12} /> Email
                </label>
                <input type="email" value={profile.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
              <a
                href="/change-password"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Change Password →
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

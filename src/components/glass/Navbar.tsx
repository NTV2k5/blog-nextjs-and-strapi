'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, LogOut, Key, ChevronDown, LogIn, UserPlus, X, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="glass-navbar mt-6 flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        GlassBlog
      </Link>
      
      <div className="hidden md:flex items-center space-x-8 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex items-center">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.form 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '200px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onSubmit={handleSearch}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-500"
                />
              </motion.form>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => {
              if (isSearchOpen && searchQuery) {
                handleSearch({ preventDefault: () => {} } as any);
              } else {
                setIsSearchOpen(!isSearchOpen);
              }
            }}
            className={`p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center ${isSearchOpen ? 'absolute right-0' : ''}`}
          >
            {isSearchOpen && !searchQuery ? (
              <X className="w-5 h-5 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setIsSearchOpen(false); }} />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-200 hidden sm:inline">{user.username}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium text-gray-200 truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    href="/saved" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all group"
                  >
                    <Bookmark className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                    Saved Articles
                  </Link>

                  <Link 
                    href="/change-password" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all group"
                  >
                    <Key className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                    Change Password
                  </Link>
                  
                  <button 
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all group mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              href="/login" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

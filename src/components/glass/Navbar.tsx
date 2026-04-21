'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass-navbar mt-6 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        GlassBlog
      </Link>
      
      <div className="hidden md:flex items-center space-x-8 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

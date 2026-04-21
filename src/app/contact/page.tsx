'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getContactContent } from '@/lib/strapi';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getContactContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) return <div className="py-20 text-center">Loading...</div>;

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center glass rounded-3xl mt-12">
        <h1 className="text-3xl font-bold">Contact content not found</h1>
        <p className="text-muted-foreground mt-4">Please add content to the Contact single type in Strapi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              {content.description}
            </p>
          </div>

          <div className="space-y-6">
            {content.email && (
              <div className="flex items-center space-x-4 p-6 glass rounded-2xl">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold">{content.email}</p>
                </div>
              </div>
            )}
            
            {content.address && (
              <div className="flex items-center space-x-4 p-6 glass rounded-2xl">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Office</p>
                  <p className="text-lg font-semibold">{content.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 p-6 glass rounded-2xl">
              <div className="p-3 bg-primary/20 rounded-xl">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Support</p>
                <p className="text-lg font-semibold">Online Chat Available</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-3xl space-y-6 border-white/20 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 resize-none" placeholder="How can we help?"></textarea>
            </div>
          </div>
          <button className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
            <span>Send Message</span>
            <Send className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}


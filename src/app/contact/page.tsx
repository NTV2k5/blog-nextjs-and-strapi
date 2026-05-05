'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getContactContent } from '@/lib/strapi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactInput } from '@/lib/validations';
import { Mail, MessageSquare, MapPin, Send, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getContactContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Contact form data:', data);
    setSubmitSuccess(true);
    setIsSubmitting(false);
    reset();
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

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
          {submitSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm animate-in fade-in slide-in-from-top-4">
              Thank you! Your message has been sent successfully.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input 
                    {...register('firstName')}
                    type="text" 
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all ${
                      errors.firstName ? 'border-red-500/50' : 'border-white/10'
                    }`} 
                    placeholder="John" 
                  />
                  {errors.firstName && <p className="text-xs text-red-400 ml-1">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input 
                    {...register('lastName')}
                    type="text" 
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all ${
                      errors.lastName ? 'border-red-500/50' : 'border-white/10'
                    }`} 
                    placeholder="Doe" 
                  />
                  {errors.lastName && <p className="text-xs text-red-400 ml-1">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  {...register('email')}
                  type="email" 
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all ${
                    errors.email ? 'border-red-500/50' : 'border-white/10'
                  }`} 
                  placeholder="john@example.com" 
                />
                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  {...register('message')}
                  rows={4} 
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/50 resize-none transition-all ${
                    errors.message ? 'border-red-500/50' : 'border-white/10'
                  }`} 
                  placeholder="How can we help?"
                ></textarea>
                {errors.message && <p className="text-xs text-red-400 ml-1">{errors.message.message}</p>}
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


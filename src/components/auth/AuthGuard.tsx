'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import LoginPage from '@/app/(auth)/login/page';
import SignupPage from '@/app/(auth)/signup/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Define public routes that don't require authentication
  const isAuthPage = pathname === '/login' || 
                     pathname === '/signup' || 
                     pathname === '/forgot-password' ||
                     pathname.startsWith('/reset-password');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-gray-400 font-medium animate-pulse">Initializing your experience...</p>
      </div>
    );
  }

  // If not logged in and trying to access a protected page
  if (!user && !isAuthPage) {
    return <LoginPage />;
  }

  // If already logged in and trying to access auth pages (except change-password which we kept outside (auth) group or specifically handled)
  // But usually we redirect to home if logged in and trying to access login/signup
  if (user && isAuthPage) {
    router.push('/');
  }

  return <>{children}</>;
}

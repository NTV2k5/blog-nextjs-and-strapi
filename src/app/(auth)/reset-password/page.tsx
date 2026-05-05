'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from '@/lib/auth';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations';
import { Lock, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!code) {
      setError('Invalid or missing reset code. Please check your email link.');
    }
  }, [code]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError('');

    try {
      await resetPassword({
        code,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The code may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="relative group w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              New Password
            </h1>
            <p className="text-gray-400 mt-2">Set a secure password for your account</p>
          </div>

          {(error || Object.keys(errors).length > 0) && (
            <div className="flex flex-col gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-4">
              {error && (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {Object.values(errors).map((err, index) => (
                <div key={index} className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{err?.message}</p>
                </div>
              ))}
            </div>
          )}

          {success ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Password Reset!</h3>
              <p className="text-gray-400 mb-8">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Link 
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className={`block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                      errors.password ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="Minimum 6 characters"
                    disabled={!code}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('passwordConfirmation')}
                    type="password"
                    className={`block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                      errors.passwordConfirmation ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="Repeat new password"
                    disabled={!code}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !code}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
              
              {!code && (
                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-blue-400 text-sm hover:underline">
                    Request a new link
                  </Link>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

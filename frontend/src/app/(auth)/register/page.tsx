'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { api } from '@/lib/api';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // 1. Create the account via API client
      await api.auth.register({
        name,
        email,
        username,
        password,
      });

      // 2. Automatically log the user in on successful registration
      const signinRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (signinRes?.error) {
        setError('Account created, but sign in failed. Please sign in manually.');
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setLoading(false);
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err.message || 'An error occurred during registration.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative font-sans">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-850 p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/25 mb-4">
            FS
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Begin Your Growth RPG</span>
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              disabled={loading}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-[10px] font-semibold">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_monk"
              disabled={loading}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
            {fieldErrors.username && (
              <p className="text-red-400 text-[10px] font-semibold">{fieldErrors.username[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              disabled={loading}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-[10px] font-semibold">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="password">
              Password (Min 8 chars)
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-400 text-[10px] font-semibold">{fieldErrors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

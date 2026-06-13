'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Flame, Brain, Award, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-transparent -z-10 pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
            FS
          </div>
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FLOW STATE
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col items-center justify-center py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-8 shadow-inner animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gamified RPG Productivity Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Unleash Your Full{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Consistency Engine
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
          Transform your growth by tracking habits, completing focused pomodoro sessions, unlocking RPG achievements, and mapping your journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          {session ? (
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 text-base transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 text-base transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Start Seeding Habits</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="bg-slate-900/50 border border-slate-850 p-8 rounded-2xl backdrop-blur-sm shadow-sm hover:border-slate-800 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">RPG Streaks & Levels</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Earn XP for every habit completion and deep focus session. Level up and earn grand consistency titles.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-850 p-8 rounded-2xl backdrop-blur-sm shadow-sm hover:border-slate-800 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Deep Focus Center</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Log Pomodoro, deep work, or custom focus session times. Record interruptions and logs seamlessly.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-850 p-8 rounded-2xl backdrop-blur-sm shadow-sm hover:border-slate-800 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Achievements Ledger</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Unlock unique achievements automatically as you improve. Secure bonus XP payouts on unlocking.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full px-6 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Local Development Build</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Flow State. All rights reserved.</p>
      </footer>
    </div>
  );
}

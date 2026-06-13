'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import {
  Flame,
  Brain,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  Timer,
  BookOpen,
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, update: updateSession } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await api.dashboard.get();
        setData(dashboardData);

        // Update NextAuth session if backend levels / XP changed compared to JWT
        if (
          session?.user &&
          dashboardData?.user &&
          (session.user.xp !== dashboardData.user.xp ||
            session.user.level !== dashboardData.user.level ||
            session.user.title !== dashboardData.user.title)
        ) {
          await updateSession({
            xp: dashboardData.user.xp,
            level: dashboardData.user.level,
            title: dashboardData.user.title,
          });
        }
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, updateSession]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl max-w-xl mx-auto my-8">
        <p className="font-semibold">Error Loading Dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const { user, levelProgress, today, recentActivity, activeSession } = data;

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-xl relative">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Welcome, {user.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-3">
            Ready to achieve your Flow State?
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Consistency breeds excellence. Check off your habits, log reflections, and complete deep focus intervals to rank up.
          </p>
          <div className="flex gap-4">
            <Link
              href="/focus"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Start Focus Session</span>
            </Link>
            <Link
              href="/habits"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Manage Habits</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Streak
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {user.currentStreak} Days
            </span>
            <span className="text-xs text-slate-500 block mt-1 font-medium">
              Longest: {user.longestStreak} days
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500/15" />
          </div>
        </div>

        {/* Level card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Character Level
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              Lvl {user.level}
            </span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold text-indigo-600 truncate max-w-[150px]">
              {user.title}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Habits completed today */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Habits Completed
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {today.habitsCompleted} / {today.habitsTotal}
            </span>
            <span className="text-xs text-slate-500 block mt-1 font-medium">
              Total completed: {user.totalHabitsCompleted}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Focus time today */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Focus Minutes
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {today.focusMinutes} Min
            </span>
            <span className="text-xs text-slate-500 block mt-1 font-medium">
              Total focus: {user.totalFocusMinutes} min
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
            <Brain className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active focus session alert */}
          {activeSession && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-900">
                    Active Focus Session Running
                  </h4>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Started at {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                </div>
              </div>
              <Link
                href="/focus"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
              >
                Resume Session
              </Link>
            </div>
          )}

          {/* Today's Stats & Level Progress card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Progression Progression</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span>Level {user.level} Progress</span>
                  <span>{user.xp} / {levelProgress.nextLevelXP} XP ({levelProgress.progress}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${levelProgress.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    XP Gained Today
                  </span>
                  <span className="block text-xl font-bold text-indigo-600 mt-1">
                    +{today.xpEarned} XP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Completion Rate
                  </span>
                  <span className="block text-xl font-bold text-emerald-600 mt-1">
                    {today.habitsTotal > 0
                      ? Math.round((today.habitsCompleted / today.habitsTotal) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Focus Target
                  </span>
                  <span className="block text-xl font-bold text-purple-600 mt-1">
                    {today.focusMinutes} / 45 m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Recent Activity</span>
              </h3>
              <Link
                href="/analytics"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Full Logs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent activity logs. Complete a habit to see it here!
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity: any) => (
                  <div
                    key={activity._id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: activity.habit?.color || '#3b82f6' }}
                      />
                      <div>
                        <span className="font-semibold text-xs text-slate-700 block">
                          {activity.habit?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {new Date(activity.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activity.habit?.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      +{activity.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Quick Reflection card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Daily Reflection</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take a quick moment to record your thoughts, mood, and stress levels for today.
              </p>
            </div>
            <Link
              href="/journal"
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 transition-all mt-4 border border-slate-800"
            >
              <span>Write reflection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Daily Advice Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-950 p-6 rounded-xl text-white border border-indigo-950 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Coaching Tip</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              &quot;You usually schedule coding sessions early. To maximize efficiency, do your hardest habits first thing in the morning when your cognitive reserves are full.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

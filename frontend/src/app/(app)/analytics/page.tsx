'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, Brain, CheckCircle2, TrendingUp, CalendarDays } from 'lucide-react';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(30);

  const loadData = async (days: number) => {
    try {
      setLoading(true);
      const res = await api.analytics.overview();
      setOverview(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange]);

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
        <p className="font-semibold">Error Loading Analytics</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const { weekly, monthly, totalHabits, user } = overview;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Analytics</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Visualize your consistency and track your long-term growth.
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 shrink-0"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Habits
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {totalHabits}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Completion Rate (Month)
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {monthly?.completionRate || 0}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Focus Minutes (Month)
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {monthly?.focusMinutes || 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
            <Brain className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Longest Streak
            </span>
            <span className="text-3xl font-extrabold text-slate-800 block">
              {user?.longestStreak || 0} days
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Activity Chart (Simplified UI implementation for now) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span>Recent Activity (Last 7 Days)</span>
          </h3>

          <div className="space-y-4">
            {weekly?.snapshots?.length > 0 ? (
              weekly.snapshots.map((snapshot: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-xs font-bold text-slate-500">
                    {new Date(snapshot.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(100, (snapshot.habitsCompleted / Math.max(1, snapshot.habitsTotal)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-xs font-bold text-slate-700">
                    {snapshot.habitsCompleted}/{snapshot.habitsTotal}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No data available for the selected period.
              </div>
            )}
          </div>
        </div>

        {/* Focus Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>Focus Time (Last 7 Days)</span>
          </h3>

          <div className="space-y-4">
            {weekly?.snapshots?.length > 0 ? (
              weekly.snapshots.map((snapshot: any, i: number) => {
                const maxMinutes = Math.max(...weekly.snapshots.map((s: any) => s.focusMinutes || 0), 120);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 shrink-0 text-xs font-bold text-slate-500">
                      {new Date(snapshot.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${Math.min(100, (snapshot.focusMinutes / maxMinutes) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-xs font-bold text-slate-700">
                      {snapshot.focusMinutes}m
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No data available for the selected period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

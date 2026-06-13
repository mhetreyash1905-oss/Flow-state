'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Flame, Calendar, Sparkles } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;

  // Derive page title from path
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const firstSegment = segments[0];
    switch (firstSegment) {
      case 'dashboard':
        return 'Dashboard';
      case 'habits':
        return 'Habit Hub';
      case 'focus':
        return 'Focus Center';
      case 'journal':
        return 'Daily Journal';
      case 'achievements':
        return 'Achievements';
      case 'analytics':
        return 'Analytics Overview';
      default:
        return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{getPageTitle()}</h2>
      </div>

      {/* Stats and Profile */}
      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formattedDate}</span>
        </div>

        {/* Quick Progression Info */}
        {user && (
          <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
            {/* Level Badge */}
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-bold text-indigo-600">
              <Sparkles className="w-3.5 h-3.5 fill-indigo-600/10" />
              <span>Level {user.level || 1}</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 text-xs font-bold text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-600/10" />
              <span>{(user as any).currentStreak || 0} Day Streak</span>
            </div>

            {/* User display */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                {user.username ? `@${user.username}` : user.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

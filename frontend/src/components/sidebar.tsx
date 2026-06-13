'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BookOpen,
  Award,
  TrendingUp,
  LogOut,
  Flame,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/focus', label: 'Focus Center', icon: Timer },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/achievements', label: 'Achievements', icon: Award },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const title = user?.title || 'Beginner';

  // Calculate XP threshold for current level and next level
  const currentLevelXP = Math.floor(100 * Math.pow(level, 1.5));
  const nextLevelXP = Math.floor(100 * Math.pow(level + 1, 1.5));
  const xpProgress = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = xpNeeded > 0 ? Math.min(100, Math.max(0, Math.round((xpProgress / xpNeeded) * 100))) : 100;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-500/20">
          FS
        </div>
        <div>
          <h1 className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
            FLOW STATE
          </h1>
          <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
            Consistency Engine
          </p>
        </div>
      </div>

      {/* User Character Profile Summary */}
      {user && (
        <div className="p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 shadow-inner">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm text-slate-100 truncate">{user.name}</h2>
              <p className="text-xs text-indigo-400 font-medium truncate">{title}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 text-xs text-amber-500 font-bold shrink-0">
              <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{(user as any).currentStreak || 0}</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>Lvl {level}</span>
              <span>{xp} / {nextLevelXP} XP</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

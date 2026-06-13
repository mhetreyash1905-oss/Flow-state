import type { HabitDifficulty } from '../shared/types';

// XP rewards by habit difficulty
export const XP_REWARDS: Record<HabitDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  extreme: 100,
};

// XP for focus sessions (per minute)
export const FOCUS_XP_PER_MINUTE = 2;

// Minimum session duration (minutes) to earn XP
export const MIN_FOCUS_DURATION_FOR_XP = 5;

// Streak bonus XP milestones
export const STREAK_MILESTONES: Record<number, number> = {
  3: 25,
  7: 75,
  14: 150,
  30: 500,
  50: 1000,
  100: 2500,
  365: 10000,
};

// Level thresholds: level N requires LEVEL_THRESHOLDS[N] total XP
export function getXPForLevel(level: number): number {
  // Formula: XP = 100 * level^1.5 (cumulative)
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (getXPForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

// Titles by level ranges
export const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Beginner' },
  { minLevel: 5, title: 'Apprentice' },
  { minLevel: 10, title: 'Practitioner' },
  { minLevel: 15, title: 'Consistency Monk' },
  { minLevel: 20, title: 'Focus Adept' },
  { minLevel: 25, title: 'Discipline Knight' },
  { minLevel: 30, title: 'Habit Alchemist' },
  { minLevel: 40, title: 'Deep Work Wizard' },
  { minLevel: 50, title: 'Focus Beast' },
  { minLevel: 60, title: 'Discipline King' },
  { minLevel: 75, title: 'Grandmaster' },
  { minLevel: 100, title: 'Flow State Legend' },
];

export function getTitleForLevel(level: number): string {
  let title = 'Beginner';
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.minLevel) {
      title = entry.title;
    }
  }
  return title;
}

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Habit categories with display info
export const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  health: { label: 'Health', color: '#10b981' },
  productivity: { label: 'Productivity', color: '#3b82f6' },
  learning: { label: 'Learning', color: '#8b5cf6' },
  fitness: { label: 'Fitness', color: '#ef4444' },
  mindfulness: { label: 'Mindfulness', color: '#06b6d4' },
  creativity: { label: 'Creativity', color: '#f59e0b' },
  social: { label: 'Social', color: '#ec4899' },
  other: { label: 'Other', color: '#6b7280' },
};

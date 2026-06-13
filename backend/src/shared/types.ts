import { Types } from 'mongoose';

// ---- Enums ----

export const HABIT_CATEGORIES = [
  'health', 'productivity', 'learning', 'fitness',
  'mindfulness', 'creativity', 'social', 'other',
] as const;
export type HabitCategory = typeof HABIT_CATEGORIES[number];

export const HABIT_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
export type HabitFrequency = typeof HABIT_FREQUENCIES[number];

export const HABIT_DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'] as const;
export type HabitDifficulty = typeof HABIT_DIFFICULTIES[number];

export const FOCUS_SESSION_TYPES = ['pomodoro', 'deepwork', 'custom'] as const;
export type FocusSessionType = typeof FOCUS_SESSION_TYPES[number];

export const FOCUS_SESSION_STATUSES = ['active', 'completed', 'cancelled', 'paused'] as const;
export type FocusSessionStatus = typeof FOCUS_SESSION_STATUSES[number];

export const ACHIEVEMENT_CATEGORIES = ['habits', 'focus', 'streaks', 'general'] as const;
export type AchievementCategory = typeof ACHIEVEMENT_CATEGORIES[number];

export const XP_SOURCES = ['habit', 'focus', 'achievement', 'streak', 'bonus'] as const;
export type XPSource = typeof XP_SOURCES[number];

export const STREAK_EVENT_TYPES = ['started', 'milestone', 'broken', 'restored'] as const;
export type StreakEventType = typeof STREAK_EVENT_TYPES[number];

// ---- Interfaces ----

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  xp: number;
  level: number;
  title: string;
  currentStreak: number;
  longestStreak: number;
  totalFocusMinutes: number;
  totalHabitsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabit {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  difficulty: HabitDifficulty;
  xpReward: number;
  targetCount: number;
  color?: string;
  icon?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitLog {
  _id: Types.ObjectId;
  habitId: Types.ObjectId;
  userId: Types.ObjectId;
  completedAt: Date;
  xpEarned: number;
  note?: string;
  createdAt: Date;
}

export interface IHabitTemplate {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  difficulty: HabitDifficulty;
  icon?: string;
  isSystem: boolean;
  createdAt: Date;
}

export interface IFocusSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: FocusSessionType;
  status: FocusSessionStatus;
  duration: number;
  actualDuration: number;
  startedAt: Date;
  completedAt?: Date;
  xpEarned: number;
  interruptions: number;
  label?: string;
  notes?: string;
  createdAt: Date;
}

export interface IAchievement {
  _id: Types.ObjectId;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  condition: {
    type: string;
    threshold: number;
  };
  createdAt: Date;
}

export interface IUserAchievement {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  achievementId: Types.ObjectId;
  unlockedAt: Date;
  createdAt: Date;
}

export interface IXPTransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  source: XPSource;
  sourceId?: Types.ObjectId;
  description: string;
  createdAt: Date;
}

export interface IDailySnapshot {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  habitsCompleted: number;
  habitsTotal: number;
  focusMinutes: number;
  focusSessions: number;
  xpEarned: number;
  streak: number;
  mood?: number;
  energy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStreakHistory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: StreakEventType;
  streakCount: number;
  date: Date;
  habitId?: Types.ObjectId;
  createdAt: Date;
}

export interface IJournalEntry {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  content: string;
  mood?: number;
  energy?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

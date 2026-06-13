import { Types } from 'mongoose';
import { User } from '../auth/user.model';
import { XPTransaction } from './xp-transaction.model';
import { DailySnapshot } from '../analytics/daily-snapshot.model';
import { connectDB } from '../../config/db';
import { getLevelFromXP, getTitleForLevel } from '../../config/constants';
import type { XPSource } from '../../shared/types';
import { checkAndUnlockAchievements } from './achievement.service';

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Central XP award function. ALL XP in the system goes through here.
 * 1. Creates XPTransaction record
 * 2. Updates user.xp, user.level, user.title
 * 3. Updates DailySnapshot.xpEarned
 * 4. Triggers achievement checks
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: XPSource,
  description: string,
  sourceId?: string
): Promise<{ newXP: number; newLevel: number; newTitle: string; leveledUp: boolean }> {
  await connectDB();

  if (amount <= 0) {
    throw new Error('XP amount must be positive');
  }

  // 1. Create transaction record
  await XPTransaction.create({
    userId: new Types.ObjectId(userId),
    amount,
    source,
    sourceId: sourceId ? new Types.ObjectId(sourceId) : undefined,
    description,
  });

  // 2. Update user XP and recalculate level
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oldLevel = user.level;
  const newXP = user.xp + amount;
  const newLevel = getLevelFromXP(newXP);
  const newTitle = getTitleForLevel(newLevel);
  const leveledUp = newLevel > oldLevel;

  await User.findByIdAndUpdate(userId, {
    xp: newXP,
    level: newLevel,
    title: newTitle,
  });

  // 3. Update daily snapshot
  const today = getStartOfDay();
  await DailySnapshot.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), date: today },
    { $inc: { xpEarned: amount } },
    { upsert: true, new: true }
  );

  // 4. Check for achievement unlocks (non-blocking)
  checkAndUnlockAchievements(userId).catch(console.error);

  return { newXP, newLevel, newTitle, leveledUp };
}

export async function getXPHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ transactions: any[]; total: number; page: number; totalPages: number }> {
  await connectDB();

  const skip = (page - 1) * limit;
  const userObjId = new Types.ObjectId(userId);

  const [transactions, total] = await Promise.all([
    XPTransaction.find({ userId: userObjId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    XPTransaction.countDocuments({ userId: userObjId }),
  ]);

  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getGamificationProfile(userId: string) {
  await connectDB();

  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const nextLevelXP = Math.floor(100 * Math.pow(user.level + 1, 1.5));
  const currentLevelXP = Math.floor(100 * Math.pow(user.level, 1.5));
  const xpProgress = user.xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  return {
    xp: user.xp,
    level: user.level,
    title: user.title,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalFocusMinutes: user.totalFocusMinutes,
    totalHabitsCompleted: user.totalHabitsCompleted,
    nextLevelXP,
    xpProgress,
    xpNeeded,
    progressPercent: xpNeeded > 0 ? Math.round((xpProgress / xpNeeded) * 100) : 100,
  };
}

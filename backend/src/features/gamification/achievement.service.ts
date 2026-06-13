import { Types } from 'mongoose';
import { Achievement } from './achievement.model';
import { UserAchievement } from './user-achievement.model';
import { User } from '../auth/user.model';
import { HabitLog } from '../habits/habit-log.model';
import { FocusSession } from '../focus/focus-session.model';
import { XPTransaction } from './xp-transaction.model';
import { DailySnapshot } from '../analytics/daily-snapshot.model';
import { connectDB } from '../../config/db';
import type { IAchievement } from '../../shared/types';

/**
 * Checks all achievements for a user and unlocks any newly qualified ones.
 * Called automatically after XP awards.
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  await connectDB();

  const userObjId = new Types.ObjectId(userId);

  // Get all achievements and user's already unlocked ones
  const [allAchievements, unlockedIds] = await Promise.all([
    Achievement.find().lean(),
    UserAchievement.find({ userId: userObjId }).distinct('achievementId'),
  ]);

  const unlockedSet = new Set(unlockedIds.map((id: Types.ObjectId) => id.toString()));
  const lockedAchievements = allAchievements.filter(
    (a) => !unlockedSet.has(a._id.toString())
  );

  if (lockedAchievements.length === 0) return [];

  // Get user stats for evaluation
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const stats = await getUserStats(userId);
  const newlyUnlocked: string[] = [];

  for (const achievement of lockedAchievements) {
    const qualifies = evaluateCondition(achievement, user, stats);
    if (qualifies) {
      try {
        await UserAchievement.create({
          userId: userObjId,
          achievementId: achievement._id,
          unlockedAt: new Date(),
        });

        // Award achievement XP (direct update, no recursion)
        await XPTransaction.create({
          userId: userObjId,
          amount: achievement.xpReward,
          source: 'achievement',
          sourceId: achievement._id,
          description: `Achievement unlocked: ${achievement.name}`,
        });

        await User.findByIdAndUpdate(userId, {
          $inc: { xp: achievement.xpReward },
        });

        newlyUnlocked.push(achievement.name);
      } catch (err: any) {
        // Unique constraint violation means already unlocked (race condition)
        if (err.code !== 11000) throw err;
      }
    }
  }

  return newlyUnlocked;
}

interface UserStats {
  totalHabitsCompleted: number;
  totalFocusMinutes: number;
  totalFocusSessions: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  daysActive: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const userObjId = new Types.ObjectId(userId);

  const [habitLogCount, focusStats, daysActive, user] = await Promise.all([
    HabitLog.countDocuments({ userId: userObjId }),
    FocusSession.aggregate([
      { $match: { userId: userObjId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$actualDuration' },
          totalSessions: { $sum: 1 },
        },
      },
    ]),
    DailySnapshot.countDocuments({ userId: userObjId, habitsCompleted: { $gt: 0 } }),
    User.findById(userId).lean(),
  ]);

  return {
    totalHabitsCompleted: habitLogCount,
    totalFocusMinutes: focusStats[0]?.totalMinutes || 0,
    totalFocusSessions: focusStats[0]?.totalSessions || 0,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    totalXP: user?.xp || 0,
    level: user?.level || 1,
    daysActive,
  };
}

function evaluateCondition(
  achievement: IAchievement,
  user: any,
  stats: UserStats
): boolean {
  const { type, threshold } = achievement.condition;

  switch (type) {
    case 'habits_completed':
      return stats.totalHabitsCompleted >= threshold;
    case 'focus_minutes':
      return stats.totalFocusMinutes >= threshold;
    case 'focus_sessions':
      return stats.totalFocusSessions >= threshold;
    case 'streak_days':
      return stats.longestStreak >= threshold;
    case 'current_streak':
      return stats.currentStreak >= threshold;
    case 'xp_total':
      return stats.totalXP >= threshold;
    case 'level_reached':
      return stats.level >= threshold;
    case 'days_active':
      return stats.daysActive >= threshold;
    default:
      return false;
  }
}

export async function getUserAchievements(userId: string) {
  await connectDB();

  const userObjId = new Types.ObjectId(userId);

  const [allAchievements, userAchievements] = await Promise.all([
    Achievement.find().lean(),
    UserAchievement.find({ userId: userObjId }).lean(),
  ]);

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId.toString(), ua.unlockedAt])
  );

  return allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a._id.toString()),
    unlockedAt: unlockedMap.get(a._id.toString()) || null,
  }));
}

import { Types } from 'mongoose';
import { DailySnapshot } from './daily-snapshot.model';
import { StreakHistory } from './streak-history.model';
import { HabitLog } from '../habits/habit-log.model';
import { Habit } from '../habits/habit.model';
import { FocusSession } from '../focus/focus-session.model';
import { User } from '../auth/user.model';
import { connectDB } from '../../config/db';

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAnalyticsOverview(userId: string) {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const today = getStartOfDay();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [weeklySnapshots, monthlySnapshots, totalHabits] = await Promise.all([
    DailySnapshot.find({ userId: userObjId, date: { $gte: weekAgo } })
      .sort({ date: 1 })
      .lean(),
    DailySnapshot.find({ userId: userObjId, date: { $gte: monthAgo } })
      .sort({ date: 1 })
      .lean(),
    Habit.countDocuments({ userId: userObjId, isArchived: false }),
  ]);

  // Calculate weekly stats
  const weeklyHabitsCompleted = weeklySnapshots.reduce((sum, s) => sum + s.habitsCompleted, 0);
  const weeklyFocusMinutes = weeklySnapshots.reduce((sum, s) => sum + s.focusMinutes, 0);
  const weeklyXP = weeklySnapshots.reduce((sum, s) => sum + s.xpEarned, 0);
  const weeklyPossible = totalHabits * 7;

  // Calculate monthly stats
  const monthlyHabitsCompleted = monthlySnapshots.reduce((sum, s) => sum + s.habitsCompleted, 0);
  const monthlyFocusMinutes = monthlySnapshots.reduce((sum, s) => sum + s.focusMinutes, 0);
  const monthlyPossible = totalHabits * 30;

  return {
    user: {
      xp: user.xp,
      level: user.level,
      title: user.title,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    },
    weekly: {
      habitsCompleted: weeklyHabitsCompleted,
      completionRate: weeklyPossible > 0 ? Math.round((weeklyHabitsCompleted / weeklyPossible) * 100) : 0,
      focusMinutes: weeklyFocusMinutes,
      xpEarned: weeklyXP,
      snapshots: weeklySnapshots,
    },
    monthly: {
      habitsCompleted: monthlyHabitsCompleted,
      completionRate: monthlyPossible > 0 ? Math.round((monthlyHabitsCompleted / monthlyPossible) * 100) : 0,
      focusMinutes: monthlyFocusMinutes,
    },
    totalHabits,
  };
}

export async function getHabitAnalytics(userId: string, days: number = 30) {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get completion data per habit
  const habits = await Habit.find({ userId: userObjId, isArchived: false }).lean();

  const habitAnalytics = await Promise.all(
    habits.map(async (habit) => {
      const logs = await HabitLog.find({
        habitId: habit._id,
        completedAt: { $gte: startDate },
      })
        .sort({ completedAt: 1 })
        .lean();

      const totalPossible = days; // simplified for daily habits
      const completionRate = totalPossible > 0 ? Math.round((logs.length / totalPossible) * 100) : 0;

      return {
        habit: { _id: habit._id, name: habit.name, category: habit.category, color: habit.color },
        totalCompletions: logs.length,
        completionRate,
        logs: logs.map((l) => ({ date: l.completedAt, xpEarned: l.xpEarned })),
      };
    })
  );

  // Daily completion trend
  const dailyTrend = await DailySnapshot.find({
    userId: userObjId,
    date: { $gte: startDate },
  })
    .sort({ date: 1 })
    .lean();

  return {
    habits: habitAnalytics,
    dailyTrend: dailyTrend.map((s) => ({
      date: s.date,
      habitsCompleted: s.habitsCompleted,
      habitsTotal: s.habitsTotal,
      completionRate:
        s.habitsTotal > 0 ? Math.round((s.habitsCompleted / s.habitsTotal) * 100) : 0,
    })),
  };
}

export async function getFocusAnalytics(userId: string, days: number = 30) {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const [dailyFocus, sessionsByType, hourlyDistribution] = await Promise.all([
    // Daily focus time trend
    DailySnapshot.find({
      userId: userObjId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .lean(),

    // Sessions by type
    FocusSession.aggregate([
      {
        $match: {
          userId: userObjId,
          status: 'completed',
          startedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$type',
          totalMinutes: { $sum: '$actualDuration' },
          count: { $sum: 1 },
          avgDuration: { $avg: '$actualDuration' },
        },
      },
    ]),

    // Hourly distribution (when do users focus most)
    FocusSession.aggregate([
      {
        $match: {
          userId: userObjId,
          status: 'completed',
          startedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $hour: '$startedAt' },
          totalMinutes: { $sum: '$actualDuration' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    dailyTrend: dailyFocus.map((s) => ({
      date: s.date,
      focusMinutes: s.focusMinutes,
      focusSessions: s.focusSessions,
    })),
    byType: sessionsByType.map((s) => ({
      type: s._id,
      totalMinutes: s.totalMinutes,
      count: s.count,
      avgDuration: Math.round(s.avgDuration),
    })),
    hourlyDistribution: hourlyDistribution.map((h) => ({
      hour: h._id,
      totalMinutes: h.totalMinutes,
      count: h.count,
    })),
  };
}

export async function getStreakAnalytics(userId: string) {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const streakEvents = await StreakHistory.find({ userId: userObjId })
    .sort({ date: -1 })
    .limit(50)
    .lean();

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    events: streakEvents,
  };
}

export async function getDashboardData(userId: string) {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const today = getStartOfDay();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    todaySnapshot,
    weeklySnapshots,
    activeHabits,
    recentLogs,
    activeSession,
  ] = await Promise.all([
    DailySnapshot.findOne({ userId: userObjId, date: today }).lean(),
    DailySnapshot.find({ userId: userObjId, date: { $gte: weekAgo } })
      .sort({ date: 1 })
      .lean(),
    Habit.countDocuments({ userId: userObjId, isArchived: false }),
    HabitLog.find({ userId: userObjId })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('habitId', 'name category color icon')
      .lean(),
    FocusSession.findOne({ userId: userObjId, status: 'active' }).lean(),
  ]);

  // Calculate next level progress
  const nextLevelXP = Math.floor(100 * Math.pow(user.level + 1, 1.5));
  const currentLevelXP = Math.floor(100 * Math.pow(user.level, 1.5));

  return {
    user: {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      title: user.title,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalHabitsCompleted: user.totalHabitsCompleted,
      totalFocusMinutes: user.totalFocusMinutes,
    },
    levelProgress: {
      currentXP: user.xp,
      currentLevelXP,
      nextLevelXP,
      progress: nextLevelXP - currentLevelXP > 0
        ? Math.round(((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
        : 100,
    },
    today: {
      habitsCompleted: todaySnapshot?.habitsCompleted || 0,
      habitsTotal: activeHabits,
      focusMinutes: todaySnapshot?.focusMinutes || 0,
      xpEarned: todaySnapshot?.xpEarned || 0,
    },
    weeklyTrend: weeklySnapshots.map((s) => ({
      date: s.date,
      habitsCompleted: s.habitsCompleted,
      focusMinutes: s.focusMinutes,
      xpEarned: s.xpEarned,
    })),
    recentActivity: recentLogs.map((log) => ({
      _id: log._id,
      habit: log.habitId,
      completedAt: log.completedAt,
      xpEarned: log.xpEarned,
    })),
    activeSession,
  };
}

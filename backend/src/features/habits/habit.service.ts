import { Types } from 'mongoose';
import { Habit } from './habit.model';
import { HabitLog } from './habit-log.model';
import { HabitTemplate } from './habit-template.model';
import { User } from '../auth/user.model';
import { DailySnapshot } from '../analytics/daily-snapshot.model';
import { StreakHistory } from '../analytics/streak-history.model';
import { connectDB } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { XP_REWARDS, STREAK_MILESTONES } from '../../config/constants';
import { awardXP } from '../gamification/xp.service';
import type { CreateHabitInput, UpdateHabitInput } from './habit.validator';
import type { HabitDifficulty } from '../../shared/types';

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function createHabit(userId: string, input: CreateHabitInput) {
  await connectDB();
  const xpReward = XP_REWARDS[input.difficulty as HabitDifficulty];

  const habit = await Habit.create({
    userId: new Types.ObjectId(userId),
    ...input,
    xpReward,
  });

  return habit.toObject();
}

export async function getUserHabits(userId: string, includeArchived: boolean = false) {
  await connectDB();
  const filter: any = { userId: new Types.ObjectId(userId) };
  if (!includeArchived) filter.isArchived = false;

  const habits = await Habit.find(filter).sort({ createdAt: -1 }).lean();

  // Get today's completions for each habit
  const today = getStartOfDay();
  const endOfDay = getEndOfDay();
  const todayLogs = await HabitLog.find({
    userId: new Types.ObjectId(userId),
    completedAt: { $gte: today, $lte: endOfDay },
  }).lean();

  const completionMap = new Map<string, number>();
  for (const log of todayLogs) {
    const key = log.habitId.toString();
    completionMap.set(key, (completionMap.get(key) || 0) + 1);
  }

  return habits.map((habit) => ({
    ...habit,
    completedToday: completionMap.get(habit._id.toString()) || 0,
    isCompletedToday: (completionMap.get(habit._id.toString()) || 0) >= habit.targetCount,
  }));
}

export async function getHabitById(userId: string, habitId: string) {
  await connectDB();
  const habit = await Habit.findOne({
    _id: new Types.ObjectId(habitId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!habit) throw new NotFoundError('Habit not found');
  return habit;
}

export async function updateHabit(userId: string, habitId: string, input: UpdateHabitInput) {
  await connectDB();

  const updates: any = { ...input };
  if (input.difficulty) {
    updates.xpReward = XP_REWARDS[input.difficulty as HabitDifficulty];
  }

  const habit = await Habit.findOneAndUpdate(
    { _id: new Types.ObjectId(habitId), userId: new Types.ObjectId(userId) },
    updates,
    { new: true }
  ).lean();

  if (!habit) throw new NotFoundError('Habit not found');
  return habit;
}

export async function deleteHabit(userId: string, habitId: string) {
  await connectDB();

  // Soft delete by archiving
  const habit = await Habit.findOneAndUpdate(
    { _id: new Types.ObjectId(habitId), userId: new Types.ObjectId(userId) },
    { isArchived: true },
    { new: true }
  ).lean();

  if (!habit) throw new NotFoundError('Habit not found');
  return habit;
}

export async function completeHabit(
  userId: string,
  habitId: string,
  note?: string,
  completedAt?: string
) {
  await connectDB();

  const habit = await Habit.findOne({
    _id: new Types.ObjectId(habitId),
    userId: new Types.ObjectId(userId),
    isArchived: false,
  });

  if (!habit) throw new NotFoundError('Habit not found');

  const completionDate = completedAt ? new Date(completedAt) : new Date();
  const dayStart = getStartOfDay(completionDate);
  const dayEnd = getEndOfDay(completionDate);

  // Check if already completed target count today
  const todayCount = await HabitLog.countDocuments({
    habitId: habit._id,
    userId: new Types.ObjectId(userId),
    completedAt: { $gte: dayStart, $lte: dayEnd },
  });

  if (todayCount >= habit.targetCount) {
    throw new BadRequestError('Habit already completed for today');
  }

  // Create the log
  const log = await HabitLog.create({
    habitId: habit._id,
    userId: new Types.ObjectId(userId),
    completedAt: completionDate,
    xpEarned: habit.xpReward,
    note,
  });

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { totalHabitsCompleted: 1 },
  });

  // Update daily snapshot
  const totalHabits = await Habit.countDocuments({
    userId: new Types.ObjectId(userId),
    isArchived: false,
  });

  await DailySnapshot.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), date: dayStart },
    {
      $inc: { habitsCompleted: 1 },
      $set: { habitsTotal: totalHabits },
    },
    { upsert: true, new: true }
  );

  // Award XP through centralized system
  const xpResult = await awardXP(
    userId,
    habit.xpReward,
    'habit',
    `Completed habit: ${habit.name}`,
    habitId
  );

  // Update streak
  await updateStreak(userId);

  return {
    log: log.toObject(),
    xp: xpResult,
  };
}

async function updateStreak(userId: string) {
  const userObjId = new Types.ObjectId(userId);

  // Check if user completed at least one habit yesterday
  const yesterday = getStartOfDay();
  yesterday.setDate(yesterday.getDate() - 1);

  const todaySnapshot = await DailySnapshot.findOne({
    userId: userObjId,
    date: getStartOfDay(),
  });

  const yesterdaySnapshot = await DailySnapshot.findOne({
    userId: userObjId,
    date: yesterday,
  });

  const user = await User.findById(userId);
  if (!user) return;

  let newStreak = user.currentStreak;

  if (todaySnapshot && todaySnapshot.habitsCompleted > 0) {
    if (user.currentStreak === 0 || (yesterdaySnapshot && yesterdaySnapshot.habitsCompleted > 0)) {
      // Continue or start streak
      if (user.currentStreak === 0) {
        newStreak = 1;
        await StreakHistory.create({
          userId: userObjId,
          type: 'started',
          streakCount: 1,
          date: new Date(),
        });
      } else {
        newStreak = user.currentStreak + 1;
      }

      // Check for streak milestones
      if (STREAK_MILESTONES[newStreak]) {
        await StreakHistory.create({
          userId: userObjId,
          type: 'milestone',
          streakCount: newStreak,
          date: new Date(),
        });

        // Award streak milestone XP
        await awardXP(
          userId,
          STREAK_MILESTONES[newStreak],
          'streak',
          `${newStreak}-day streak milestone!`
        );
      }
    }
  }

  const longestStreak = Math.max(user.longestStreak, newStreak);

  await User.findByIdAndUpdate(userId, {
    currentStreak: newStreak,
    longestStreak,
  });

  // Update today's snapshot with streak
  await DailySnapshot.findOneAndUpdate(
    { userId: userObjId, date: getStartOfDay() },
    { streak: newStreak },
    { upsert: true }
  );
}

export async function getHabitLogs(
  userId: string,
  habitId: string,
  page: number = 1,
  limit: number = 20
) {
  await connectDB();

  // Verify ownership
  await getHabitById(userId, habitId);

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    HabitLog.find({ habitId: new Types.ObjectId(habitId), userId: new Types.ObjectId(userId) })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    HabitLog.countDocuments({ habitId: new Types.ObjectId(habitId), userId: new Types.ObjectId(userId) }),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getHabitTemplates(category?: string) {
  await connectDB();
  const filter: any = { isSystem: true };
  if (category) filter.category = category;
  return HabitTemplate.find(filter).sort({ category: 1, name: 1 }).lean();
}

export async function createHabitFromTemplate(userId: string, templateId: string) {
  await connectDB();
  const template = await HabitTemplate.findById(templateId).lean();
  if (!template) throw new NotFoundError('Template not found');

  return createHabit(userId, {
    name: template.name,
    description: template.description,
    category: template.category,
    frequency: template.frequency,
    difficulty: template.difficulty,
    icon: template.icon,
    targetCount: 1,
  });
}

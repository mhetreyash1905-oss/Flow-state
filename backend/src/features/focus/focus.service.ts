import { Types } from 'mongoose';
import { FocusSession } from './focus-session.model';
import { User } from '../auth/user.model';
import { DailySnapshot } from '../analytics/daily-snapshot.model';
import { connectDB } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { FOCUS_XP_PER_MINUTE, MIN_FOCUS_DURATION_FOR_XP } from '../../config/constants';
import { awardXP } from '../gamification/xp.service';
import type { CreateFocusSessionInput, UpdateFocusSessionInput } from './focus.validator';

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function startFocusSession(userId: string, input: CreateFocusSessionInput) {
  await connectDB();

  // Check for any currently active session
  const activeSession = await FocusSession.findOne({
    userId: new Types.ObjectId(userId),
    status: 'active',
  });

  if (activeSession) {
    throw new BadRequestError('You already have an active focus session. Complete or cancel it first.');
  }

  const session = await FocusSession.create({
    userId: new Types.ObjectId(userId),
    type: input.type,
    duration: input.duration,
    label: input.label,
    startedAt: new Date(),
    status: 'active',
  });

  return session.toObject();
}

export async function updateFocusSession(
  userId: string,
  sessionId: string,
  input: UpdateFocusSessionInput
) {
  await connectDB();

  const session = await FocusSession.findOne({
    _id: new Types.ObjectId(sessionId),
    userId: new Types.ObjectId(userId),
  });

  if (!session) throw new NotFoundError('Focus session not found');

  if (session.status === 'completed' || session.status === 'cancelled') {
    throw new BadRequestError(`Session already ${session.status}`);
  }

  const updates: any = {};

  if (input.status) {
    updates.status = input.status;

    if (input.status === 'completed') {
      updates.completedAt = new Date();

      // Calculate actual duration
      const startTime = session.startedAt.getTime();
      const endTime = Date.now();
      const actualMinutes = input.actualDuration || Math.round((endTime - startTime) / 60000);
      updates.actualDuration = actualMinutes;

      // Award XP if session was long enough
      if (actualMinutes >= MIN_FOCUS_DURATION_FOR_XP) {
        const xpAmount = actualMinutes * FOCUS_XP_PER_MINUTE;
        updates.xpEarned = xpAmount;

        // Update user stats
        await User.findByIdAndUpdate(userId, {
          $inc: { totalFocusMinutes: actualMinutes },
        });

        // Update daily snapshot
        const today = getStartOfDay();
        await DailySnapshot.findOneAndUpdate(
          { userId: new Types.ObjectId(userId), date: today },
          {
            $inc: { focusMinutes: actualMinutes, focusSessions: 1 },
          },
          { upsert: true, new: true }
        );

        // Award XP through centralized system
        await awardXP(
          userId,
          xpAmount,
          'focus',
          `Focus session: ${actualMinutes} minutes of ${session.type}`,
          sessionId
        );
      }
    }
  }

  if (input.interruptions !== undefined) {
    updates.interruptions = input.interruptions;
  }
  if (input.notes !== undefined) {
    updates.notes = input.notes;
  }

  const updated = await FocusSession.findByIdAndUpdate(sessionId, updates, {
    new: true,
  }).lean();

  return updated;
}

export async function getUserFocusSessions(
  userId: string,
  page: number = 1,
  limit: number = 20,
  status?: string
) {
  await connectDB();

  const filter: any = { userId: new Types.ObjectId(userId) };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    FocusSession.find(filter).sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
    FocusSession.countDocuments(filter),
  ]);

  return { sessions, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getFocusStats(userId: string) {
  await connectDB();

  const userObjId = new Types.ObjectId(userId);
  const today = getStartOfDay();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [allTimeStats, weeklyStats, todayStats, activeSession] = await Promise.all([
    FocusSession.aggregate([
      { $match: { userId: userObjId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$actualDuration' },
          totalSessions: { $sum: 1 },
          avgDuration: { $avg: '$actualDuration' },
          totalInterruptions: { $sum: '$interruptions' },
        },
      },
    ]),
    FocusSession.aggregate([
      {
        $match: {
          userId: userObjId,
          status: 'completed',
          startedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$actualDuration' },
          totalSessions: { $sum: 1 },
        },
      },
    ]),
    FocusSession.aggregate([
      {
        $match: {
          userId: userObjId,
          status: 'completed',
          startedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$actualDuration' },
          totalSessions: { $sum: 1 },
        },
      },
    ]),
    FocusSession.findOne({ userId: userObjId, status: 'active' }).lean(),
  ]);

  return {
    allTime: {
      totalMinutes: allTimeStats[0]?.totalMinutes || 0,
      totalSessions: allTimeStats[0]?.totalSessions || 0,
      avgDuration: Math.round(allTimeStats[0]?.avgDuration || 0),
      totalInterruptions: allTimeStats[0]?.totalInterruptions || 0,
    },
    weekly: {
      totalMinutes: weeklyStats[0]?.totalMinutes || 0,
      totalSessions: weeklyStats[0]?.totalSessions || 0,
    },
    today: {
      totalMinutes: todayStats[0]?.totalMinutes || 0,
      totalSessions: todayStats[0]?.totalSessions || 0,
    },
    activeSession,
  };
}

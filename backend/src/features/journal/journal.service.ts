import { Types } from 'mongoose';
import { JournalEntry } from './journal-entry.model';
import { DailySnapshot } from '../analytics/daily-snapshot.model';
import { connectDB } from '../../config/db';
import { NotFoundError } from '../../shared/errors';
import type { CreateJournalEntryInput, UpdateJournalEntryInput } from './journal.validator';

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function createJournalEntry(userId: string, input: CreateJournalEntryInput) {
  await connectDB();

  const entryDate = input.date ? new Date(input.date) : new Date();

  const entry = await JournalEntry.create({
    userId: new Types.ObjectId(userId),
    date: entryDate,
    content: input.content,
    mood: input.mood,
    energy: input.energy,
    tags: input.tags || [],
  });

  // Update daily snapshot with mood/energy if provided
  if (input.mood || input.energy) {
    const dayStart = getStartOfDay(entryDate);
    const updates: any = {};
    if (input.mood) updates.mood = input.mood;
    if (input.energy) updates.energy = input.energy;

    await DailySnapshot.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date: dayStart },
      { $set: updates },
      { upsert: true }
    );
  }

  return entry.toObject();
}

export async function getUserJournalEntries(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  await connectDB();
  const skip = (page - 1) * limit;
  const userObjId = new Types.ObjectId(userId);

  const [entries, total] = await Promise.all([
    JournalEntry.find({ userId: userObjId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JournalEntry.countDocuments({ userId: userObjId }),
  ]);

  return { entries, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getJournalEntryById(userId: string, entryId: string) {
  await connectDB();
  const entry = await JournalEntry.findOne({
    _id: new Types.ObjectId(entryId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!entry) throw new NotFoundError('Journal entry not found');
  return entry;
}

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  input: UpdateJournalEntryInput
) {
  await connectDB();

  const entry = await JournalEntry.findOneAndUpdate(
    { _id: new Types.ObjectId(entryId), userId: new Types.ObjectId(userId) },
    { $set: input },
    { new: true }
  ).lean();

  if (!entry) throw new NotFoundError('Journal entry not found');
  return entry;
}

export async function deleteJournalEntry(userId: string, entryId: string) {
  await connectDB();
  const entry = await JournalEntry.findOneAndDelete({
    _id: new Types.ObjectId(entryId),
    userId: new Types.ObjectId(userId),
  });

  if (!entry) throw new NotFoundError('Journal entry not found');
  return { deleted: true };
}

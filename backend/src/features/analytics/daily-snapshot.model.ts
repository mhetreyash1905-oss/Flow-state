import mongoose, { Schema, Model } from 'mongoose';
import type { IDailySnapshot } from '../../shared/types';

const DailySnapshotSchema = new Schema<IDailySnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    habitsCompleted: { type: Number, default: 0, min: 0 },
    habitsTotal: { type: Number, default: 0, min: 0 },
    focusMinutes: { type: Number, default: 0, min: 0 },
    focusSessions: { type: Number, default: 0, min: 0 },
    xpEarned: { type: Number, default: 0, min: 0 },
    streak: { type: Number, default: 0, min: 0 },
    mood: { type: Number, min: 1, max: 5 },
    energy: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
  }
);

// One snapshot per user per day
DailySnapshotSchema.index({ userId: 1, date: -1 }, { unique: true });

export const DailySnapshot: Model<IDailySnapshot> =
  mongoose.models.DailySnapshot ||
  mongoose.model<IDailySnapshot>('DailySnapshot', DailySnapshotSchema);

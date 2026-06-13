import mongoose, { Schema, Model } from 'mongoose';
import type { IStreakHistory } from '../../shared/types';
import { STREAK_EVENT_TYPES } from '../../shared/types';

const StreakHistorySchema = new Schema<IStreakHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: STREAK_EVENT_TYPES,
      required: true,
    },
    streakCount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

StreakHistorySchema.index({ userId: 1, date: -1 });
StreakHistorySchema.index({ userId: 1, type: 1 });

export const StreakHistory: Model<IStreakHistory> =
  mongoose.models.StreakHistory ||
  mongoose.model<IStreakHistory>('StreakHistory', StreakHistorySchema);

import mongoose, { Schema, Model } from 'mongoose';
import type { IHabitLog } from '../../shared/types';

const HabitLogSchema = new Schema<IHabitLog>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    completedAt: { type: Date, required: true, default: Date.now },
    xpEarned: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

HabitLogSchema.index({ userId: 1, completedAt: -1 });
HabitLogSchema.index({ habitId: 1, completedAt: -1 });
HabitLogSchema.index({ userId: 1, habitId: 1, completedAt: 1 });

export const HabitLog: Model<IHabitLog> =
  mongoose.models.HabitLog || mongoose.model<IHabitLog>('HabitLog', HabitLogSchema);

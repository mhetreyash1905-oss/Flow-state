import mongoose, { Schema, Model } from 'mongoose';
import type { IHabit } from '../../shared/types';
import { HABIT_CATEGORIES, HABIT_FREQUENCIES, HABIT_DIFFICULTIES } from '../../shared/types';

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: HABIT_CATEGORIES,
      required: true,
      default: 'other',
    },
    frequency: {
      type: String,
      enum: HABIT_FREQUENCIES,
      required: true,
      default: 'daily',
    },
    difficulty: {
      type: String,
      enum: HABIT_DIFFICULTIES,
      required: true,
      default: 'medium',
    },
    xpReward: { type: Number, required: true, min: 0 },
    targetCount: { type: Number, default: 1, min: 1 },
    color: { type: String },
    icon: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

HabitSchema.index({ userId: 1, isArchived: 1 });
HabitSchema.index({ userId: 1, category: 1 });

export const Habit: Model<IHabit> =
  mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

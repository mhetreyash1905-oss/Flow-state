import mongoose, { Schema, Model } from 'mongoose';
import type { IHabitTemplate } from '../../shared/types';
import { HABIT_CATEGORIES, HABIT_FREQUENCIES, HABIT_DIFFICULTIES } from '../../shared/types';

const HabitTemplateSchema = new Schema<IHabitTemplate>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: HABIT_CATEGORIES,
      required: true,
    },
    frequency: {
      type: String,
      enum: HABIT_FREQUENCIES,
      required: true,
    },
    difficulty: {
      type: String,
      enum: HABIT_DIFFICULTIES,
      required: true,
    },
    icon: { type: String },
    isSystem: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

HabitTemplateSchema.index({ category: 1 });

export const HabitTemplate: Model<IHabitTemplate> =
  mongoose.models.HabitTemplate || mongoose.model<IHabitTemplate>('HabitTemplate', HabitTemplateSchema);

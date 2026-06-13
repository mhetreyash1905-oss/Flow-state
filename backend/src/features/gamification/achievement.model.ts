import mongoose, { Schema, Model } from 'mongoose';
import type { IAchievement } from '../../shared/types';
import { ACHIEVEMENT_CATEGORIES } from '../../shared/types';

const AchievementSchema = new Schema<IAchievement>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    category: {
      type: String,
      enum: ACHIEVEMENT_CATEGORIES,
      required: true,
    },
    icon: { type: String, required: true },
    xpReward: { type: Number, required: true, min: 0 },
    condition: {
      type: { type: String, required: true },
      threshold: { type: Number, required: true, min: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AchievementSchema.index({ key: 1 }, { unique: true });
AchievementSchema.index({ category: 1 });

export const Achievement: Model<IAchievement> =
  mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);

import mongoose, { Schema, Model } from 'mongoose';
import type { IUserAchievement } from '../../shared/types';

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
    unlockedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// A user can only unlock each achievement once
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const UserAchievement: Model<IUserAchievement> =
  mongoose.models.UserAchievement ||
  mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

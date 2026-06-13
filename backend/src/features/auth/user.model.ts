import mongoose, { Schema, Model } from 'mongoose';
import type { IUser } from '../../shared/types';

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    title: { type: String, default: 'Beginner' },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    totalFocusMinutes: { type: Number, default: 0, min: 0 },
    totalHabitsCompleted: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

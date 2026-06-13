import mongoose, { Schema, Model } from 'mongoose';
import type { IFocusSession } from '../../shared/types';
import { FOCUS_SESSION_TYPES, FOCUS_SESSION_STATUSES } from '../../shared/types';

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: FOCUS_SESSION_TYPES,
      required: true,
      default: 'pomodoro',
    },
    status: {
      type: String,
      enum: FOCUS_SESSION_STATUSES,
      required: true,
      default: 'active',
    },
    duration: { type: Number, required: true, min: 1 },
    actualDuration: { type: Number, default: 0, min: 0 },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    xpEarned: { type: Number, default: 0, min: 0 },
    interruptions: { type: Number, default: 0, min: 0 },
    label: { type: String, trim: true, maxlength: 100 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

FocusSessionSchema.index({ userId: 1, startedAt: -1 });
FocusSessionSchema.index({ userId: 1, status: 1 });

export const FocusSession: Model<IFocusSession> =
  mongoose.models.FocusSession || mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);

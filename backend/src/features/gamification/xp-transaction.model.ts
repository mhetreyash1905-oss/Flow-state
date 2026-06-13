import mongoose, { Schema, Model } from 'mongoose';
import type { IXPTransaction } from '../../shared/types';
import { XP_SOURCES } from '../../shared/types';

const XPTransactionSchema = new Schema<IXPTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    source: {
      type: String,
      enum: XP_SOURCES,
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true, trim: true, maxlength: 300 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

XPTransactionSchema.index({ userId: 1, createdAt: -1 });
XPTransactionSchema.index({ userId: 1, source: 1 });

export const XPTransaction: Model<IXPTransaction> =
  mongoose.models.XPTransaction ||
  mongoose.model<IXPTransaction>('XPTransaction', XPTransactionSchema);

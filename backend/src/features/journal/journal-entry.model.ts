import mongoose, { Schema, Model } from 'mongoose';
import type { IJournalEntry } from '../../shared/types';

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    mood: { type: Number, min: 1, max: 5 },
    energy: { type: Number, min: 1, max: 5 },
    tags: [{ type: String, trim: true, maxlength: 50 }],
  },
  {
    timestamps: true,
  }
);

JournalEntrySchema.index({ userId: 1, date: -1 });

export const JournalEntry: Model<IJournalEntry> =
  mongoose.models.JournalEntry ||
  mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

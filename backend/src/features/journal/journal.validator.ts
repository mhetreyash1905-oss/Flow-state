import { z } from 'zod';

export const createJournalEntrySchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(5000),
  mood: z.number().int().min(1).max(5).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string().trim().max(50)).max(10).optional(),
  date: z.string().datetime().optional(),
});

export const updateJournalEntrySchema = z.object({
  content: z.string().trim().min(1).max(5000).optional(),
  mood: z.number().int().min(1).max(5).optional().nullable(),
  energy: z.number().int().min(1).max(5).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(10).optional(),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;

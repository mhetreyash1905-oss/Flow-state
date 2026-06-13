import { z } from 'zod';
import { FOCUS_SESSION_TYPES } from '../../shared/types';

export const createFocusSessionSchema = z.object({
  type: z.enum(FOCUS_SESSION_TYPES).default('pomodoro'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours'),
  label: z.string().trim().max(100).optional(),
});

export const updateFocusSessionSchema = z.object({
  status: z.enum(['completed', 'cancelled', 'paused']).optional(),
  actualDuration: z.number().int().min(0).optional(),
  interruptions: z.number().int().min(0).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateFocusSessionInput = z.infer<typeof createFocusSessionSchema>;
export type UpdateFocusSessionInput = z.infer<typeof updateFocusSessionSchema>;

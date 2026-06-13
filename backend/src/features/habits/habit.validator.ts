import { z } from 'zod';
import { HABIT_CATEGORIES, HABIT_FREQUENCIES, HABIT_DIFFICULTIES } from '../../shared/types';

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().trim().max(500).optional(),
  category: z.enum(HABIT_CATEGORIES).default('other'),
  frequency: z.enum(HABIT_FREQUENCIES).default('daily'),
  difficulty: z.enum(HABIT_DIFFICULTIES).default('medium'),
  targetCount: z.number().int().min(1).default(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateHabitSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  category: z.enum(HABIT_CATEGORIES).optional(),
  frequency: z.enum(HABIT_FREQUENCIES).optional(),
  difficulty: z.enum(HABIT_DIFFICULTIES).optional(),
  targetCount: z.number().int().min(1).optional(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
});

export const completeHabitSchema = z.object({
  note: z.string().trim().max(500).optional(),
  completedAt: z.string().datetime().optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>;

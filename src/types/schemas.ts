/**
 * Zod Schemas for Runtime Type Validation
 * Ensures data integrity for localStorage and API responses
 */
import { z } from 'zod';

// ============================================
// CORE SCHEMAS
// ============================================

/**
 * Activity Schema - Tracks user activity on websites/apps
 */
export const ActivitySchema = z.object({
  id: z.string().min(1, 'Activity ID is required'),
  url: z.string().url('Invalid URL format').or(z.string().min(1)),
  domain: z.string().min(1, 'Domain is required'),
  category: z.enum(['productive', 'distraction', 'neutral']),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  duration: z.number().min(0, 'Duration must be non-negative'),
  title: z.string().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Goal Schema - User productivity goals
 */
export const GoalSchema = z.object({
  id: z.string().min(1, 'Goal ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  target: z.number()
    .min(1, 'Target must be at least 1')
    .max(10000, 'Target must be less than 10,000'),
  current: z.number().min(0, 'Current progress cannot be negative'),
  unit: z.string().max(50, 'Unit must be less than 50 characters'),
  deadline: z.coerce.date().optional(),
  category: z.enum(['leetcode', 'applications', 'learning', 'other']),
  completed: z.boolean(),
});

export type Goal = z.infer<typeof GoalSchema>;

/**
 * New Goal Schema - For creating goals (without ID)
 */
export const NewGoalSchema = GoalSchema.omit({ id: true });
export type NewGoal = z.infer<typeof NewGoalSchema>;

/**
 * Chat Message Schema
 */
export const ChatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content is required'),
  timestamp: z.coerce.date(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Focus Score Schema
 */
export const FocusScoreSchema = z.object({
  value: z.number().min(0).max(100),
  trend: z.enum(['up', 'down', 'stable']),
  factors: z.array(z.string()),
});

export type FocusScore = z.infer<typeof FocusScoreSchema>;

/**
 * Current Status Schema
 */
export const CurrentStatusSchema = z.object({
  activity: ActivitySchema.nullable(),
  timeSpent: z.number().min(0),
  focusScore: FocusScoreSchema,
  isIdle: z.boolean(),
});

export type CurrentStatus = z.infer<typeof CurrentStatusSchema>;

/**
 * AI Guidance Schema
 */
export const AIGuidanceSchema = z.object({
  type: z.enum(['nudge', 'warning', 'celebration', 'suggestion', 'reminder']),
  message: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  timestamp: z.coerce.date(),
  actionUrl: z.string().url().optional(),
});

export type AIGuidance = z.infer<typeof AIGuidanceSchema>;

/**
 * Reminder Schema
 */
export const ReminderSchema = z.object({
  id: z.string(),
  type: z.enum(['notification', 'email', 'sound']),
  time: z.coerce.date(),
  sent: z.boolean(),
});

/**
 * Attachment Schema
 */
export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
});

/**
 * Recurring Pattern Schema
 */
export const RecurringPatternSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().min(1),
  endDate: z.coerce.date().optional(),
  daysOfWeek: z.array(z.number()).optional(),
  dayOfMonth: z.number().optional(),
});

/**
 * Scheduled Task Schema - Full version matching calendar.ts
 */
export const ScheduledTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['study', 'work', 'personal', 'break', 'health', 'custom']),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  color: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  linkedGoals: z.array(z.string()),
  recurring: RecurringPatternSchema.optional(),
  recurrenceRule: z.string().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
  completedAt: z.coerce.date().optional(),
  reminders: z.array(ReminderSchema).optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ScheduledTask = z.infer<typeof ScheduledTaskSchema>;

/**
 * Simple Task Schema - for basic task storage (backward compatible)
 */
export const SimpleTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  category: z.string().optional(),
  color: z.string().optional(),
  isRecurring: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export type SimpleTask = z.infer<typeof SimpleTaskSchema>;

/**
 * Settings Schema
 */
export const SettingsSchema = z.object({
  pomodoroLength: z.number().min(1).max(120),
  shortBreakLength: z.number().min(1).max(60),
  longBreakLength: z.number().min(1).max(120),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
  })),
  notifications: z.boolean(),
  soundEnabled: z.boolean(),
});

export type Settings = z.infer<typeof SettingsSchema>;

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Safe parse with default fallback
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('Validation failed:', result.error.issues);
  return defaultValue;
}

/**
 * Safe parse array with filtering invalid items
 */
export function safeParseArray<T>(
  schema: z.ZodType<T>,
  data: unknown,
  defaultValue: T[] = []
): T[] {
  if (!Array.isArray(data)) {
    console.warn('Expected array, got:', typeof data);
    return defaultValue;
  }
  
  return data
    .map((item) => {
      const result = schema.safeParse(item);
      if (result.success) {
        return result.data;
      }
      console.warn('Invalid item skipped:', result.error.issues);
      return null;
    })
    .filter((item): item is T => item !== null);
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorMessage = 'Validation failed'
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`${errorMessage}: ${errors.join(', ')}`);
  }
  return result.data;
}

/**
 * Get validation errors as object (for form validation)
 */
export function getValidationErrors<T>(
  schema: z.ZodType<T>,
  data: unknown
): Record<string, string> | null {
  const result = schema.safeParse(data);
  if (result.success) return null;
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.') || 'root';
    errors[path] = err.message;
  });
  return errors;
}

export default {
  ActivitySchema,
  GoalSchema,
  NewGoalSchema,
  ChatMessageSchema,
  FocusScoreSchema,
  CurrentStatusSchema,
  AIGuidanceSchema,
  ScheduledTaskSchema,
  SettingsSchema,
  safeParse,
  safeParseArray,
  validateOrThrow,
  getValidationErrors,
};

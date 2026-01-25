/**
 * Type Definitions - Re-export from Zod schemas for backward compatibility
 * All types are now derived from Zod schemas for runtime validation
 */

// Re-export all types from schemas
export {
  type Activity,
  type Goal,
  type ChatMessage,
  type FocusScore,
  type CurrentStatus,
  type AIGuidance,
  type ScheduledTask,
  type Settings,
  type NewGoal,
  // Also export schemas for validation
  ActivitySchema,
  GoalSchema,
  NewGoalSchema,
  ChatMessageSchema,
  FocusScoreSchema,
  CurrentStatusSchema,
  AIGuidanceSchema,
  ScheduledTaskSchema,
  SettingsSchema,
  // Validation utilities
  safeParse,
  safeParseArray,
  validateOrThrow,
  getValidationErrors,
} from './schemas';

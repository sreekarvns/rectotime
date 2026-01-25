/**
 * Secure Storage Utility with Zod Validation
 * Handles localStorage operations with type safety and error recovery
 */
import {
  ActivitySchema,
  GoalSchema,
  ChatMessageSchema,
  SettingsSchema,
  SimpleTaskSchema,
  safeParseArray,
  safeParse,
  type Activity,
  type Goal,
  type ChatMessage,
  type Settings,
  type SimpleTask,
} from '../types/schemas';

import type { ScheduledTask } from '../types/calendar';

/**
 * Convert SimpleTask from storage to full ScheduledTask
 * Fills in required fields with sensible defaults
 */
function simpleTaskToScheduledTask(simple: SimpleTask): ScheduledTask {
  return {
    id: simple.id,
    title: simple.title,
    description: simple.description,
    category: (simple.category as ScheduledTask['category']) || 'personal',
    startTime: simple.startTime,
    endTime: simple.endTime,
    color: simple.color || '#4ECDC4',
    priority: 'medium',
    status: simple.completed ? 'completed' : 'pending',
    linkedGoals: [],
    recurring: simple.isRecurring ? { frequency: 'daily', interval: 1 } : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Convert ScheduledTask to SimpleTask for storage
 */
function scheduledTaskToSimple(task: ScheduledTask): SimpleTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    startTime: task.startTime,
    endTime: task.endTime,
    category: task.category,
    color: task.color,
    isRecurring: !!task.recurring,
    completed: task.status === 'completed',
  };
}

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  ACTIVITIES: 'productivity_activities',
  GOALS: 'productivity_goals',
  CHAT_HISTORY: 'productivity_chat',
  SETTINGS: 'productivity_settings',
  TASKS: 'productivity_tasks',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  UNDO_STACK: 'productivity_undo_stack',
} as const;

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_SETTINGS: Settings = {
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  accentColor: '#007AFF',
  categories: [
    { id: '1', name: 'LeetCode', color: '#FF6B6B' },
    { id: '2', name: 'Applications', color: '#4ECDC4' },
    { id: '3', name: 'Learning', color: '#45B7D1' },
    { id: '4', name: 'Meeting', color: '#FFA07A' },
    { id: '5', name: 'Break', color: '#95E1D3' },
  ],
  notifications: true,
  soundEnabled: true,
};

// ============================================
// SAFE JSON PARSING
// ============================================

function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

// ============================================
// STORAGE API
// ============================================

export const storage = {
  // ----------------------------------------
  // ACTIVITIES
  // ----------------------------------------
  getActivities: (): Activity[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const parsed = safeJsonParse(data, []);
    return safeParseArray(ActivitySchema, parsed, []);
  },

  saveActivities: (activities: Activity[]): void => {
    const validated = safeParseArray(ActivitySchema, activities, []);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(validated));
  },

  addActivity: (activity: Activity): void => {
    const activities = storage.getActivities();
    activities.push(activity);
    storage.saveActivities(activities);
  },

  // ----------------------------------------
  // GOALS
  // ----------------------------------------
  getGoals: (): Goal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    const parsed = safeJsonParse(data, []);
    return safeParseArray(GoalSchema, parsed, []);
  },

  saveGoals: (goals: Goal[]): void => {
    const validated = safeParseArray(GoalSchema, goals, []);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(validated));
  },

  addGoal: (goal: Goal): void => {
    const goals = storage.getGoals();
    goals.push(goal);
    storage.saveGoals(goals);
  },

  updateGoal: (id: string, updates: Partial<Goal>): void => {
    const goals = storage.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      storage.saveGoals(goals);
    }
  },

  deleteGoal: (id: string): void => {
    const goals = storage.getGoals().filter(g => g.id !== id);
    storage.saveGoals(goals);
  },

  // ----------------------------------------
  // CHAT HISTORY
  // ----------------------------------------
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    const parsed = safeJsonParse(data, []);
    return safeParseArray(ChatMessageSchema, parsed, []);
  },

  saveChatMessage: (message: ChatMessage): void => {
    const result = ChatMessageSchema.safeParse(message);
    if (!result.success) {
      console.error('Invalid chat message:', result.error);
      return;
    }
    const history = storage.getChatHistory();
    history.push(result.data);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
  },

  clearChatHistory: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },

  // ----------------------------------------
  // SETTINGS
  // ----------------------------------------
  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = safeJsonParse(data, DEFAULT_SETTINGS);
    return safeParse(SettingsSchema, parsed, DEFAULT_SETTINGS);
  },

  saveSettings: (settings: Settings): void => {
    const result = SettingsSchema.safeParse(settings);
    if (!result.success) {
      console.error('Invalid settings:', result.error);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(result.data));
  },

  // ----------------------------------------
  // TASKS
  // ----------------------------------------
  getTasks: (): ScheduledTask[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    const parsed = safeJsonParse(data, []);
    const simpleTasks = safeParseArray(SimpleTaskSchema, parsed, []);
    return simpleTasks.map(simpleTaskToScheduledTask);
  },

  saveTasks: (tasks: ScheduledTask[]): void => {
    const simpleTasks = tasks.map(scheduledTaskToSimple);
    const validated = safeParseArray(SimpleTaskSchema, simpleTasks, []);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(validated));
  },

  // ----------------------------------------
  // THEME
  // ----------------------------------------
  getTheme: (): 'light' | 'dark' => {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'dark' ? 'dark' : 'light';
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // ----------------------------------------
  // ONBOARDING
  // ----------------------------------------
  isOnboardingComplete: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  },

  setOnboardingComplete: (): void => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  },

  // ----------------------------------------
  // UNDO STACK (for goal operations)
  // ----------------------------------------
  getUndoStack: (): Goal[][] => {
    const data = localStorage.getItem(STORAGE_KEYS.UNDO_STACK);
    const parsed = safeJsonParse(data, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-10); // Keep last 10 undo states
  },

  pushUndoStack: (goals: Goal[]): void => {
    const stack = storage.getUndoStack();
    stack.push(goals);
    localStorage.setItem(STORAGE_KEYS.UNDO_STACK, JSON.stringify(stack.slice(-10)));
  },

  popUndoStack: (): Goal[] | null => {
    const stack = storage.getUndoStack();
    if (stack.length === 0) return null;
    const lastState = stack.pop();
    localStorage.setItem(STORAGE_KEYS.UNDO_STACK, JSON.stringify(stack));
    return lastState || null;
  },

  clearUndoStack: (): void => {
    localStorage.removeItem(STORAGE_KEYS.UNDO_STACK);
  },

  // ----------------------------------------
  // CLEAR ALL DATA
  // ----------------------------------------
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // ----------------------------------------
  // EXPORT DATA
  // ----------------------------------------
  exportData: (): string => {
    const data = {
      goals: storage.getGoals(),
      activities: storage.getActivities(),
      tasks: storage.getTasks(),
      settings: storage.getSettings(),
      chatHistory: storage.getChatHistory(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  },

  // ----------------------------------------
  // IMPORT DATA
  // ----------------------------------------
  importData: (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.goals) {
        storage.saveGoals(safeParseArray(GoalSchema, data.goals, []));
      }
      if (data.activities) {
        storage.saveActivities(safeParseArray(ActivitySchema, data.activities, []));
      }
      if (data.tasks) {
        // Parse as SimpleTasks and convert to ScheduledTask
        const simpleTasks = safeParseArray(SimpleTaskSchema, data.tasks, []);
        const fullTasks = simpleTasks.map(simpleTaskToScheduledTask);
        storage.saveTasks(fullTasks);
      }
      if (data.settings) {
        const settings = safeParse(SettingsSchema, data.settings, DEFAULT_SETTINGS);
        storage.saveSettings(settings);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};

export default storage;

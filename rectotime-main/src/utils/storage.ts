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

export interface StressCheckInRecord {
  timestamp: string;
  stressLevel: number;
  riskBand?: string;
}

export interface AnalyticsEvent {
  name: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface StressAnalyticsSnapshot {
  predictionViewed: number;
  actionViewed: number;
  actionCompleted: number;
  trialStarted: number;
  actionViewRate: number;
  actionCompletionRate: number;
  trialConversionRate: number;
}

export interface DailyBriefRecord {
  date: string;
  topPriority: string;
  mustWin: string;
  shutdownNote: string;
  updatedAt: string;
}

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
  STRESS_CHECKINS: 'stress_checkins',
  ANALYTICS_EVENTS: 'analytics_events',
  DAILY_BRIEFS: 'rectotime_daily_briefs',
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

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  // STRESS CHECK-INS
  // ----------------------------------------
  getStressCheckIns: (): StressCheckInRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STRESS_CHECKINS);
    const parsed = safeJsonParse<StressCheckInRecord[]>(data, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.stressLevel === 'number');
  },

  saveStressCheckIns: (checkIns: StressCheckInRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.STRESS_CHECKINS, JSON.stringify(checkIns));
  },

  addStressCheckIn: (checkIn: StressCheckInRecord): void => {
    const history = storage.getStressCheckIns();
    history.push(checkIn);
    storage.saveStressCheckIns(history.slice(-90));
  },

  getLastStressCheckIns: (limit = 7): StressCheckInRecord[] => {
    const history = storage.getStressCheckIns();
    return history.slice(-limit);
  },

  // ----------------------------------------
  // ANALYTICS EVENTS
  // ----------------------------------------
  getAnalyticsEvents: (): AnalyticsEvent[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS);
    const parsed = safeJsonParse<AnalyticsEvent[]>(data, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.name === 'string');
  },

  saveAnalyticsEvent: (event: AnalyticsEvent): void => {
    const events = storage.getAnalyticsEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_EVENTS, JSON.stringify(events.slice(-500)));
  },

  getStressAnalyticsSnapshot: (windowDays = 30): StressAnalyticsSnapshot => {
    const events = storage.getAnalyticsEvents();
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

    const recent = events.filter((event) => {
      const timestamp = new Date(event.timestamp).getTime();
      return !Number.isNaN(timestamp) && timestamp >= cutoff;
    });

    const predictionViewed = recent.filter((event) => event.name === 'prediction_viewed').length;
    const actionViewed = recent.filter((event) => event.name === 'action_viewed').length;
    const actionCompleted = recent.filter((event) => event.name === 'action_completed').length;
    const trialStarted = recent.filter((event) => event.name === 'stress_pro_trial_started').length;

    return {
      predictionViewed,
      actionViewed,
      actionCompleted,
      trialStarted,
      actionViewRate: predictionViewed > 0 ? actionViewed / predictionViewed : 0,
      actionCompletionRate: actionViewed > 0 ? actionCompleted / actionViewed : 0,
      trialConversionRate: predictionViewed > 0 ? trialStarted / predictionViewed : 0,
    };
  },

  // ----------------------------------------
  // DAILY BRIEFS
  // ----------------------------------------
  getDailyBrief: (dateKey = getLocalDateKey(new Date())): DailyBriefRecord | null => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_BRIEFS);
    const parsed = safeJsonParse<Record<string, DailyBriefRecord>>(data, {});
    const entry = parsed[dateKey];

    if (!entry || typeof entry !== 'object') return null;
    if (typeof entry.topPriority !== 'string' || typeof entry.mustWin !== 'string' || typeof entry.shutdownNote !== 'string') {
      return null;
    }

    return {
      date: entry.date || dateKey,
      topPriority: entry.topPriority,
      mustWin: entry.mustWin,
      shutdownNote: entry.shutdownNote,
      updatedAt: entry.updatedAt || new Date().toISOString(),
    };
  },

  saveDailyBrief: (record: DailyBriefRecord): void => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_BRIEFS);
    const parsed = safeJsonParse<Record<string, DailyBriefRecord>>(data, {});
    const next = {
      ...parsed,
      [record.date]: record,
    };

    const sortedDates = Object.keys(next).sort((a, b) => b.localeCompare(a));
    const trimmed = sortedDates.slice(0, 45).reduce<Record<string, DailyBriefRecord>>((acc, key) => {
      acc[key] = next[key];
      return acc;
    }, {});

    localStorage.setItem(STORAGE_KEYS.DAILY_BRIEFS, JSON.stringify(trimmed));
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

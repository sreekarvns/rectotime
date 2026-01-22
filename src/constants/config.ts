/**
 * Application-wide constants
 * Colors, timers, categories, UI settings
 */

// Timer Presets (in minutes)
export const TIMER_PRESETS = {
  POMODORO: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
} as const;

// Goal Categories
export const GOAL_CATEGORIES = [
  { id: 'leetcode', label: 'LeetCode', icon: '💻', color: 'bg-blue-500' },
  { id: 'applications', label: 'Applications', icon: '📝', color: 'bg-green-500' },
  { id: 'learning', label: 'Learning', icon: '📚', color: 'bg-purple-500' },
  { id: 'other', label: 'Other', icon: '⭐', color: 'bg-yellow-500' },
] as const;

// Activity Types
export const ACTIVITY_TYPES = {
  PRODUCTIVE: 'productive',
  DISTRACTION: 'distraction',
  NEUTRAL: 'neutral',
} as const;

// View Modes
export const VIEWS = {
  DASHBOARD: 'dashboard',
  GOALS: 'goals',
  ACTIVITY: 'activity',
  SETTINGS: 'settings',
} as const;

// Focus Score Factors
export const FOCUS_FACTORS = {
  STARTED_TRACKING: 'started tracking',
  STOPPED_TRACKING: 'stopped tracking',
  COMPLETED_GOAL: 'completed goal',
  DISTRACTION: 'distraction detected',
  IDLE: 'idle period',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  GOALS: 'productivity_goals',
  ACTIVITIES: 'productivity_activities',
  CHAT_HISTORY: 'productivity_chat',
  SETTINGS: 'productivity_settings',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Notification Settings
export const NOTIFICATIONS = {
  TIMER_COMPLETE: {
    title: 'Timer Complete!',
    body: 'Your timer is done!',
  },
  GOAL_COMPLETED: {
    title: 'Goal Achieved! 🎉',
    body: 'Great work on completing your goal!',
  },
  FOCUS_WARNING: {
    title: 'Focus Drop Detected',
    body: 'Your focus score is dropping. Consider taking a break.',
  },
} as const;

// UI Settings
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  AI_PANEL_WIDTH: '30%',
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  MAX_GOALS_DISPLAY: 3,
  MAX_ACTIVITIES_DISPLAY: 5,
} as const;

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  GOALS: '/api/goals',
  ACTIVITIES: '/api/activities',
  ANALYTICS: '/api/analytics',
  AI_GUIDANCE: '/api/ai/guidance',
} as const;

export default {
  TIMER_PRESETS,
  GOAL_CATEGORIES,
  ACTIVITY_TYPES,
  VIEWS,
  FOCUS_FACTORS,
  STORAGE_KEYS,
  NOTIFICATIONS,
  UI_CONFIG,
  API_ENDPOINTS,
};

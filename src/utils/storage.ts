import { Activity, Goal, ChatMessage } from '../types';

const STORAGE_KEYS = {
  ACTIVITIES: 'productivity_activities',
  GOALS: 'productivity_goals',
  CHAT_HISTORY: 'productivity_chat',
  SETTINGS: 'productivity_settings',
};

export const storage = {
  getActivities: (): Activity[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.map((a: any) => ({
        ...a,
        startTime: new Date(a.startTime),
        endTime: a.endTime ? new Date(a.endTime) : undefined,
      })) : [];
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  },

  saveActivities: (activities: Activity[]) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  getGoals: (): Goal[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.map((g: any) => ({
        ...g,
        deadline: g.deadline ? new Date(g.deadline) : undefined,
      })) : [];
    } catch (error) {
      console.error('Error loading goals:', error);
      return [];
    }
  },

  saveGoals: (goals: Goal[]) => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getChatHistory: (): ChatMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  },

  saveChatMessage: (message: ChatMessage) => {
    const history = storage.getChatHistory();
    history.push(message);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
  },

  clearChatHistory: () => {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },
};

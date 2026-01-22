export interface Activity {
  id: string;
  url: string;
  domain: string;
  category: 'productive' | 'distraction' | 'neutral';
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  title?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  category: 'leetcode' | 'applications' | 'learning' | 'other';
  completed: boolean;
}

export interface AIGuidance {
  type: 'nudge' | 'warning' | 'celebration' | 'suggestion' | 'reminder';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FocusScore {
  value: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export interface CurrentStatus {
  activity: Activity | null;
  timeSpent: number; // seconds
  focusScore: FocusScore;
  isIdle: boolean;
}

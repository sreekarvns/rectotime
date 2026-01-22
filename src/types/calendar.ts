/**
 * Calendar & Timetable Type Definitions
 * Covers scheduled tasks, events, and recurring patterns
 */

// Core Event/Task Type
export interface ScheduledTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  startTime: Date;
  endTime: Date;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  
  // Linking to goals
  linkedGoals: string[];
  
  // Recurring pattern
  recurring?: RecurringPattern;
  recurrenceRule?: string; // iCalendar RRULE format
  
  // Tracking
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  completedAt?: Date;
  
  // Metadata
  reminders?: Reminder[];
  tags?: string[];
  attachments?: Attachment[];
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Task Categories
export type TaskCategory = 'study' | 'work' | 'personal' | 'break' | 'health' | 'custom';

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isVisible: boolean;
  order: number;
}

// Recurring Events
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0-6 (Mon-Sun)
  daysOfMonth?: number[];
  monthsOfYear?: number[];
  endDate?: Date;
  occurrences?: number;
  exceptions?: Date[]; // Dates to skip
}

// Calendar View Settings
export type CalendarViewType = 'month' | 'week' | 'day' | 'timetable';

export interface CalendarSettings {
  view: CalendarViewType;
  currentDate: Date;
  weekStartsOn: 'monday' | 'sunday';
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
  workingHoursStart: number; // 0-23
  workingHoursEnd: number;
}

// Timetable/Hourly View
export interface TimetableSlot {
  date: Date;
  hour: number;
  tasks: ScheduledTask[];
  isWorkingHour: boolean;
  isBlocked: boolean; // For breaks, lunch, etc.
}

// Reminders
export interface Reminder {
  id: string;
  type: 'notification' | 'email' | 'sms';
  timing: 'at-time' | 'before' | 'after';
  value: number; // minutes before/after
  sent: boolean;
  sentAt?: Date;
}

// Attachments
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// Calendar Event (lighter version for display)
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  category: TaskCategory;
  color: string;
  priority: 'low' | 'medium' | 'high';
  isAllDay?: boolean;
  recurring?: boolean;
}

// Date Range Filter
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Time Range Filter
export interface TimeRange {
  startHour: number;
  endHour: number;
}

// Calendar State
export interface CalendarState {
  tasks: ScheduledTask[];
  selectedDate: Date;
  selectedTask: ScheduledTask | null;
  viewType: CalendarViewType;
  filters: {
    categories: TaskCategory[];
    priorities: ('low' | 'medium' | 'high')[];
    statuses: ('pending' | 'in-progress' | 'completed' | 'cancelled')[];
    dateRange: DateRange;
    searchTerm: string;
  };
  settings: CalendarSettings;
}

// Conflict Detection
export interface TimeConflict {
  task1: ScheduledTask;
  task2: ScheduledTask;
  overlapMinutes: number;
}

// Drag & Drop Context
export interface DragItem {
  id: string;
  type: 'task' | 'goal' | 'category';
  data: any;
}

export interface DropZone {
  id: string;
  type: 'timetable-slot' | 'calendar-date' | 'goal-slot';
  date?: Date;
  hour?: number;
}

// Export Formats
export type ExportFormat = 'json' | 'csv' | 'ics' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeCompletedTasks: boolean;
  dateRange: DateRange;
  categories: TaskCategory[];
  filename: string;
}

// Statistics
export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTaskDuration: number;
  focusTime: number;
  breakTime: number;
  busySlots: number;
  freeSlots: number;
  busiestDay: string;
  mostProductiveHour: number;
  categoryBreakdown: Record<TaskCategory, number>;
}

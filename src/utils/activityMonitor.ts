import { Activity } from '../types';
import { storage } from './storage';

const PRODUCTIVE_DOMAINS = [
  'leetcode.com',
  'github.com',
  'stackoverflow.com',
  'developer.mozilla.org',
  'docs.',
  'medium.com',
  'dev.to',
  'linkedin.com',
];

const DISTRACTION_DOMAINS = [
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
];

export const categorizeDomain = (url: string): 'productive' | 'distraction' | 'neutral' => {
  const domain = new URL(url).hostname.toLowerCase();
  
  if (PRODUCTIVE_DOMAINS.some(d => domain.includes(d))) {
    return 'productive';
  }
  
  if (DISTRACTION_DOMAINS.some(d => domain.includes(d))) {
    return 'distraction';
  }
  
  return 'neutral';
};

export const getCurrentActivity = (): Activity | null => {
  // This will be populated by the Chrome extension
  try {
    const data = localStorage.getItem('current_activity');
    if (!data) return null;
    
    const activity = JSON.parse(data);
    if (!activity || !activity.startTime) return null;
    
    return {
      ...activity,
      startTime: new Date(activity.startTime),
      endTime: activity.endTime ? new Date(activity.endTime) : undefined,
    };
  } catch (error) {
    console.error('Error parsing current activity:', error);
    return null;
  }
};

export const logActivity = (activity: Activity) => {
  const activities = storage.getActivities();
  activities.push(activity);
  storage.saveActivities(activities);
};

export const getTodayStats = () => {
  // Get activities from localStorage (synced by Chrome extension)
  const activities = storage.getActivities();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivities = activities.filter(a => {
    const start = new Date(a.startTime);
    start.setHours(0, 0, 0, 0);
    return start.getTime() === today.getTime();
  });
  
  const productive = todayActivities
    .filter(a => a.category === 'productive')
    .reduce((sum, a) => sum + a.duration, 0);
  
  const distraction = todayActivities
    .filter(a => a.category === 'distraction')
    .reduce((sum, a) => sum + a.duration, 0);
  
  return {
    productive: Math.round(productive / 60), // minutes
    distraction: Math.round(distraction / 60),
    total: Math.round((productive + distraction) / 60),
    activities: todayActivities.length,
  };
};

import { AIGuidance, Goal, CurrentStatus } from '../types';
import { getTodayStats } from './activityMonitor';

export const generateGuidance = (
  currentStatus: CurrentStatus,
  goals: Goal[]
): AIGuidance[] => {
  const guidance: AIGuidance[] = [];
  const stats = getTodayStats();
  const now = new Date();
  const hour = now.getHours();
  
  // Break reminders
  if (currentStatus.timeSpent > 90 * 60) { // 90 minutes
    guidance.push({
      type: 'reminder',
      message: "You've been coding for 90 minutes - take a 10 minute break to recharge!",
      priority: 'high',
      timestamp: now,
    });
  }
  
  // Distraction warnings
  if (currentStatus.activity?.category === 'distraction' && currentStatus.timeSpent > 15 * 60) {
    guidance.push({
      type: 'warning',
      message: `You've been on ${currentStatus.activity.domain} for 15 minutes - time to get back to DSA?`,
      priority: 'high',
      timestamp: now,
    });
  }
  
  // Goal alignment checks
  goals.forEach(goal => {
    if (goal.completed) return;
    
    const progress = (goal.current / goal.target) * 100;
    const daysRemaining = goal.deadline 
      ? Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Behind on goals
    if (daysRemaining && daysRemaining > 0) {
      const dailyTarget = goal.target / (daysRemaining + 1);
      const todayProgress = goal.current - (goal.target * (1 - daysRemaining / (daysRemaining + 1)));
      
      if (todayProgress < dailyTarget * 0.5) {
        guidance.push({
          type: 'warning',
          message: `You're behind on "${goal.title}" - need ${Math.ceil(dailyTarget - todayProgress)} more ${goal.unit} today`,
          priority: 'medium',
          timestamp: now,
        });
      }
    }
    
    // Celebrations
    if (progress >= 100) {
      guidance.push({
        type: 'celebration',
        message: `🎉 Goal "${goal.title}" completed! Amazing work!`,
        priority: 'low',
        timestamp: now,
      });
    } else if (progress >= 75 && progress < 100) {
      guidance.push({
        type: 'celebration',
        message: `You're ${Math.round(100 - progress)}% away from completing "${goal.title}"! Keep going! 🔥`,
        priority: 'low',
        timestamp: now,
      });
    }
  });
  
  // Time-based suggestions
  if (hour >= 19 && hour <= 21) {
    guidance.push({
      type: 'suggestion',
      message: "It's your peak focus time (7-9 PM) - tackle your hardest problem now!",
      priority: 'medium',
      timestamp: now,
    });
  }
  
  // LeetCode specific suggestions
  if (currentStatus.activity?.domain.includes('leetcode.com')) {
    if (currentStatus.timeSpent > 45 * 60) {
      guidance.push({
        type: 'nudge',
        message: "You've been on LeetCode for 45 minutes - solved 2 easy problems? Try a medium one!",
        priority: 'medium',
        timestamp: now,
      });
    }
  }
  
  // Productivity stats
  if (stats.productive > 120) {
    guidance.push({
      type: 'celebration',
      message: `Incredible! ${Math.round(stats.productive)} minutes of productive time today! 🚀`,
      priority: 'low',
      timestamp: now,
    });
  }
  
  return guidance.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const generateAIChatResponse = async (message: string, context: {
  currentStatus: CurrentStatus;
  goals: Goal[];
}): Promise<string> => {
  // Import AI service
  const { callAI } = await import('./aiService');
  
  // Call the AI service (will use configured provider or fallback to mock)
  return await callAI(message, {
    currentStatus: context.currentStatus,
    goals: context.goals,
  });
};

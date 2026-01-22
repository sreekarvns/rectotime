import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Dashboard/Sidebar';
import { AICompanion } from './components/AICompanion';
import { GoalsWidget } from './components/Dashboard/GoalsWidget';
import { ActivityStatsWidget } from './components/Dashboard/ActivityStatsWidget';
import { TimeTrackingWidget } from './components/Dashboard/TimeTrackingWidget';
import { AISettings } from './components/Dashboard/AISettings';
import { CurrentStatus, Goal } from './types';
import { storage } from './utils/storage';
import { getCurrentActivity } from './utils/activityMonitor';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAICollapsed, setIsAICollapsed] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>({
    activity: null,
    timeSpent: 0,
    focusScore: {
      value: 85,
      trend: 'up',
      factors: ['consistent activity', 'good focus periods'],
    },
    isIdle: false,
  });
  
  useEffect(() => {
    // Load goals
    const savedGoals = storage.getGoals();
    if (savedGoals.length === 0) {
      // Initialize with sample goals
      const sampleGoals: Goal[] = [
        {
          id: '1',
          title: 'LeetCode Problems',
          description: 'Solve 100 problems in 30 days',
          target: 100,
          current: 23,
          unit: 'problems',
          category: 'leetcode',
          completed: false,
        },
        {
          id: '2',
          title: 'Job Applications',
          description: 'Apply to 50 companies',
          target: 50,
          current: 12,
          unit: 'applications',
          category: 'applications',
          completed: false,
        },
      ];
      setGoals(sampleGoals);
      storage.saveGoals(sampleGoals);
    } else {
      setGoals(savedGoals);
    }
    
    // Load current activity
    const loadActivity = () => {
      const activity = getCurrentActivity();
      if (activity) {
        const timeSpent = Math.floor((Date.now() - new Date(activity.startTime).getTime()) / 1000);
        setCurrentStatus(prev => ({
          ...prev,
          activity,
          timeSpent,
        }));
      } else {
        setCurrentStatus(prev => ({
          ...prev,
          activity: null,
          timeSpent: 0,
        }));
      }
    };
    
    loadActivity();
    
    // Listen for activity updates from extension
    const handleActivityUpdate = (event: CustomEvent) => {
      const activity = event.detail;
      if (activity) {
        const timeSpent = Math.floor((Date.now() - new Date(activity.startTime).getTime()) / 1000);
        setCurrentStatus(prev => ({
          ...prev,
          activity,
          timeSpent,
        }));
      }
    };
    
    window.addEventListener('activityUpdate', handleActivityUpdate as EventListener);
    
    // Update activity every second
    const interval = setInterval(() => {
      loadActivity();
    }, 1000);
    
    // Also check localStorage periodically for extension updates
    const storageInterval = setInterval(() => {
      const stored = localStorage.getItem('current_activity');
      if (stored) {
        try {
          const activity = JSON.parse(stored);
          if (activity) {
            const timeSpent = Math.floor((Date.now() - new Date(activity.startTime).getTime()) / 1000);
            setCurrentStatus(prev => ({
              ...prev,
              activity: {
                ...activity,
                startTime: new Date(activity.startTime),
              },
              timeSpent,
            }));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }, 2000);
    
    return () => {
      clearInterval(interval);
      clearInterval(storageInterval);
      window.removeEventListener('activityUpdate', handleActivityUpdate as EventListener);
    };
  }, []);
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className={`transition-all duration-300 ${isAICollapsed ? 'mr-12' : 'mr-[30%]'} ml-64`}>
        <div className="p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary-dark mb-2">Dashboard</h2>
                <p className="text-gray-500">Welcome back! Here's your productivity overview.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GoalsWidget goals={goals} />
                <ActivityStatsWidget />
                <TimeTrackingWidget currentStatus={currentStatus} />
              </div>
            </div>
          )}
          
          {activeView === 'goals' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary-dark dark:text-white mb-2">Goals</h2>
                <p className="text-gray-500 dark:text-gray-400">Track and manage your objectives.</p>
              </div>
              <GoalsWidget goals={goals} />
            </div>
          )}
          
          {activeView === 'activity' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary-dark dark:text-white mb-2">Activity</h2>
                <p className="text-gray-500 dark:text-gray-400">Monitor your productivity patterns.</p>
              </div>
              <ActivityStatsWidget />
            </div>
          )}
          
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary-dark dark:text-white mb-2">Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Configure your productivity dashboard.</p>
              </div>
              <AISettings />
            </div>
          )}
        </div>
      </main>
      
      <AICompanion
        currentStatus={currentStatus}
        goals={goals}
        isCollapsed={isAICollapsed}
        onToggle={() => setIsAICollapsed(!isAICollapsed)}
      />
      </div>
    </ThemeProvider>
  );
}

export default App;

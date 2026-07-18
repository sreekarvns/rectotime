import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { CurrentStatus } from '../../types';

interface CurrentStatusProps {
  status: CurrentStatus;
}

export const CurrentStatusDisplay: React.FC<CurrentStatusProps> = ({ status }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-white">Current Status</h3>
      
      {status.activity ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
            <div className="flex-1">
              <p className="font-medium text-sm text-primary-dark dark:text-white truncate">
                {status.activity.title || status.activity.domain}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {status.activity.category === 'productive' ? 'Productive' : 
                 status.activity.category === 'distraction' ? 'Distraction' : 'Neutral'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">{formatTime(status.timeSpent)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No active activity</p>
      )}
      
      <div className="pt-3 border-t border-secondary-light dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-primary-dark dark:text-white">Focus Score</span>
          </div>
          <span className="text-lg font-bold text-accent-blue">{status.focusScore.value}</span>
        </div>
        <div className="w-full h-2 bg-secondary-light dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${status.focusScore.value}%` }}
          />
        </div>
        {status.focusScore.trend === 'up' && (
          <p className="text-xs text-green-600 mt-1">↑ Improving</p>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Clock, TrendingUp, Zap, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { getTodayStats } from '../../utils/activityMonitor';
import { CurrentStatus } from '../../types';

interface ActivityStatsWidgetProps {
  currentStatus: CurrentStatus;
}

export const ActivityStatsWidget: React.FC<ActivityStatsWidgetProps> = ({ currentStatus }) => {
  const stats = getTodayStats();
  
  const statCards = [
    {
      icon: Clock,
      label: 'Productive Time',
      value: `${stats.productive}m`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Activity,
      label: 'Total Time',
      value: `${stats.total}m`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Activities',
      value: stats.activities.toString(),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Zap,
      label: 'Focus Score',
      value: Math.round(currentStatus.focusScore.value).toString(),
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
  ];
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-primary-dark dark:text-white mb-6">Today's Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-background-darkSecondary dark:to-gray-800 border border-secondary-light dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} dark:bg-gray-700 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-dark dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

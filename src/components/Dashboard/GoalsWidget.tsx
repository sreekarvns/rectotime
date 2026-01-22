import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import { Goal } from '../../types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

interface GoalsWidgetProps {
  goals: Goal[];
}

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({ goals }) => {
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-dark dark:text-white">Goals</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{activeGoals.length} active</p>
          </div>
        </div>
        <Badge variant="success">{completedGoals.length} completed</Badge>
      </div>
      
      <div className="space-y-4">
        {activeGoals.slice(0, 3).map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-dark dark:text-white">{goal.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {goal.current}/{goal.target} {goal.unit}
                </span>
              </div>
              <ProgressBar value={progress} showLabel={false} />
            </div>
          );
        })}
        
        {activeGoals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>All goals completed! 🎉</p>
          </div>
        )}
      </div>
    </Card>
  );
};

import React from 'react';
import { Plus, Coffee, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface QuickActionsProps {
  onLogProblem?: () => void;
  onStartBreak?: () => void;
  onAskAI?: () => void;
  onMarkGoalComplete?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onLogProblem,
  onStartBreak,
  onAskAI,
  onMarkGoalComplete,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-white">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onLogProblem}
          icon={<Plus className="w-4 h-4" />}
          className="w-full"
        >
          Log Problem
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onStartBreak}
          icon={<Coffee className="w-4 h-4" />}
          className="w-full"
        >
          Break Timer
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onAskAI}
          icon={<MessageSquare className="w-4 h-4" />}
          className="w-full"
        >
          Ask AI
        </Button>
        
        <Button
          variant="accent"
          size="sm"
          onClick={onMarkGoalComplete}
          icon={<CheckCircle className="w-4 h-4" />}
          className="w-full"
        >
          Complete Goal
        </Button>
      </div>
    </div>
  );
};

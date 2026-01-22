import React from 'react';
import { Goal } from '../../types';
import { GoalsWidget } from './GoalsWidget';
import { TimeTrackingWidget } from './TimeTrackingWidget';
import { ActivityStatsWidget } from './ActivityStatsWidget';
import { useGoalManagement } from '../../hooks/useGoalManagement';

interface DashboardProps {
  goals: Goal[];
}

/**
 * Main dashboard view combining goals, timers, and activity
 */
const Dashboard: React.FC<DashboardProps> = ({ goals: initialGoals }) => {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalManagement(initialGoals);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Widget */}
        <GoalsWidget goals={goals} onAddGoal={addGoal} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} />

        {/* Activity Stats */}
        <ActivityStatsWidget
          currentStatus={{
            activity: null,
            timeSpent: 0,
            focusScore: { value: 0, trend: 'stable', factors: [] },
            isIdle: false,
          }}
        />

        {/* Time Tracking */}
        <TimeTrackingWidget
          currentStatus={{
            activity: null,
            timeSpent: 0,
            focusScore: { value: 0, trend: 'stable', factors: [] },
            isIdle: false,
          }}
          onStart={() => {}}
          onPause={() => {}}
          onStop={() => {}}
        />
      </div>
    </div>
  );
};

export default Dashboard;

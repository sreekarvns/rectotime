import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import { Goal } from '../../types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

interface GoalsWidgetProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    unit: '',
    category: 'other' as Goal['category']
  });
  const [editGoal, setEditGoal] = useState<Partial<Goal>>({});

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

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full mb-4 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        + Add Goal
      </button>

      {showAddForm && (
        <div className="mb-4 p-4 border border-secondary-light dark:border-gray-700 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Add New Goal</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
            />
            <input
              type="text"
              placeholder="Description"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Target"
                value={newGoal.target || ''}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                className="flex-1 px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
              />
              <input
                type="text"
                placeholder="Unit (e.g., problems)"
                value={newGoal.unit}
                onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                className="flex-1 px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
              />
            </div>
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
              className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
            >
              <option value="leetcode">LeetCode</option>
              <option value="applications">Applications</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newGoal.title && newGoal.target > 0) {
                    onAddGoal({
                      ...newGoal,
                      current: 0,
                      completed: false,
                    });
                    setNewGoal({
                      title: '',
                      description: '',
                      target: 0,
                      unit: '',
                      category: 'other'
                    });
                    setShowAddForm(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Goal
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

import React, { useState } from 'react';
import { Target, CheckCircle, Trash2 } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    unit: '',
    category: 'other' as Goal['category']
  });

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
              onChange={(e) => setNewGoal((prev: typeof newGoal) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
            />
            <input
              type="text"
              placeholder="Description"
              value={newGoal.description}
              onChange={(e) => setNewGoal((prev: typeof newGoal) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Target"
                value={newGoal.target || ''}
                onChange={(e) => setNewGoal((prev: typeof newGoal) => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                className="flex-1 px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
              />
              <input
                type="text"
                placeholder="Unit (e.g., problems)"
                value={newGoal.unit}
                onChange={(e) => setNewGoal((prev: typeof newGoal) => ({ ...prev, unit: e.target.value }))}
                className="flex-1 px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
              />
            </div>
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal((prev: typeof newGoal) => ({ ...prev, category: e.target.value as Goal['category'] }))}
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
                    const goalToAdd: Omit<Goal, 'id'> = {
                      ...newGoal,
                      current: 0,
                      completed: false,
                    };
                    console.log('Adding goal:', goalToAdd);
                    onAddGoal(goalToAdd);
                    setNewGoal({
                      title: '',
                      description: '',
                      target: 0,
                      unit: '',
                      category: 'other'
                    });
                    setShowAddForm(false);
                  } else {
                    alert('Please fill in title and target fields');
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
            <div key={goal.id} className="space-y-2 p-3 bg-secondary-light dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-dark dark:text-white">{goal.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {goal.current}/{goal.target} {goal.unit}
                </span>
              </div>
              <ProgressBar value={progress} showLabel={false} />
              <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      if (goal.current > 0) {
                        onUpdateGoal(goal.id, { current: goal.current - 1 });
                      }
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    title="Decrease progress"
                  >
                    −
                  </button>
                  <button
                    onClick={() => {
                      if (goal.current < goal.target) {
                        const newCurrent = goal.current + 1;
                        const isCompleted = newCurrent >= goal.target;
                        onUpdateGoal(goal.id, { 
                          current: newCurrent,
                          completed: isCompleted
                        });
                      }
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                    title="Increase progress"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(goal.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                  title="Delete goal"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
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
      
      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-secondary-light dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Completed ({completedGoals.length})</h4>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{goal.title}</span>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(goal.id)}
                  className="px-2 py-1 text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                  title="Delete goal"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-lg max-w-sm">
            <h3 className="text-lg font-bold text-primary-dark dark:text-white mb-2">Delete Goal?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{goals.find(g => g.id === showDeleteConfirm)?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 text-primary-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteGoal(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

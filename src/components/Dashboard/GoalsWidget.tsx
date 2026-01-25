import React, { useState, memo, useCallback } from 'react';
import { Target, CheckCircle, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Goal, NewGoalSchema, getValidationErrors } from '../../types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { EmptyGoals } from '../ui/EmptyState';
import { SkeletonGoalItem } from '../ui/Skeleton';
import { sanitizeText } from '../../utils/sanitize';

interface GoalsWidgetProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  isLoading?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  target?: string;
  unit?: string;
  category?: string;
}

/**
 * Goals Widget Component (Memoized for performance)
 * Handles goal CRUD with validation and sanitization
 */
export const GoalsWidget: React.FC<GoalsWidgetProps> = memo(({ 
  goals, 
  onAddGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  isLoading = false 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    unit: '',
    category: 'other' as Goal['category']
  });

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  // Validate and add goal
  const handleAddGoal = useCallback(() => {
    // Sanitize inputs
    const sanitizedGoal = {
      title: sanitizeText(newGoal.title),
      description: sanitizeText(newGoal.description),
      target: newGoal.target,
      current: 0,
      unit: sanitizeText(newGoal.unit),
      category: newGoal.category,
      completed: false,
    };

    // Validate with Zod
    const errors = getValidationErrors(NewGoalSchema, sanitizedGoal);
    
    if (errors) {
      setFormErrors({
        title: errors.title,
        description: errors.description,
        target: errors.target,
        unit: errors.unit,
      });
      return;
    }

    // Clear errors and submit
    setFormErrors({});
    onAddGoal(sanitizedGoal);
    setNewGoal({
      title: '',
      description: '',
      target: 0,
      unit: '',
      category: 'other'
    });
    setShowAddForm(false);
  }, [newGoal, onAddGoal]);

  // Handle rename with sanitization
  const handleRename = useCallback((goalId: string) => {
    const sanitizedName = sanitizeText(renameValue);
    if (sanitizedName.trim()) {
      onUpdateGoal(goalId, { title: sanitizedName });
      setRenamingId(null);
      setRenameValue('');
    }
  }, [renameValue, onUpdateGoal]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-dark dark:text-white">Goals</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonGoalItem />
          <SkeletonGoalItem />
          <SkeletonGoalItem />
        </div>
      </Card>
    );
  }
  
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
        aria-expanded={showAddForm}
      >
        + Add Goal
      </button>

      {showAddForm && (
        <div className="mb-4 p-4 border border-secondary-light dark:border-gray-700 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Add New Goal</h4>
          <div className="space-y-3">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => {
                  setNewGoal((prev) => ({ ...prev, title: e.target.value }));
                  if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-background-darkSecondary ${
                  formErrors.title 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-secondary-light dark:border-gray-700'
                }`}
                aria-invalid={!!formErrors.title}
                aria-describedby={formErrors.title ? 'title-error' : undefined}
              />
              {formErrors.title && (
                <p id="title-error" className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <input
                type="text"
                placeholder="Description"
                value={newGoal.description}
                onChange={(e) => {
                  setNewGoal((prev) => ({ ...prev, description: e.target.value }));
                  if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-background-darkSecondary ${
                  formErrors.description 
                    ? 'border-red-500' 
                    : 'border-secondary-light dark:border-gray-700'
                }`}
              />
              {formErrors.description && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Target and Unit */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Target"
                  value={newGoal.target || ''}
                  onChange={(e) => {
                    setNewGoal((prev) => ({ ...prev, target: parseInt(e.target.value) || 0 }));
                    if (formErrors.target) setFormErrors(prev => ({ ...prev, target: undefined }));
                  }}
                  min="1"
                  max="10000"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-background-darkSecondary ${
                    formErrors.target 
                      ? 'border-red-500' 
                      : 'border-secondary-light dark:border-gray-700'
                  }`}
                />
                {formErrors.target && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.target}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Unit (e.g., problems)"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
                />
              </div>
            </div>

            {/* Category Select */}
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal((prev) => ({ ...prev, category: e.target.value as Goal['category'] }))}
              className="w-full px-3 py-2 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary"
            >
              <option value="leetcode">LeetCode</option>
              <option value="applications">Applications</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                className="flex-1 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Goal
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors({});
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <EmptyGoals onAdd={() => setShowAddForm(true)} />
        )}

        {activeGoals.slice(0, 3).map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="space-y-2 p-3 bg-secondary-light dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                {renamingId === goal.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="flex-1 px-2 py-1 bg-white dark:bg-gray-700 text-primary-dark dark:text-white rounded text-sm border border-accent-blue"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && renameValue.trim()) {
                          handleRename(goal.id);
                        } else if (e.key === 'Escape') {
                          setRenamingId(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleRename(goal.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                      aria-label="Save rename"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setRenamingId(null)}
                      className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors"
                      aria-label="Cancel rename"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-primary-dark dark:text-white">{goal.title}</span>
                    <button
                      onClick={() => {
                        setRenamingId(goal.id);
                        setRenameValue(goal.title);
                      }}
                      className="ml-2 p-1 text-gray-500 dark:text-gray-400 hover:text-accent-blue transition-colors"
                      title="Rename goal"
                      aria-label="Rename goal"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
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
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Decrease progress"
                    aria-label="Decrease progress"
                    disabled={goal.current <= 0}
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
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                    title="Increase progress"
                    aria-label="Increase progress"
                    disabled={goal.current >= goal.target}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(goal.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                  title="Delete goal"
                  aria-label="Delete goal"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        
        {activeGoals.length === 0 && completedGoals.length > 0 && (
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
});

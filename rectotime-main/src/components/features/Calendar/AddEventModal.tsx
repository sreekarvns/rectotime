import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, RotateCw, Trash2 } from 'lucide-react';
import { ScheduledTask, RecurringPattern } from '../../../types/calendar';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ScheduledTask, 'id'>) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: ScheduledTask;
  selectedDate?: Date;
  selectedHour?: number;
}

const CATEGORIES = [
  { value: 'leetcode', label: 'LeetCode', color: '#FF6B6B' },
  { value: 'applications', label: 'Applications', color: '#4ECDC4' },
  { value: 'learning', label: 'Learning', color: '#45B7D1' },
  { value: 'meeting', label: 'Meeting', color: '#FFA07A' },
  { value: 'break', label: 'Break', color: '#95E1D3' },
  { value: 'other', label: 'Other', color: '#A0AEC0' },
];

const RECURRENCE_OPTIONS: Array<{ value: RecurringPattern['frequency'] | 'none'; label: string }> = [
  { value: 'none', label: 'No recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

/**
 * Modal for creating and editing scheduled tasks
 * Supports recurring events, priorities, and reminders
 */
export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  selectedDate = new Date(),
  selectedHour = 10,
}) => {
  const [formData, setFormData] = useState<Omit<ScheduledTask, 'id'>>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    category: 'custom',
    priority: 'medium',
    color: '#A0AEC0',
    status: 'pending',
    linkedGoals: [],
    recurring: undefined,
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<
    RecurringPattern['frequency'] | 'none'
  >('none');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when modal opens or task changes
  useEffect(() => {
    if (initialTask) {
      setFormData(initialTask);
      setRecurrenceFrequency(initialTask.recurring?.frequency || 'none');
    } else {
      const startTime = new Date(selectedDate);
      startTime.setHours(selectedHour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      setFormData({
        title: '',
        description: '',
        startTime,
        endTime,
        category: 'custom',
        priority: 'medium',
        color: '#A0AEC0',
        status: 'pending',
        linkedGoals: [],
        recurring: undefined,
        reminders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setRecurrenceFrequency('none');
    }
  }, [isOpen, initialTask, selectedDate, selectedHour]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    const titleLength = formData.title.trim().length;
    if (titleLength > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const taskToSave = {
      ...formData,
      recurring:
        recurrenceFrequency !== 'none'
          ? {
              frequency: recurrenceFrequency as any,
              endDate:
                recurrenceFrequency === 'daily'
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                  : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
              interval: 1,
            }
          : undefined,
    };

    onSave(taskToSave);
    onClose();
  };

  // Update date/time helper
  const updateStartTime = (field: string, value: string) => {
    const newStart = new Date(formData.startTime);
    if (field === 'date') {
      const [year, month, day] = value.split('-');
      newStart.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (field === 'time') {
      const [hours, minutes] = value.split(':');
      newStart.setHours(parseInt(hours), parseInt(minutes));
    }

    // Adjust end time if needed
    let newEnd = new Date(formData.endTime);
    if (newEnd <= newStart) {
      newEnd = new Date(newStart);
      newEnd.setHours(newEnd.getHours() + 1);
    }

    setFormData({
      ...formData,
      startTime: newStart,
      endTime: newEnd,
    });
  };

  const updateEndTime = (field: string, value: string) => {
    const newEnd = new Date(formData.endTime);
    if (field === 'date') {
      const [year, month, day] = value.split('-');
      newEnd.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (field === 'time') {
      const [hours, minutes] = value.split(':');
      newEnd.setHours(parseInt(hours), parseInt(minutes));
    }

    setFormData({
      ...formData,
      endTime: newEnd,
    });
  };

  const handleCategoryChange = (categoryValue: string) => {
    const category = CATEGORIES.find(c => c.value === categoryValue);
    setFormData({
      ...formData,
      category: categoryValue as any,
      color: category?.color || '#A0AEC0',
    });
  };

  if (!isOpen) return null;

  const startDateStr = formData.startTime.toISOString().split('T')[0];
  const endDateStr = formData.endTime.toISOString().split('T')[0];
  const startTimeStr = `${String(formData.startTime.getHours()).padStart(2, '0')}:${String(formData.startTime.getMinutes()).padStart(2, '0')}`;
  const endTimeStr = `${String(formData.endTime.getHours()).padStart(2, '0')}:${String(formData.endTime.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-background-darkSecondary rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-secondary-light dark:border-gray-700 bg-white dark:bg-background-darkSecondary">
          <h2 className="text-xl font-bold text-primary-dark dark:text-white">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
              className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add details..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
            />
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={startDateStr}
                onChange={e => updateStartTime('date', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </label>
              <input
                type="time"
                value={startTimeStr}
                onChange={e => updateStartTime('time', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
          </div>

          {/* End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDateStr}
                onChange={e => updateEndTime('date', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTimeStr}
                onChange={e => updateEndTime('time', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
          </div>
          {errors.endTime && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.endTime}
            </div>
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Recurrence
            </label>
            <select
              value={recurrenceFrequency}
              onChange={e =>
                setRecurrenceFrequency(
                  e.target.value as RecurringPattern['frequency'] | 'none'
                )
              }
              className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {RECURRENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Indicator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() =>
                    setFormData({ ...formData, color: cat.color })
                  }
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === cat.color
                      ? 'ring-2 ring-accent-blue scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: cat.color }}
                  title={cat.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-secondary-light dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 text-primary-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          {initialTask && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
              title="Delete this task"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-accent-blue text-white hover:bg-blue-600 transition-colors font-medium"
          >
            {initialTask ? 'Update' : 'Create'} Task
          </button>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-lg max-w-sm">
              <h3 className="text-lg font-bold text-primary-dark dark:text-white mb-2">Delete Task?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{formData.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 text-primary-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (initialTask && onDelete) {
                      onDelete(initialTask.id);
                      setShowDeleteConfirm(false);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEventModal;

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Trash2 } from 'lucide-react';
import { CalendarViewType, ScheduledTask } from '../../../types/calendar';

interface CalendarViewProps {
  viewType: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  tasks: ScheduledTask[];
  onAddTask: (hour: number, date: Date) => void;
  onSelectTask: (task: ScheduledTask) => void;
  onDeleteTask?: (taskId: string) => void;
}

/**
 * Main Calendar Component with Month/Week/Day views
 * Integrates with goal tracking and task scheduling
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  viewType,
  onViewChange,
  currentDate,
  onDateChange,
  tasks,
  onAddTask,
  onSelectTask,
  onDeleteTask,
}) => {
  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get tasks for specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Mini calendar navigation
  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    onDateChange(newDate);
  };

  // Today button
  const handleToday = () => {
    const today = new Date();
    onDateChange(today);
  };

  // Calendar days array
  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    return days;
  }, [currentDate, daysInMonth, firstDay]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Mini Calendar */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-4 shadow-sm border border-secondary-light dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary-dark dark:text-white">
              {monthName}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-1 hover:bg-secondary-light dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMonthChange(1)}
                className="p-1 hover:bg-secondary-light dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayTasks = getTasksForDate(day);
              const isToday =
                day.toDateString() === new Date().toDateString();
              const isSelected =
                day.toDateString() === currentDate.toDateString();

              return (
                <button
                  key={day.toString()}
                  onClick={() => onDateChange(day)}
                  aria-label={`${day.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}${dayTasks.length > 0 ? `, ${dayTasks.length} tasks` : ''}`}
                  aria-current={isToday ? 'date' : undefined}
                  aria-selected={isSelected}
                  className={`aspect-square rounded text-xs font-medium transition-all relative ${
                    isSelected
                      ? 'bg-accent-blue text-white'
                      : isToday
                      ? 'bg-blue-100 dark:bg-blue-900 text-accent-blue border-2 border-accent-blue'
                      : 'hover:bg-secondary-light dark:hover:bg-gray-700 text-primary-dark dark:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {day.getDate()}
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayTasks.slice(0, 2).map((task, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: task.color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <button
            onClick={handleToday}
            className="w-full mt-4 px-3 py-2 bg-accent-blue text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-sm border border-secondary-light dark:border-gray-700">
          {/* View Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-accent-blue" />
              <h2 className="text-2xl font-bold text-primary-dark dark:text-white">
                {currentDate.toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
            </div>

            <div className="flex gap-2">
              {(['month', 'week', 'day', 'timetable'] as CalendarViewType[]).map(
                view => (
                  <button
                    key={view}
                    onClick={() => onViewChange(view)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      viewType === view
                        ? 'bg-accent-blue text-white'
                        : 'bg-secondary-light dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tasks for selected date */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-dark dark:text-white">
                Tasks ({getTasksForDate(currentDate).length})
              </h3>
              <button
                onClick={() => onAddTask(9, currentDate)}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {getTasksForDate(currentDate).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks scheduled for this day</p>
                <p className="text-xs mt-2">Click "Add Task" to create one</p>
              </div>
            ) : (
              getTasksForDate(currentDate).map(task => (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="w-full text-left p-3 rounded-lg border-l-4 hover:shadow-md transition-all bg-gray-50 dark:bg-gray-800"
                  style={{ borderColor: task.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary-dark dark:text-white">
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(task.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(task.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: task.color }}
                      >
                        {task.category}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                        {task.priority}
                      </span>
                      {onDeleteTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

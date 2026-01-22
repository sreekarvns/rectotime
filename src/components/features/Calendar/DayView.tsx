import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { ScheduledTask } from '../../../types/calendar';

interface DayViewProps {
  currentDate: Date;
  tasks: ScheduledTask[];
  onPreviousDay: () => void;
  onNextDay: () => void;
  onAddTask: (hour: number, date: Date) => void;
  onSelectTask: (task: ScheduledTask) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * Day view showing detailed 24-hour timeline for a single day
 */
export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  tasks,
  onPreviousDay,
  onNextDay,
  onAddTask,
  onSelectTask,
  onDeleteTask,
}) => {
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  // Get all tasks for current day sorted by time
  const dayTasks = useMemo(() => {
    return tasks
      .filter(
        task =>
          new Date(task.startTime).toDateString() ===
          currentDate.toDateString()
      )
      .sort((a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
      );
  }, [tasks, currentDate]);

  const getTodayClass = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday
      ? 'bg-blue-50 dark:bg-blue-900/20'
      : '';
  };

  const formatHour = (hour: number) => {
    const time = new Date();
    time.setHours(hour, 0);
    return time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white dark:bg-background-darkSecondary rounded-lg shadow-sm border border-secondary-light dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`p-6 border-b border-secondary-light dark:border-gray-700 ${getTodayClass(currentDate)}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={onPreviousDay}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-white">
              {currentDate.toLocaleDateString('default', {
                weekday: 'long',
              })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentDate.toLocaleDateString('default', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <button
            onClick={onNextDay}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent-blue" />
            <span className="text-gray-600 dark:text-gray-400">
              {dayTasks.length} tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">
              {dayTasks.filter(t => t.completedAt).length} completed
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-y-auto max-h-[70vh]">
        {hours.map(hour => {
          const tasksInHour = dayTasks.filter(
            task =>
              new Date(task.startTime).getHours() === hour
          );

          return (
            <div
              key={hour}
              className="flex border-b border-secondary-light dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              {/* Time label */}
              <div className="w-20 flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-800 border-r border-secondary-light dark:border-gray-700 sticky left-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {formatHour(hour)}
                </p>
              </div>

              {/* Time slot container */}
              <div
                className="flex-1 relative min-h-[80px] p-3 cursor-pointer"
                onClick={() => onAddTask(hour, currentDate)}
              >
                {tasksInHour.map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={e => {
                      e.stopPropagation();
                      onSelectTask(task);
                    }}
                    className="absolute left-4 right-4 p-3 rounded-lg text-white text-sm font-medium cursor-pointer hover:shadow-lg transition-all transform hover:scale-102 group"
                    style={{
                      backgroundColor: task.color,
                      top: `${idx * 85 + 12}px`,
                      width: `calc(100% - 32px)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold truncate">{task.title}</p>
                        <p className="text-xs opacity-90">
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
                        {task.category && (
                          <p className="text-xs opacity-75 capitalize">
                            {task.category}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 hover:bg-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {task.priority === 'high' && (
                      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-red-300" />
                    )}
                  </div>
                ))}

                {tasksInHour.length === 0 && (
                  <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-xs text-gray-400">Click to add task</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-secondary-light dark:border-gray-700">
        <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>
            Total tasks: <strong className="text-primary-dark dark:text-white">{dayTasks.length}</strong>
          </span>
          <span>
            Hours scheduled: <strong className="text-primary-dark dark:text-white">
              {dayTasks.reduce((sum, task) => {
                const start = new Date(task.startTime);
                const end = new Date(task.endTime);
                return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              }, 0).toFixed(1)}h
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DayView;

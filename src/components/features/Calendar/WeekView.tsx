import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ScheduledTask } from '../../../types/calendar';

interface WeekViewProps {
  currentDate: Date;
  tasks: ScheduledTask[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddTask: (hour: number, date: Date) => void;
  onSelectTask: (task: ScheduledTask) => void;
}

/**
 * Week view for calendar displaying 7-day grid with hourly blocks
 */
export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  tasks,
  onPreviousWeek,
  onNextWeek,
  onAddTask,
  onSelectTask,
}) => {
  // Get start of week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

  const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8 AM to 11 PM

  // Get tasks for specific day and hour
  const getTasksForDayHour = (day: Date, hour: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime);
      const taskHour = taskDate.getHours();
      const dayMatch =
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear();
      return dayMatch && taskHour === hour;
    });
  };

  const formatDay = (date: Date) => {
    const dayName = date.toLocaleDateString('default', { weekday: 'short' });
    const dayNum = date.getDate();
    const isToday =
      new Date().toDateString() === date.toDateString();
    return { dayName, dayNum, isToday };
  };

  return (
    <div className="bg-white dark:bg-background-darkSecondary rounded-lg shadow-sm border border-secondary-light dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-secondary-light dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={onPreviousWeek}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {weekStart.toLocaleDateString('default', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(
            'default',
            { month: 'short', day: 'numeric', year: 'numeric' }
          )}
        </h2>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          {/* Day headers */}
          <thead>
            <tr>
              <th className="w-16 p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-r border-secondary-light dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                Time
              </th>
              {weekDays.map(day => {
                const { dayName, dayNum, isToday } = formatDay(day);
                return (
                  <th
                    key={day.toISOString()}
                    className={`p-3 text-xs font-semibold border-r border-secondary-light dark:border-gray-700 ${
                      isToday
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-accent-blue'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div>{dayName}</div>
                    <div className={isToday ? 'text-lg font-bold' : ''}>
                      {dayNum}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Time slots */}
          <tbody>
            {hours.map(hour => (
              <tr key={hour} className="h-20 border-b border-secondary-light dark:border-gray-700">
                {/* Time label */}
                <td className="w-16 p-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-secondary-light dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  {String(hour).padStart(2, '0')}:00
                </td>

                {/* Day cells */}
                {weekDays.map(day => (
                  <td
                    key={`${day.toISOString()}-${hour}`}
                    className="p-1 border-r border-secondary-light dark:border-gray-700 relative hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                    onClick={() => onAddTask(hour, day)}
                  >
                    <div className="relative h-full space-y-0.5">
                      {getTasksForDayHour(day, hour).map(task => (
                        <div
                          key={task.id}
                          onClick={e => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="p-1 rounded text-white text-xs truncate font-medium cursor-pointer hover:shadow-md transition-all"
                          style={{ backgroundColor: task.color }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {getTasksForDayHour(day, hour).length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeekView;

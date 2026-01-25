import React, { useState, useMemo } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { ScheduledTask } from '../../../types/calendar';

interface TimetableViewProps {
  currentDate: Date;
  tasks: ScheduledTask[];
  onAddTask: (hour: number, date: Date) => void;
  onUpdateTask: (task: ScheduledTask) => void;
  onDeleteTask: (taskId: string) => void;
  workingHoursStart?: number;
  workingHoursEnd?: number;
}

/**
 * Hourly Timetable/Scheduler Component
 * Allows drag-drop task scheduling into hourly slots
 */
export const TimetableView: React.FC<TimetableViewProps> = ({
  currentDate,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  workingHoursStart = 8,
  workingHoursEnd = 22,
}) => {
  const [draggedTask, setDraggedTask] = useState<ScheduledTask | null>(null);

  // Generate hourly slots
  const hourSlots = useMemo(() => {
    const slots = [];
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      slots.push(hour);
    }
    return slots;
  }, [workingHoursStart, workingHoursEnd]);

  // Get tasks for specific hour
  const getTasksForHour = (hour: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime);
      const taskHour = taskDate.getHours();
      const dayMatch =
        taskDate.getDate() === currentDate.getDate() &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear();
      return dayMatch && taskHour === hour;
    });
  };

  // Format hour display
  const formatHour = (hour: number) => {
    const time = new Date();
    time.setHours(hour, 0);
    return time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calculate task position and height
  const getTaskStyle = (task: ScheduledTask) => {
    const startHour = new Date(task.startTime).getHours();
    const endHour = new Date(task.endTime).getHours();
    const startMinute = new Date(task.startTime).getMinutes();

    const topPercent = (startMinute / 60) * 100;
    const heightPercent = ((endHour - startHour) * 60 + (new Date(task.endTime).getMinutes() - startMinute)) / 60 * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 20)}%`,
    };
  };

  // Handle drag
  const handleDragStart = (e: React.DragEvent, task: ScheduledTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (draggedTask) {
      // Create new Date objects to avoid mutating the original task dates
      const newStartTime = new Date(draggedTask.startTime);
      const newEndTime = new Date(draggedTask.endTime);
      const duration = newEndTime.getTime() - newStartTime.getTime();
      
      newStartTime.setHours(hour, 0, 0, 0);
      newEndTime.setTime(newStartTime.getTime() + duration);
      
      const newTask: ScheduledTask = {
        ...draggedTask,
        startTime: newStartTime,
        endTime: newEndTime,
      };
      onUpdateTask(newTask);
      setDraggedTask(null);
    }
  };

  return (
    <div className="bg-white dark:bg-background-darkSecondary rounded-lg shadow-sm border border-secondary-light dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-secondary-light dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-accent-blue" />
            <div>
              <h2 className="text-2xl font-bold text-primary-dark dark:text-white">
                Schedule
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentDate.toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="text-xs bg-blue-100 dark:bg-blue-900 text-accent-blue px-3 py-1 rounded-full">
            {tasks.filter(
              t =>
                new Date(t.startTime).getDate() === currentDate.getDate() &&
                new Date(t.startTime).getMonth() === currentDate.getMonth()
            ).length}{' '}
            tasks
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Hour slots */}
          {hourSlots.map(hour => (
            <div key={hour} className="flex border-b border-secondary-light dark:border-gray-700 min-h-[120px]">
              {/* Hour label */}
              <div className="w-20 flex-shrink-0 bg-gray-50 dark:bg-gray-800 p-3 border-r border-secondary-light dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {formatHour(hour)}
                </p>
              </div>

              {/* Time slot container */}
              <div
                className="flex-1 relative p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, hour)}
              >
                {/* Add task button */}
                <button
                  onClick={() => onAddTask(hour, currentDate)}
                  className="absolute top-2 right-2 p-1 opacity-0 hover:opacity-100 bg-accent-blue text-white rounded hover:bg-blue-600 transition-all"
                  title="Add task"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Tasks in this hour */}
                <div className="relative h-full">
                  {getTasksForHour(hour).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task)}
                      className="absolute left-2 right-2 p-2 rounded text-white text-xs font-medium cursor-move hover:shadow-lg transition-all transform hover:scale-105"
                      style={{
                        backgroundColor: task.color,
                        ...getTaskStyle(task),
                      }}
                    >
                      <p className="font-semibold truncate">{task.title}</p>
                      <p className="text-xs opacity-90">
                        {new Date(task.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 opacity-0 hover:opacity-100 rounded transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-secondary-light dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          💡 Drag tasks to reschedule them
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Array.from(new Set(tasks.map(t => t.category))).map(category => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor:
                    tasks.find(t => t.category === category)?.color || '#999',
                }}
              />
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableView;

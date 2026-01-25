import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BarChart3, Calendar, Clock, Zap, Settings, Undo2, Redo2 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { MusicProvider, useMusic } from './contexts/MusicContext';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import Sidebar from './components/Dashboard/Sidebar';
import Dashboard from './components/Dashboard/index';
import { AddEventModal } from './components/features/Calendar/AddEventModal';
import { SettingsPanel } from './components/features/Settings/SettingsPanel';
import { WidgetLauncher } from './components/Dashboard/WidgetLauncher';
import { SkeletonWidget } from './components/ui/Skeleton';
import { useGoalManagement } from './hooks/useGoalManagement';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts';
import { storage } from './utils/storage';
import type { ScheduledTask } from './types/calendar';

// Code splitting - lazy load heavy components
const CalendarView = lazy(() => 
  import('./components/features/Calendar/CalendarView').then(m => ({ default: m.CalendarView }))
);
const WeekView = lazy(() => 
  import('./components/features/Calendar/WeekView').then(m => ({ default: m.WeekView }))
);
const DayView = lazy(() => 
  import('./components/features/Calendar/DayView').then(m => ({ default: m.DayView }))
);
const TimetableView = lazy(() => 
  import('./components/features/Timetable/TimetableView').then(m => ({ default: m.TimetableView }))
);

type ViewType = 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'settings';
type CalendarViewType = 'month' | 'week' | 'day' | 'timetable';

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <SkeletonWidget />
    <SkeletonWidget />
  </div>
);

/**
 * Main App Component - FAANG-level productivity dashboard
 * Features: Goals, Timers, Calendar, Timetable, Analytics, Customization
 */
function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedHourForEvent, setSelectedHourForEvent] = useState<number | undefined>();
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | undefined>();
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);

  // Custom hooks
  const { goals, undo, redo, canUndo, canRedo } = useGoalManagement();
  const { settings: settingsConfig, updateSettings, isLoaded } = useSettings();
  const { isVideoBackground } = useMusic();

  // Scheduled tasks (from localStorage with validation)
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);

  // Load tasks on mount using validated storage
  useEffect(() => {
    setTasks(storage.getTasks());
  }, []);

  // Export data handler
  const handleExportData = useCallback(() => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Keyboard shortcuts configuration
  const shortcuts = [
    {
      key: 'd',
      ctrl: true,
      description: 'Navigation: Go to Dashboard',
      action: () => setCurrentView('dashboard'),
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      description: 'Navigation: Go to Calendar',
      action: () => setCurrentView('calendar'),
    },
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: 'Navigation: Go to Timetable',
      action: () => setCurrentView('timetable'),
    },
    {
      key: ',',
      ctrl: true,
      description: 'Navigation: Open Settings',
      action: () => setIsSettingsOpen(true),
    },
    {
      key: 'z',
      ctrl: true,
      description: 'Edit: Undo last action',
      action: () => undo(),
      enabled: canUndo,
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Edit: Redo last action',
      action: () => redo(),
      enabled: canRedo,
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Edit: Redo last action',
      action: () => redo(),
      enabled: canRedo,
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Data: Export data backup',
      action: handleExportData,
    },
    {
      key: 'Escape',
      description: 'General: Close modals',
      action: () => {
        setIsSettingsOpen(false);
        setShowEventModal(false);
      },
    },
  ];

  const { isHelpOpen, closeHelp } = useKeyboardShortcuts(shortcuts);

  // Save tasks to localStorage with validation
  const saveTasks = (newTasks: ScheduledTask[]) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  // Handle add task
  const handleAddTask = (hour: number, date: Date) => {
    setSelectedDateForEvent(date);
    setSelectedHourForEvent(hour);
    setEditingTask(null);
    setShowEventModal(true);
  };

  // Handle save task
  const handleSaveTask = (taskData: Omit<ScheduledTask, 'id'>) => {
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(t =>
        t.id === editingTask.id ? { ...taskData, id: t.id } : t
      );
      saveTasks(updatedTasks);
    } else {
      // Add new task
      const newTask: ScheduledTask = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      };
      saveTasks([...tasks, newTask]);
    }
    setEditingTask(null);
  };

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId));
  };

  // Handle update task
  const handleUpdateTask = (task: ScheduledTask) => {
    const updatedTasks = tasks.map(t =>
      t.id === task.id ? task : t
    );
    saveTasks(updatedTasks);
  };

  // Handle select task for editing
  const handleSelectTask = (task: ScheduledTask) => {
    setEditingTask(task);
    setShowEventModal(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-secondary-light dark:border-gray-700 border-t-accent-blue animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isVideoBackground ? 'bg-transparent' : 'bg-white dark:bg-background-dark'}`}>
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} isVideoBackground={isVideoBackground} />

      {/* Main Content - Responsive margin: no margin on mobile (sidebar is drawer), ml-64 on desktop */}
      <main className={`flex-1 overflow-auto ml-0 lg:ml-64 ${isVideoBackground ? 'bg-transparent' : ''}`}>
        <div className={`max-w-7xl mx-auto p-4 sm:p-6 pt-16 lg:pt-6 ${isVideoBackground ? 'bg-black/30 backdrop-blur-sm min-h-full' : ''}`}>
          {/* Header with Settings */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark dark:text-white">
                {currentView === 'dashboard'
                  ? 'Dashboard'
                  : currentView === 'calendar'
                  ? 'Calendar'
                  : currentView === 'timetable'
                  ? 'Timetable'
                  : currentView === 'analytics'
                  ? 'Analytics'
                  : 'Settings'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {currentView === 'dashboard'
                  ? 'Manage your goals, timers, and productivity'
                  : currentView === 'calendar'
                  ? 'Plan and schedule your tasks'
                  : 'Optimize your schedule'}
              </p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Dashboard View */}
          {currentView === 'dashboard' && <Dashboard goals={goals} />}

          {/* Calendar Views */}
          {currentView === 'calendar' && (
            <div className="space-y-6">
              {/* View Switcher */}
              <div className="flex gap-2">
                {(
                  [
                    { value: 'month', label: 'Month', icon: Calendar },
                    { value: 'week', label: 'Week', icon: BarChart3 },
                    { value: 'day', label: 'Day', icon: Clock },
                    { value: 'timetable', label: 'Timetable', icon: Zap },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setCalendarView(value as CalendarViewType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      calendarView === value
                        ? 'bg-accent-blue text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Month View */}
              {calendarView === 'month' && (
                <Suspense fallback={<LoadingFallback />}>
                  <CalendarView
                    viewType="month"
                    onViewChange={setCalendarView}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onSelectTask={handleSelectTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </Suspense>
              )}

              {/* Week View */}
              {calendarView === 'week' && (
                <Suspense fallback={<LoadingFallback />}>
                  <WeekView
                    currentDate={currentDate}
                    tasks={tasks}
                    onPreviousWeek={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(newDate.getDate() - 7);
                      setCurrentDate(newDate);
                    }}
                    onNextWeek={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(newDate.getDate() + 7);
                      setCurrentDate(newDate);
                    }}
                    onAddTask={handleAddTask}
                    onSelectTask={handleSelectTask}
                  />
                </Suspense>
              )}

              {/* Day View */}
              {calendarView === 'day' && (
                <Suspense fallback={<LoadingFallback />}>
                  <DayView
                    currentDate={currentDate}
                    tasks={tasks}
                    onPreviousDay={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setCurrentDate(newDate);
                    }}
                    onNextDay={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setCurrentDate(newDate);
                    }}
                    onAddTask={handleAddTask}
                    onSelectTask={handleSelectTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </Suspense>
              )}

              {/* Timetable View */}
              {calendarView === 'timetable' && (
                <Suspense fallback={<LoadingFallback />}>
                  <TimetableView
                    currentDate={currentDate}
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Timetable Direct View */}
          {currentView === 'timetable' && (
            <Suspense fallback={<LoadingFallback />}>
              <TimetableView
                currentDate={currentDate}
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </Suspense>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-sm border border-secondary-light dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Active Goals</p>
                    <p className="text-3xl font-bold text-primary-dark dark:text-white mt-2">{goals.length}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-accent-blue opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-sm border border-secondary-light dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Scheduled Tasks</p>
                    <p className="text-3xl font-bold text-primary-dark dark:text-white mt-2">{tasks.length}</p>
                  </div>
                  <Clock className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-sm border border-secondary-light dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Tasks</p>
                    <p className="text-3xl font-bold text-primary-dark dark:text-white mt-2">
                      {tasks.filter(t => t.completedAt).length}
                    </p>
                  </div>
                  <Zap className="w-12 h-12 text-orange-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-sm border border-secondary-light dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold text-primary-dark dark:text-white mt-2">
                      {tasks.length > 0
                        ? ((tasks.filter(t => t.completedAt).length / tasks.length) * 100).toFixed(0)
                        : '0'}
                      %
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="bg-white dark:bg-background-darkSecondary rounded-lg p-6 shadow-sm border border-secondary-light dark:border-gray-700">
              <h2 className="text-xl font-bold text-primary-dark dark:text-white mb-6">Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Open Settings
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <OnboardingModal />
      <AddEventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask || undefined}
        selectedDate={selectedDateForEvent}
        selectedHour={selectedHourForEvent}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settingsConfig}
        onSettingsChange={updateSettings}
        isDarkMode={
          typeof window !== 'undefined'
            ? document.documentElement.getAttribute('data-theme') === 'dark'
            : false
        }
        onThemeToggle={() => {
          const current = document.documentElement.getAttribute('data-theme');
          document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
          localStorage.setItem('theme', current === 'dark' ? 'light' : 'dark');
        }}
      />

      {/* Unified Widget Launcher - Weather & Music */}
      <WidgetLauncher />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={isHelpOpen}
        onClose={closeHelp}
      />

      {/* Undo/Redo Floating Button (for touch devices) */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-30 lg:hidden">
        {canUndo && (
          <button
            onClick={() => undo()}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Undo"
          >
            <Undo2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}
        {canRedo && (
          <button
            onClick={() => redo()}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Redo"
          >
            <Redo2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * App wrapper with error boundary and theme provider
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

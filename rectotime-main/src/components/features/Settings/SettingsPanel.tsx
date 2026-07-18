import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Download,
  Plus,
  Trash2,
  X,
  RotateCcw,
} from 'lucide-react';

interface SettingsConfig {
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  accentColor: string;
  categories: Array<{ id: string; name: string; color: string }>;
  notifications: boolean;
  soundEnabled: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsConfig;
  onSettingsChange: (settings: SettingsConfig) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const ACCENT_COLORS = [
  { name: 'Blue', value: '#007AFF' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Cyan', value: '#06B6D4' },
];


/**
 * Settings panel for user customization
 * Allows changing timers, categories, themes, and exporting data
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  isDarkMode,
  onThemeToggle,
}) => {
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'productivity' | 'categories' | 'data'
  >('appearance');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#A0AEC0');

  // Add category
  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: newCategoryColor,
    };

    onSettingsChange({
      ...settings,
      categories: [...settings.categories, newCategory],
    });

    setNewCategoryName('');
    setNewCategoryColor('#A0AEC0');
  };

  // Delete category
  const deleteCategory = (id: string) => {
    onSettingsChange({
      ...settings,
      categories: settings.categories.filter(c => c.id !== id),
    });
  };

  // Export data as JSON
  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-background-darkSecondary rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-light dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-accent-blue" />
            <h2 className="text-xl font-bold text-primary-dark dark:text-white">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-light dark:border-gray-700">
          {(
            [
              'appearance',
              'productivity',
              'categories',
              'data',
            ] as const
          ).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 font-medium text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'text-accent-blue border-b-2 border-accent-blue'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <h3 className="font-semibold text-primary-dark dark:text-white mb-4">
                  Theme
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={onThemeToggle}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                      !isDarkMode
                        ? 'border-accent-blue bg-blue-50 dark:bg-blue-900/20'
                        : 'border-secondary-light dark:border-gray-600'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">Light</span>
                  </button>
                  <button
                    onClick={onThemeToggle}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                      isDarkMode
                        ? 'border-accent-blue bg-blue-50 dark:bg-blue-900/20'
                        : 'border-secondary-light dark:border-gray-600'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="font-medium">Dark</span>
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <h3 className="font-semibold text-primary-dark dark:text-white mb-4">
                  Accent Color
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          accentColor: color.value,
                        })
                      }
                      className={`w-12 h-12 rounded-lg transition-all ${
                        settings.accentColor === color.value
                          ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Productivity Tab */}
          {activeTab === 'productivity' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-primary-dark dark:text-white mb-4">
                Timer Presets (minutes)
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pomodoro Duration
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.pomodoroLength}
                  onChange={e =>
                    onSettingsChange({
                      ...settings,
                      pomodoroLength: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Default work session duration
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Break Duration
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakLength}
                  onChange={e =>
                    onSettingsChange({
                      ...settings,
                      shortBreakLength: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long Break Duration
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.longBreakLength}
                  onChange={e =>
                    onSettingsChange({
                      ...settings,
                      longBreakLength: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              {/* Notifications */}
              <div className="pt-4 border-t border-secondary-light dark:border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={e =>
                      onSettingsChange({
                        ...settings,
                        notifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-blue"
                  />
                  <span className="font-medium text-primary-dark dark:text-white">
                    Enable Notifications
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={e =>
                      onSettingsChange({
                        ...settings,
                        soundEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-blue"
                  />
                  <span className="font-medium text-primary-dark dark:text-white">
                    Enable Sound
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-primary-dark dark:text-white mb-4">
                  Task Categories
                </h3>

                {/* Existing categories */}
                <div className="space-y-2 mb-6">
                  {settings.categories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-secondary-light dark:border-gray-600"
                    >
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="flex-1 font-medium text-primary-dark dark:text-white">
                        {cat.name}
                      </span>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new category */}
                <div className="border-t border-secondary-light dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-primary-dark dark:text-white mb-4">
                    Add New Category
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="w-full px-4 py-2 rounded-lg border border-secondary-light dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      onKeyPress={e => {
                        if (e.key === 'Enter') addCategory();
                      }}
                    />
                    <div className="flex gap-2">
                      <div className="flex gap-2 flex-1">
                        {ACCENT_COLORS.map(color => (
                          <button
                            key={color.value}
                            onClick={() =>
                              setNewCategoryColor(color.value)
                            }
                            className={`w-8 h-8 rounded transition-all ${
                              newCategoryColor === color.value
                                ? 'ring-2 ring-offset-2 scale-110'
                                : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={addCategory}
                        className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-primary-dark dark:text-white mb-4">
                  Data Management
                </h3>

                <button
                  onClick={exportData}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-secondary-light dark:border-gray-600 hover:border-accent-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Download className="w-5 h-5 text-accent-blue" />
                  <div className="text-left">
                    <p className="font-medium text-primary-dark dark:text-white">
                      Export Settings
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Download your settings as JSON
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem('onboarding_completed');
                    localStorage.removeItem('onboarding_never_show');
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-secondary-light dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                >
                  <RotateCcw className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium text-primary-dark dark:text-white">
                      Reset Onboarding
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Show the tour again on next page load
                    </p>
                  </div>
                </button>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                    📊 Data Info
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>
                      • Settings are saved to your browser's local storage
                    </li>
                    <li>
                      • Data persists across browser sessions
                    </li>
                    <li>
                      • Clearing browser data will remove your settings
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-secondary-light dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-accent-blue text-white hover:bg-blue-600 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

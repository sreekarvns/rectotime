import { useState, useCallback, useEffect } from 'react';

interface SettingsConfig {
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  accentColor: string;
  categories: Array<{ id: string; name: string; color: string }>;
  notifications: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: SettingsConfig = {
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  accentColor: '#007AFF',
  categories: [
    { id: '1', name: 'LeetCode', color: '#FF6B6B' },
    { id: '2', name: 'Applications', color: '#4ECDC4' },
    { id: '3', name: 'Learning', color: '#45B7D1' },
    { id: '4', name: 'Meeting', color: '#FFA07A' },
    { id: '5', name: 'Break', color: '#95E1D3' },
  ],
  notifications: true,
  soundEnabled: true,
};

const STORAGE_KEY = 'productivity_settings';

/**
 * Custom hook for managing productivity settings with localStorage persistence
 * Handles user preferences for timers, appearance, categories, and notifications
 */
export const useSettings = () => {
  const [settings, setSettingsState] = useState<SettingsConfig>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse settings:', error);
        setSettingsState(DEFAULT_SETTINGS);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: SettingsConfig) => {
    setSettingsState(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }, []);

  // Update specific setting
  const updateSetting = useCallback(
    <K extends keyof SettingsConfig>(
      key: K,
      value: SettingsConfig[K]
    ) => {
      const newSettings = {
        ...settings,
        [key]: value,
      };
      updateSettings(newSettings);
    },
    [settings, updateSettings]
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  // Add category
  const addCategory = useCallback(
    (name: string, color: string) => {
      const newCategory = {
        id: Date.now().toString(),
        name,
        color,
      };
      updateSettings({
        ...settings,
        categories: [...settings.categories, newCategory],
      });
      return newCategory;
    },
    [settings, updateSettings]
  );

  // Remove category
  const removeCategory = useCallback(
    (id: string) => {
      updateSettings({
        ...settings,
        categories: settings.categories.filter(c => c.id !== id),
      });
    },
    [settings, updateSettings]
  );

  // Get category by id
  const getCategory = useCallback(
    (id: string) => {
      return settings.categories.find(c => c.id === id);
    },
    [settings.categories]
  );

  return {
    settings,
    isLoaded,
    updateSettings,
    updateSetting,
    resetSettings,
    addCategory,
    removeCategory,
    getCategory,
  };
};

export default useSettings;

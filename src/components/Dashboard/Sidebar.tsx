import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';

type ViewType = 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

/**
 * Main navigation sidebar for the productivity dashboard
 */
const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: Array<{
    id: ViewType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview & quick actions',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Schedule & events',
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: <Clock className="w-5 h-5" />,
      description: 'Hourly schedule',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Productivity insights',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Preferences',
    },
  ];

  if (isCollapsed) {
    return (
      <motion.aside
        className="fixed left-0 top-0 h-full w-16 bg-white/95 dark:bg-background-darkSecondary/95 backdrop-blur border-r border-secondary-light dark:border-gray-700 z-40 flex flex-col items-center py-4"
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="mb-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 space-y-2 flex flex-col items-center">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`p-3 rounded-lg transition-all ${
                currentView === item.id
                  ? 'bg-accent-blue text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>

        <ThemeToggle />
      </motion.aside>
    );
  }

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-background-darkSecondary/95 backdrop-blur border-r border-secondary-light dark:border-gray-700 z-40 flex flex-col"
      initial={{ width: 0 }}
      animate={{ width: 256 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-secondary-light dark:border-gray-700 flex items-center justify-between">
        <Logo />
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Collapse sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <motion.button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              currentView === item.id
                ? 'bg-accent-blue text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <div>
                <p className="font-medium">{item.label}</p>
                <p
                  className={`text-xs ${
                    currentView === item.id
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-light dark:border-gray-700 space-y-4">
        <ThemeToggle />
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Productivity Dashboard</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

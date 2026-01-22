import React, { useState } from 'react';
import { LayoutDashboard, Target, Activity, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  if (isCollapsed) {
    return (
      <motion.div
        className="fixed left-0 top-0 h-full w-16 bg-white/90 dark:bg-background-darkSecondary/90 backdrop-blur-lg border-r border-secondary-light dark:border-gray-700 z-40 flex flex-col items-center py-6"
        initial={{ width: 0 }}
        animate={{ width: 64 }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="mb-6 p-2 hover:bg-secondary-light dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-primary-dark dark:text-white" />
        </button>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-12 h-12 rounded-lg mb-2 flex items-center justify-center transition-colors ${
                activeView === item.id
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-secondary-light dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="fixed left-0 top-0 h-full w-64 bg-white/90 dark:bg-background-darkSecondary/90 backdrop-blur-lg border-r border-secondary-light dark:border-gray-700 z-40"
      initial={{ width: 0 }}
      animate={{ width: 256 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-dark dark:text-white">Productivity OS</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Dashboard</p>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-secondary-light dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme</span>
          <ThemeToggle />
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${activeView === item.id
                    ? 'bg-accent-blue text-white shadow-soft'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-secondary-light dark:hover:bg-gray-700'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
};

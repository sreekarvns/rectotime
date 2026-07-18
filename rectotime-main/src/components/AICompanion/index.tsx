import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { CurrentStatus, Goal } from '../../types';
import { CurrentStatusDisplay } from './CurrentStatus';
import { Avatar } from '../ui/Avatar';
import { LiveGuidance } from './LiveGuidance';
import { QuickActions } from './QuickActions';
import { ChatInterface } from './ChatInterface';
import { generateGuidance } from '../../utils/aiGuidance';
import { motion } from 'framer-motion';

interface AICompanionProps {
  currentStatus: CurrentStatus;
  goals: Goal[];
  onToggle?: () => void;
  isCollapsed?: boolean;
}

export const AICompanion: React.FC<AICompanionProps> = ({
  currentStatus,
  goals,
  onToggle,
  isCollapsed = false,
}) => {
  const guidance = generateGuidance(currentStatus, goals);
  const [activeTab, setActiveTab] = useState<'status' | 'guidance' | 'actions' | 'chat'>('status');
  
  if (isCollapsed) {
    return (
      <motion.div
        className="fixed right-0 top-0 h-full w-12 bg-white/80 dark:bg-background-darkSecondary/80 backdrop-blur-lg border-l border-secondary-light dark:border-gray-700 flex items-center justify-center cursor-pointer z-50"
        onClick={onToggle}
        whileHover={{ width: 60 }}
      >
        <ChevronRight className="w-6 h-6 text-primary-dark dark:text-white" />
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      className="fixed right-0 top-0 h-full w-[30%] min-w-[350px] bg-white/90 dark:bg-background-darkSecondary/90 backdrop-blur-lg border-l border-secondary-light dark:border-gray-700 z-50 overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar status={guidance.length > 0 ? 'thinking' : 'active'} size="md" />
            <div>
              <h2 className="text-xl font-bold text-primary-dark">AI Companion</h2>
              <p className="text-xs text-gray-500">Your productivity coach</p>
            </div>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-secondary-light dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close AI Companion"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-secondary-light dark:border-gray-700">
          {(['status', 'guidance', 'actions', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors
                ${activeTab === tab
                  ? 'text-accent-blue border-b-2 border-accent-blue'
                  : 'text-gray-500 dark:text-gray-400 hover:text-primary-dark dark:hover:text-white'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'status' && <CurrentStatusDisplay status={currentStatus} />}
          {activeTab === 'guidance' && <LiveGuidance guidance={guidance} />}
          {activeTab === 'actions' && <QuickActions />}
          {activeTab === 'chat' && <ChatInterface currentStatus={currentStatus} goals={goals} />}
        </div>
      </div>
    </motion.div>
  );
};

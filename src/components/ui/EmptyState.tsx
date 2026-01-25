import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  Clock, 
  BarChart3, 
  MessageSquare,
  FileText,
  Search,
  Inbox
} from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Empty State Component
 * Displays when there's no data to show
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-16',
  };

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <div className={`${iconSizes[size]} text-gray-400 dark:text-gray-500 mb-4`}>
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// PRE-BUILT EMPTY STATES
// ============================================

export const EmptyGoals: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon={<Target className="w-full h-full" />}
    title="No goals yet"
    description="Set your first productivity goal to start tracking your progress"
    action={onAdd ? { label: 'Add Goal', onClick: onAdd } : undefined}
  />
);

export const EmptyTasks: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon={<Calendar className="w-full h-full" />}
    title="No tasks scheduled"
    description="Your calendar is empty. Add a task to start planning your day"
    action={onAdd ? { label: 'Add Task', onClick: onAdd } : undefined}
  />
);

export const EmptyActivities: React.FC = () => (
  <EmptyState
    icon={<Clock className="w-full h-full" />}
    title="No activity recorded"
    description="Start tracking your time to see productivity insights"
  />
);

export const EmptyAnalytics: React.FC = () => (
  <EmptyState
    icon={<BarChart3 className="w-full h-full" />}
    title="No data to analyze"
    description="Complete some tasks and goals to see your analytics"
  />
);

export const EmptyChat: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    icon={<MessageSquare className="w-full h-full" />}
    title="Start a conversation"
    description="Ask your AI companion for productivity tips and guidance"
    action={onStart ? { label: 'Say Hello', onClick: onStart } : undefined}
    size="sm"
  />
);

export const EmptySearch: React.FC<{ query?: string }> = ({ query }) => (
  <EmptyState
    icon={<Search className="w-full h-full" />}
    title="No results found"
    description={query ? `No matches for "${query}". Try a different search term.` : 'Try searching for something'}
  />
);

export const EmptyInbox: React.FC = () => (
  <EmptyState
    icon={<Inbox className="w-full h-full" />}
    title="All caught up!"
    description="You have no pending notifications or reminders"
  />
);

export const EmptyNotes: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon={<FileText className="w-full h-full" />}
    title="No notes yet"
    description="Capture your thoughts and ideas"
    action={onAdd ? { label: 'Add Note', onClick: onAdd } : undefined}
  />
);

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data',
  onRetry,
}) => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    }
    title={title}
    description={message}
    action={onRetry ? { label: 'Try Again', onClick: onRetry, variant: 'secondary' } : undefined}
  />
);

export default EmptyState;

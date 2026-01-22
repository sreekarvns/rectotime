import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  showLabel?: boolean;
  gradient?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  showLabel = true,
  gradient = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-primary-dark dark:text-white">Progress</span>
          <span className="text-sm font-semibold text-accent-blue">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-secondary-light dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${gradient ? 'gradient-primary' : 'bg-accent-blue'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

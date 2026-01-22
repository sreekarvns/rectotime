import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`
        ${sizes[size]} rounded-xl gradient-primary
        flex items-center justify-center
        shadow-soft
      `}>
        <Clock className="w-5 h-5 text-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold text-primary-dark dark:text-white`}>
            RectoTime
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Productivity OS
          </span>
        </div>
      )}
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = true }) => {
  return (
    <motion.div
      className={`
        bg-white dark:bg-background-darkSecondary rounded-card shadow-soft
        ${hover ? 'hover-lift cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

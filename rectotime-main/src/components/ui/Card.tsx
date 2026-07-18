import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  variant?: 'default' | 'clock' | 'glass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hover = true,
  variant = 'default' 
}) => {
  const variants = {
    default: 'bg-[var(--bg-secondary)] border border-[color:var(--border-color)]',
    clock: 'bg-[var(--bg-secondary)] border border-[color:var(--border-color)] card-clock',
    glass: 'glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50',
  };

  return (
    <motion.div
      className={`
        ${variants[variant]} rounded-card shadow-soft
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

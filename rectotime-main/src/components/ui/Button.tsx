import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'time' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'circular';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const HOVER_SHADOWS: Record<string, string> = {
  primary:   '0 8px 25px rgba(0, 102, 204, 0.40)',
  accent:    '0 8px 25px rgba(94, 92, 230, 0.40)',
  time:      '0 8px 25px rgba(255, 107, 53, 0.35)',
  danger:    '0 8px 20px rgba(239, 68, 68, 0.35)',
  secondary: '0 4px 12px rgba(0, 0, 0, 0.12)',
  ghost:     '0 2px 8px rgba(0, 0, 0, 0.08)',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  shape = 'default',
  className = '',
  disabled = false,
  icon,
}) => {
  const baseStyles = 'font-medium press-effect flex items-center justify-center gap-2 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue';

  const variants = {
    primary:   'bg-primary text-white',
    secondary: 'border border-[color:var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
    ghost:     'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
    accent:    'gradient-accent text-white',
    time:      'gradient-time text-white shadow-clock-glow',
    danger:    'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const circularSizes = {
    sm: 'w-10 h-10 p-2',
    md: 'w-12 h-12 p-3',
    lg: 'w-16 h-16 p-4',
  };

  const shapeStyles =
    shape === 'circular'
      ? `rounded-full ${circularSizes[size]}`
      : `rounded-button ${sizes[size]}`;

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${shapeStyles} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? {
              scale: 1.03,
              boxShadow: HOVER_SHADOWS[variant] ?? HOVER_SHADOWS.secondary,
              transition: { type: 'spring', stiffness: 500, damping: 30 },
            }
          : {}
      }
      whileTap={
        !disabled
          ? {
              scale: 0.96,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: { type: 'spring', stiffness: 600, damping: 35 },
            }
          : {}
      }
    >
      {icon && <span>{icon}</span>}
      {shape !== 'circular' && children}
    </motion.button>
  );
};


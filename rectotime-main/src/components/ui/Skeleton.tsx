import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Loading Component
 * Displays placeholder content while data is loading
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
};

/**
 * Skeleton Text - Multiple lines
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height="0.875rem"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

/**
 * Skeleton Card - Full card placeholder
 */
export const SkeletonCard: React.FC<{
  className?: string;
  hasImage?: boolean;
}> = ({ className = '', hasImage = false }) => (
  <motion.div
    className={`p-4 bg-white dark:bg-background-darkSecondary rounded-lg border border-secondary-light dark:border-gray-700 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {hasImage && (
      <Skeleton variant="rounded" height={120} className="mb-4" />
    )}
    <Skeleton variant="text" width="70%" height="1.25rem" className="mb-2" />
    <SkeletonText lines={2} />
    <div className="flex gap-2 mt-4">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </motion.div>
);

/**
 * Skeleton Goal Item
 */
export const SkeletonGoalItem: React.FC = () => (
  <div className="p-3 bg-secondary-light dark:bg-gray-800 rounded-lg space-y-2">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="50%" height="1rem" />
      <Skeleton variant="text" width="20%" height="0.75rem" />
    </div>
    <Skeleton variant="rounded" height={8} />
    <div className="flex gap-2">
      <Skeleton variant="rounded" width={60} height={24} />
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
  </div>
);

/**
 * Skeleton List
 */
export const SkeletonList: React.FC<{
  count?: number;
  ItemComponent?: React.FC;
}> = ({ count = 3, ItemComponent = SkeletonGoalItem }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <ItemComponent key={i} />
    ))}
  </div>
);

/**
 * Skeleton Widget - For dashboard widgets
 */
export const SkeletonWidget: React.FC<{
  className?: string;
  title?: boolean;
}> = ({ className = '', title = true }) => (
  <div className={`p-6 bg-white dark:bg-background-darkSecondary rounded-card border border-secondary-light dark:border-gray-700 ${className}`}>
    {title && (
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="rounded" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" height="1.125rem" className="mb-1" />
          <Skeleton variant="text" width="25%" height="0.75rem" />
        </div>
      </div>
    )}
    <SkeletonList count={3} />
  </div>
);

/**
 * Skeleton Timer - For time tracking widget
 */
export const SkeletonTimer: React.FC = () => (
  <div className="p-6 bg-white dark:bg-background-darkSecondary rounded-card border border-secondary-light dark:border-gray-700">
    <Skeleton variant="text" width="40%" height="1.125rem" className="mb-4" />
    <div className="text-center mb-6">
      <Skeleton variant="text" width="60%" height="3rem" className="mx-auto mb-2" />
      <Skeleton variant="text" width="30%" height="0.875rem" className="mx-auto" />
    </div>
    <div className="flex gap-2 justify-center mb-6">
      <Skeleton variant="rounded" width={80} height={36} />
      <Skeleton variant="rounded" width={80} height={36} />
      <Skeleton variant="rounded" width={80} height={36} />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Skeleton variant="rounded" height={60} />
      <Skeleton variant="rounded" height={60} />
      <Skeleton variant="rounded" height={60} />
    </div>
  </div>
);

export default Skeleton;

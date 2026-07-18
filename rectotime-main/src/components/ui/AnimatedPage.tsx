import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

// Shared spring config used across the design system
const PAGE_SPRING = { type: 'spring', stiffness: 280, damping: 26 };
const CARD_SPRING = { type: 'spring', stiffness: 300, damping: 24 };

/**
 * Animated page wrapper with spring enter / fade exit
 */
export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={PAGE_SPRING}
    >
      {children}
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Spring stagger cascade  — replaces the old StaggeredContainer / StaggeredItem
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: CARD_SPRING,
  },
};

export const StaggeredContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    className={className}
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {children}
  </motion.div>
);

export const StaggeredItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div className={className} variants={cardVariants}>
    {children}
  </motion.div>
);

/**
 * Animated modal backdrop and content
 */
export const ModalBackdrop: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({
  children,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Slide in from side animation (for sidebars)
 */
export const SlideIn: React.FC<{
  children: React.ReactNode;
  direction?: 'left' | 'right';
  className?: string;
}> = ({ children, direction = 'left', className = '' }) => {
  const variants = {
    hidden: { x: direction === 'left' ? -300 : 300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: direction === 'left' ? -300 : 300, opacity: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scale and fade animation for buttons
 */
export const AnimatedButton = motion.button;

/**
 * Typing indicator animation
 */
export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary-main rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Progress bar with smooth animation
 */
export const AnimatedProgress: React.FC<{ value: number; className?: string }> = ({
  value,
  className = '',
}) => {
  return (
    <div className={`h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary-main to-primary-dark"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};

/**
 * Number counter animation
 */
export const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.span>
    </motion.span>
  );
};

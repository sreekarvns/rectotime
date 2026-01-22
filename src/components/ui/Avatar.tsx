import React from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  status?: 'thinking' | 'active' | 'idle';
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ status = 'active', size = 'md' }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  
  return (
    <div className="relative">
      <motion.div
        className={`
          ${sizes[size]} rounded-full gradient-primary
          flex items-center justify-center
          text-white font-bold text-xl
          shadow-medium
        `}
        animate={status === 'thinking' ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: status === 'thinking' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        AI
      </motion.div>
      {status === 'active' && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  onClick,
  animated = true 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [animated]);

  const sizes = {
    sm: { container: 'w-8 h-8', clock: 'w-8 h-8', hour: 'h-2.5', minute: 'h-3.5' },
    md: { container: 'w-10 h-10', clock: 'w-10 h-10', hour: 'h-3', minute: 'h-4' },
    lg: { container: 'w-12 h-12', clock: 'w-12 h-12', hour: 'h-4', minute: 'h-5' },
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  // Calculate hand rotations
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const hourRotation = animated ? (hours * 30 + minutes * 0.5) : 90;
  const minuteRotation = animated ? (minutes * 6 + seconds * 0.1) : 180;

  // 12 hour markers
  const markers = Array.from({ length: 12 }, (_, i) => i);

  return (
    <motion.div
      className="flex items-center gap-3 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* Analog Clock Face */}
      <div className={`relative ${sizes[size].container}`}>
        {/* Clock face with gradient */}
        <div className={`
          ${sizes[size].clock} rounded-full
          gradient-clockface
          border-2 border-gray-200 dark:border-gray-700
          shadow-clock
          flex items-center justify-center
          relative
        `}>
          {/* Hour Markers */}
          {markers.map((i) => (
            <div
              key={i}
              className="absolute w-0.5 h-1.5 bg-gray-400 dark:bg-gray-600"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-${size === 'sm' ? '14' : size === 'md' ? '18' : '22'}px)`,
                transformOrigin: 'center',
              }}
            />
          ))}

          {/* Hour Hand */}
          <motion.div
            className={`absolute ${sizes[size].hour} w-1 bg-gradient-to-t from-primary to-accent-blue rounded-full`}
            style={{
              bottom: '50%',
              left: '50%',
              marginLeft: '-2px',
              transformOrigin: 'bottom center',
            }}
            animate={{ rotate: hourRotation }}
            transition={{ duration: animated ? 0.5 : 0, ease: 'linear' }}
          />

          {/* Minute Hand */}
          <motion.div
            className={`absolute ${sizes[size].minute} w-0.5 bg-accent-purple rounded-full`}
            style={{
              bottom: '50%',
              left: '50%',
              marginLeft: '-1px',
              transformOrigin: 'bottom center',
            }}
            animate={{ rotate: minuteRotation }}
            transition={{ duration: animated ? 0.5 : 0, ease: 'linear' }}
          />

          {/* Center Dot */}
          <div className="absolute w-2 h-2 bg-accent-blue rounded-full shadow-clock-glow" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold text-primary-dark dark:text-white`}>
            RectoTime
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Time Mastery
          </span>
        </div>
      )}
    </motion.div>
  );
};

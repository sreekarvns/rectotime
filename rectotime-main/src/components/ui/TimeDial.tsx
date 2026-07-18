import React from 'react';
import { motion } from 'framer-motion';

interface TimeDialProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  value?: string | number;
  color?: 'primary' | 'morning' | 'noon' | 'evening' | 'night';
  showMarkers?: boolean;
  children?: React.ReactNode;
}

/**
 * Clock-themed circular progress indicator
 */
export const TimeDial: React.FC<TimeDialProps> = ({
  progress,
  size = 'md',
  label,
  value,
  color = 'primary',
  showMarkers = true,
  children,
}) => {
  const sizes = {
    sm: { container: 'w-20 h-20', stroke: 4, fontSize: 'text-xs' },
    md: { container: 'w-32 h-32', stroke: 6, fontSize: 'text-sm' },
    lg: { container: 'w-48 h-48', stroke: 8, fontSize: 'text-lg' },
    xl: { container: 'w-64 h-64', stroke: 10, fontSize: 'text-2xl' },
  };

  const sizeConfig = sizes[size];
  const radius = 50 - sizeConfig.stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // 12 hour markers
  const markers = showMarkers ? Array.from({ length: 12 }, (_, i) => i) : [];
  const markerRadius = {
    sm: 8,
    md: 14,
    lg: 22,
    xl: 30,
  }[size];

  return (
    <div className={`relative ${sizeConfig.container} flex items-center justify-center`}>
      {/* SVG Circle */}
      <svg
        className="absolute inset-0 -rotate-90"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
      >
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={sizeConfig.stroke}
          className="text-gray-200 dark:text-gray-700 opacity-30"
        />

        {/* Progress Circle with gradient */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color === 'primary' ? '#007AFF' : `var(--time-${color})`} />
            <stop offset="100%" stopColor={color === 'primary' ? '#5E5CE6' : `var(--time-${color})`} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth={sizeConfig.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="drop-shadow-lg"
        />

        {/* Hour Markers */}
        {markers.map((i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 50 + (radius - markerRadius) * Math.cos(angle);
          const y = 50 + (radius - markerRadius) * Math.sin(angle);
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 1.5 : 0.8}
              fill="currentColor"
              className="text-gray-400 dark:text-gray-600"
            />
          );
        })}
      </svg>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {children || (
          <>
            {value && (
              <div className={`font-bold ${sizeConfig.fontSize} text-primary-dark dark:text-white`}>
                {value}
              </div>
            )}
            {label && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {label}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

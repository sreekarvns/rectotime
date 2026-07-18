import React, { useRef, useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme, type Theme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const THEME_OPTIONS: { value: Theme; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'light',    label: 'Light',    Icon: Sun },
  { value: 'dark',     label: 'Dark',     Icon: Moon },
  { value: 'midnight', label: 'Midnight', Icon: Sparkles },
];

interface RippleState {
  x: number;
  y: number;
  id: number;
}

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: Theme, e: React.MouseEvent) => {
    if (value === theme) return;
    // Capture ripple origin relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    }
    setTheme(value);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden"
      style={{
        backgroundColor:
          theme === 'midnight' ? 'rgba(255,255,255,0.06)' : undefined,
        border:
          theme === 'midnight' ? '1px solid rgba(255,255,255,0.08)' : undefined,
      }}
      role="radiogroup"
      aria-label="Select theme"
    >
      {/* Ripple effect */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-white/20"
            style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 160, height: 160, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={(e) => handleSelect(value, e)}
            className="relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 focus:outline-none"
            style={{
              color: isActive
                ? theme === 'midnight' ? '#F0F4FF' : '#1C1C1E'
                : theme === 'midnight' ? '#8892A4' : '#6E6E73',
            }}
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
          >
            {/* Animated background pill */}
            {isActive && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background:
                    value === 'midnight'
                      ? 'linear-gradient(135deg, #1A2235 0%, #111827 100%)'
                      : value === 'dark'
                      ? '#2C2C2E'
                      : '#FFFFFF',
                  boxShadow:
                    value === 'midnight'
                      ? '0 2px 12px rgba(79,158,248,0.25)'
                      : '0 1px 6px rgba(0,0,0,0.12)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative w-3.5 h-3.5" />
            <span className="relative hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};


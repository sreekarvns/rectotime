import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="
        relative w-14 h-7 rounded-full
        bg-secondary-light dark:bg-gray-700
        flex items-center
        transition-colors duration-300
        focus:outline-none focus:ring-2 focus:ring-accent-blue
      "
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="
          absolute w-6 h-6 rounded-full
          bg-white dark:bg-gray-800
          shadow-soft
          flex items-center justify-center
        "
        animate={{
          x: theme === 'dark' ? 28 : 2,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {theme === 'light' ? (
          <Sun className="w-4 h-4 text-yellow-500" />
        ) : (
          <Moon className="w-4 h-4 text-blue-400" />
        )}
      </motion.div>
    </motion.button>
  );
};

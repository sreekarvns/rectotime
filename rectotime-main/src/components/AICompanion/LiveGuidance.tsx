import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Lightbulb, Bell, TrendingUp } from 'lucide-react';
import { AIGuidance } from '../../types';
import { Badge } from '../ui/Badge';

interface LiveGuidanceProps {
  guidance: AIGuidance[];
}

const iconMap = {
  nudge: Lightbulb,
  warning: AlertCircle,
  celebration: CheckCircle,
  suggestion: TrendingUp,
  reminder: Bell,
};

const colorMap = {
  nudge: 'text-blue-500',
  warning: 'text-yellow-500',
  celebration: 'text-green-500',
  suggestion: 'text-purple-500',
  reminder: 'text-orange-500',
};

export const LiveGuidance: React.FC<LiveGuidanceProps> = ({ guidance }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-white">Live Guidance</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {guidance.slice(0, 5).map((item, index) => {
            const Icon = iconMap[item.type];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 bg-secondary-light dark:bg-gray-700 rounded-lg border-l-4 border-accent-blue"
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-5 h-5 mt-0.5 ${colorMap[item.type]}`} />
                  <div className="flex-1">
                    <p className="text-sm text-primary-dark dark:text-white">{item.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'info'}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {guidance.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            All good! Keep up the great work 🎉
          </p>
        )}
      </div>
    </div>
  );
};

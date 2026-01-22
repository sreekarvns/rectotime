import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CurrentStatus } from '../../types';

interface TimeTrackingWidgetProps {
  currentStatus: CurrentStatus;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
  currentStatus,
  onStart,
  onPause,
  onStop,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-primary-dark dark:text-white mb-4">Time Tracker</h3>
      
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-accent-blue mb-2">
          {formatTime(currentStatus.timeSpent)}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {currentStatus.activity ? `Tracking: ${currentStatus.activity.domain}` : 'No active tracking'}
        </p>
      </div>
      
      <div className="flex gap-2 justify-center">
        <Button
          variant="primary"
          size="sm"
          onClick={onStart}
          icon={<Play className="w-4 h-4" />}
        >
          Start
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onPause}
          icon={<Pause className="w-4 h-4" />}
        >
          Pause
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onStop}
          icon={<Square className="w-4 h-4" />}
        >
          Stop
        </Button>
      </div>
    </Card>
  );
};

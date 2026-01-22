import React, { useState } from 'react';
import { Play, Pause, Square, Coffee, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CurrentStatus } from '../../types';
import { useTimerPreset } from '../../hooks/useTimerPreset';
import { TIMER_PRESETS } from '../../constants/config';

interface TimeTrackingWidgetProps {
  currentStatus: CurrentStatus;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

interface TimerPreset {
  name: string;
  duration: number;
  icon: React.ReactNode;
  color: string;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
  currentStatus,
  onStart,
  onPause,
  onStop,
}) => {
  // Manual timer state
  const [manualTimerMode, setManualTimerMode] = useState<'manual' | 'preset'>('manual');
  
  // Custom timer state - separated into hours, minutes, seconds
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customSeconds, setCustomSeconds] = useState(0);
  
  // Preset timer hook
  const {
    timerMode,
    timeRemaining,
    isActive,
    startPresetTimer,
    startCustomTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    alarmVolume,
    setAlarmVolume,
  } = useTimerPreset();

  const timerPresets: TimerPreset[] = [
    { 
      name: 'Pomodoro', 
      duration: TIMER_PRESETS.POMODORO, 
      icon: <Zap className="w-4 h-4" />, 
      color: 'bg-red-500' 
    },
    { 
      name: 'Short Break', 
      duration: TIMER_PRESETS.SHORT_BREAK, 
      icon: <Coffee className="w-4 h-4" />, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Long Break', 
      duration: TIMER_PRESETS.LONG_BREAK, 
      icon: <Coffee className="w-4 h-4" />, 
      color: 'bg-blue-500' 
    },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartManualTimer = () => {
    setManualTimerMode('manual');
    if (onStart) onStart();
  };

  const handlePauseManual = () => {
    if (onPause) onPause();
  };

  const handleStopManual = () => {
    if (onStop) onStop();
  };

  const handleStartPreset = (preset: TimerPreset) => {
    setManualTimerMode('preset');
    startPresetTimer(
      preset.name.toLowerCase().replace(' ', '') as 'pomodoro' | 'shortbreak' | 'longbreak',
      preset.duration
    );
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-primary-dark dark:text-white mb-4">⏱️ Time Tracker</h3>
      
      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-accent-blue mb-2 font-mono">
          {manualTimerMode === 'manual' ? formatTime(currentStatus.timeSpent) : formatTime(timeRemaining)}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {manualTimerMode === 'manual' 
            ? (currentStatus.activity ? `Tracking: ${currentStatus.activity.domain}` : 'Manual Timer')
            : `${timerMode === 'pomodoro' ? 'Pomodoro' : timerMode === 'shortbreak' ? 'Short Break' : timerMode === 'longbreak' ? 'Long Break' : 'Custom'} Timer`
          }
        </p>
      </div>
      
      {/* Manual Timer Controls */}
      {manualTimerMode === 'manual' && (
        <div className="flex gap-2 justify-center mb-6">
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartManualTimer}
            icon={<Play className="w-4 h-4" />}
          >
            Start
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePauseManual}
            icon={<Pause className="w-4 h-4" />}
          >
            Pause
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopManual}
            icon={<Square className="w-4 h-4" />}
          >
            Stop
          </Button>
        </div>
      )}

      {/* Preset Timer Controls */}
      {manualTimerMode === 'preset' && (
        <div className="flex gap-2 justify-center mb-6">
          <Button
            variant={isActive ? "secondary" : "primary"}
            size="sm"
            onClick={isActive ? pauseTimer : resumeTimer}
            icon={isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isActive ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopTimer();
              setManualTimerMode('manual');
            }}
            icon={<Square className="w-4 h-4" />}
          >
            Stop
          </Button>
        </div>
      )}

      {/* Timer Presets */}
      <div className="border-t border-secondary-light dark:border-gray-700 pt-4 mb-4">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Study Timer Presets</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {timerPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleStartPreset(preset)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                manualTimerMode === 'preset' && timerMode === preset.name.toLowerCase().replace(' ', '')
                  ? `${preset.color} text-white`
                  : 'bg-secondary-light dark:bg-gray-700 text-primary-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label={`Start ${preset.name} timer (${preset.duration} minutes)`}
            >
              {preset.icon}
              <span className="text-xs">{preset.name}</span>
              <span className="text-xs opacity-75">{preset.duration}m</span>
            </button>
          ))}
        </div>

        {/* Custom Timer */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Custom Timer Duration</p>
          <div className="flex gap-1 items-center">
            {/* Hours */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-500">Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={customHours}
                onChange={(e) => setCustomHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                placeholder="HH"
                className="w-full px-2 py-1 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary text-sm text-center font-mono"
              />
            </div>
            
            <div className="text-lg font-bold text-gray-400 mt-3">:</div>
            
            {/* Minutes */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-500">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                placeholder="MM"
                className="w-full px-2 py-1 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary text-sm text-center font-mono"
              />
            </div>
            
            <div className="text-lg font-bold text-gray-400 mt-3">:</div>
            
            {/* Seconds */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-500">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                placeholder="SS"
                className="w-full px-2 py-1 border border-secondary-light dark:border-gray-700 rounded-lg bg-white dark:bg-background-darkSecondary text-sm text-center font-mono"
              />
            </div>
          </div>
          
          {/* Total Duration Display */}
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Duration</p>
            <p className="text-lg font-mono font-bold text-accent-blue">
              {String(customHours).padStart(2, '0')}:{String(customMinutes).padStart(2, '0')}:{String(customSeconds).padStart(2, '0')}
            </p>
          </div>
          
          <button
            onClick={() => {
              setManualTimerMode('preset');
              // Convert to total seconds
              const totalSeconds = customHours * 3600 + customMinutes * 60 + customSeconds;
              if (totalSeconds > 0) {
                startCustomTimer(totalSeconds); // Pass seconds directly
              }
            }}
            className="w-full px-3 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Start Custom Timer
          </button>
        </div>
      </div>

      {/* Alarm Sound Control */}
      <div className="border-t border-secondary-light dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Alarm Volume</p>
          <span className="text-xs text-gray-500 dark:text-gray-500">{alarmVolume}%</span>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={alarmVolume}
            onChange={(e) => setAlarmVolume(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => setAlarmVolume(alarmVolume === 0 ? 70 : 0)}
            className="px-2 py-1 bg-secondary-light dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs font-medium transition-colors"
            aria-label={alarmVolume === 0 ? 'Unmute' : 'Mute'}
          >
            {alarmVolume === 0 ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </Card>
  );
};

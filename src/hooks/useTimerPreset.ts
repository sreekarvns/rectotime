import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing timer presets and countdowns
 * Handles Pomodoro, breaks, and custom timers
 */
export const useTimerPreset = () => {
  const [timerMode, setTimerMode] = useState<'manual' | 'pomodoro' | 'shortbreak' | 'longbreak' | 'custom'>('manual');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [alarmVolume, setAlarmVolume] = useState(70);

  // Play alarm sound
  const playAlarmSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set volume (0-1 scale from 0-100)
      gainNode.gain.setValueAtTime(alarmVolume / 100, audioContext.currentTime);
      
      // Play a pleasant two-tone alarm: 800Hz then 1000Hz
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      
      // Fade out and stop
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio playback not supported');
    }
  }, [alarmVolume]);

  // Countdown interval effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            // Play alarm sound
            playAlarmSound();
            // Trigger completion notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Complete!', {
                body: `Your ${timerMode} timer is done!`,
                icon: '/vite.svg',
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, timerMode, playAlarmSound]);

  const startPresetTimer = useCallback((preset: 'pomodoro' | 'shortbreak' | 'longbreak', minutes: number) => {
    setTimerMode(preset);
    setTimeRemaining(minutes * 60);
    setIsActive(true);
  }, []);

  const startCustomTimer = useCallback((seconds: number) => {
    if (seconds > 0) {
      setTimerMode('custom');
      setTimeRemaining(seconds);
      setIsActive(true);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(0);
    setTimerMode('manual');
  }, []);

  return {
    timerMode,
    timeRemaining,
    isActive,
    customMinutes,
    setCustomMinutes,
    startPresetTimer,
    startCustomTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    alarmVolume,
    setAlarmVolume,
  };
};

export default useTimerPreset;

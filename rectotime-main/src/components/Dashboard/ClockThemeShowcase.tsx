import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TimeDial } from '../ui/TimeDial';
import { Play, Pause, RotateCcw, Clock, TrendingUp, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Clock-themed Dashboard Showcase
 * Demonstrates all clock theme components in action
 */
export const ClockThemeShowcase: React.FC = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const totalTime = 25 * 60; // 25 minutes in seconds

  useEffect(() => {
    if (!isTimerRunning) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= totalTime) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTimeColor = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'noon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  // Mock data
  const stats = {
    productivity: 78,
    focus: 85,
    energy: 62,
    dailyGoal: 65,
  };

  const activityByPeriod = [
    { time: 'morning', label: 'Morning', hours: 3.5, percentage: 87 },
    { time: 'noon', label: 'Afternoon', hours: 5.2, percentage: 93 },
    { time: 'evening', label: 'Evening', hours: 2.1, percentage: 68 },
    { time: 'night', label: 'Night', hours: 0.8, percentage: 45 },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary-dark dark:text-white flex items-center justify-center gap-3">
          <Clock className="w-10 h-10 animate-rotate-clockwise" />
          Clock Theme Showcase
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Experience time-inspired productivity design
        </p>
      </div>

      {/* Main Timer Section */}
      <Card variant="clock" hover={false} className="p-8">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-2xl font-semibold text-primary-dark dark:text-white">
            Pomodoro Timer
          </h2>
          
          <TimeDial
            progress={(timeElapsed / totalTime) * 100}
            color={isTimerRunning ? getCurrentTimeColor() : 'primary'}
            size="xl"
            value={formatTime(totalTime - timeElapsed)}
            label={isTimerRunning ? 'Focus Time' : 'Ready to Start'}
            showMarkers={true}
          />
          
          <div className="flex gap-4">
            <Button 
              shape="circular" 
              size="lg" 
              variant={isTimerRunning ? 'accent' : 'time'}
              icon={isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            />
            <Button 
              shape="circular" 
              size="lg" 
              variant="ghost"
              icon={<RotateCcw className="w-6 h-6" />}
              onClick={() => {
                setIsTimerRunning(false);
                setTimeElapsed(0);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="clock" hover={false} className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-primary dark:text-accent-blue">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Productivity</span>
            </div>
            <TimeDial
              progress={stats.productivity}
              color="noon"
              size="md"
              value={`${stats.productivity}%`}
              showMarkers={true}
            />
          </div>
        </Card>

        <Card variant="clock" hover={false} className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-accent-purple">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Focus Score</span>
            </div>
            <TimeDial
              progress={stats.focus}
              color="evening"
              size="md"
              value={stats.focus}
              showMarkers={true}
            />
          </div>
        </Card>

        <Card variant="clock" hover={false} className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-orange-500">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Energy Level</span>
            </div>
            <TimeDial
              progress={stats.energy}
              color="morning"
              size="md"
              value={`${stats.energy}%`}
              showMarkers={true}
            />
          </div>
        </Card>

        <Card variant="clock" hover={false} className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Daily Goal</span>
            </div>
            <TimeDial
              progress={stats.dailyGoal}
              color="primary"
              size="md"
              value={`${stats.dailyGoal}%`}
              showMarkers={true}
            />
          </div>
        </Card>
      </div>

      {/* Activity by Time Period */}
      <Card variant="glass" hover={false} className="p-8">
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-white mb-6 text-center">
          Activity by Time of Day
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {activityByPeriod.map((period) => (
            <motion.div
              key={period.time}
              className="flex flex-col items-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <TimeDial
                progress={period.percentage}
                color={period.time as any}
                size="lg"
                value={`${period.hours}h`}
                label={period.label}
                showMarkers={true}
              />
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {period.percentage}% effective
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Nested Clock Dials - Concentric Circles */}
      <Card variant="clock" hover={false} className="p-8">
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-white mb-6 text-center">
          Wellness Index
        </h2>
        
        <div className="relative w-64 h-64 mx-auto">
          {/* Outer ring - Productivity */}
          <div className="absolute inset-0 flex items-center justify-center">
            <TimeDial 
              progress={stats.productivity} 
              color="noon" 
              size="xl" 
              showMarkers={true}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 absolute -bottom-1">
                Productivity
              </div>
            </TimeDial>
          </div>
          
          {/* Middle ring - Focus */}
          <div className="absolute inset-8 flex items-center justify-center">
            <TimeDial 
              progress={stats.focus} 
              color="evening" 
              size="lg" 
              showMarkers={false}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 absolute -bottom-1">
                Focus
              </div>
            </TimeDial>
          </div>
          
          {/* Inner ring - Energy */}
          <div className="absolute inset-16 flex items-center justify-center">
            <TimeDial 
              progress={stats.energy} 
              color="morning" 
              size="md" 
              showMarkers={false}
            >
              <div className="text-2xl font-bold text-primary dark:text-white">
                {Math.round((stats.productivity + stats.focus + stats.energy) / 3)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Overall
              </div>
            </TimeDial>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Concentric dials visualize multiple metrics at once
        </p>
      </Card>

      {/* Button Showcase */}
      <Card variant="default" hover={false} className="p-8">
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-white mb-6 text-center">
          Clock-Themed Buttons
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="time">Time Gradient</Button>
          <Button variant="ghost">Ghost</Button>
          
          <div className="w-full" />
          
          <Button shape="circular" size="sm" icon={<Play className="w-4 h-4" />} variant="primary" />
          <Button shape="circular" size="md" icon={<Pause className="w-5 h-5" />} variant="accent" />
          <Button shape="circular" size="lg" icon={<RotateCcw className="w-6 h-6" />} variant="time" />
        </div>
      </Card>

      {/* Design Guidelines */}
      <Card variant="glass" hover={false} className="p-8">
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-white mb-4">
          Design Guidelines
        </h2>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 mt-0.5 text-accent-blue flex-shrink-0" />
            <div>
              <p className="font-semibold">Circular First</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use circular progress indicators for time-based metrics
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 mt-0.5 text-accent-purple flex-shrink-0" />
            <div>
              <p className="font-semibold">Time-Based Colors</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Morning (golden), Noon (bright), Evening (dusk), Night (calm)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 mt-0.5 text-time-morning flex-shrink-0" />
            <div>
              <p className="font-semibold">Smooth Animations</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clock hands and progress circles animate fluidly
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Brain, TrendingUp, Coffee, Zap, Trash2 } from 'lucide-react';
import { useAdaptiveTimer } from '../../hooks/useAdaptiveTimer';
import { Card } from '../ui/Card';

/* ─────────────────────────────────────────────
 * AdaptiveTimerWidget
 * ─────────────────────────────────────────────
 * Self-learning Pomodoro that adapts work/break
 * durations from your historical performance.
 * ───────────────────────────────────────────── */

export const AdaptiveTimerWidget: React.FC = () => {
  const timer = useAdaptiveTimer();
  const { phase, remaining, total, isRunning, recommendation, history } = timer;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  const focusSessions = history.filter((s) => s.type === 'focus');
  const completedCount = focusSessions.filter((s) => s.completed).length;

  const confidenceColors = {
    low: '#6b7280',
    medium: '#eab308',
    high: '#22c55e',
  };

  return (
    <Card className="overflow-hidden p-0" hover={false}>
      <div className="relative rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-400" />
            <h3 className="text-sm font-bold">Adaptive Timer</h3>
          </div>
          <span
            className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-semibold"
            style={{ color: confidenceColors[recommendation.confidence] }}
          >
            {recommendation.confidence === 'low'
              ? 'Learning…'
              : recommendation.confidence === 'medium'
                ? 'Adapting'
                : 'Tuned ✓'}
          </span>
        </div>

        {/* Timer Display */}
        <div className="mt-5 flex flex-col items-center">
          {/* Circular progress */}
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={phase === 'break' ? '#22c55e' : '#8b5cf6'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 44 * (1 - progress / 100),
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="text-center">
              <p className="font-mono text-3xl font-black">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
              <p className="mt-1 text-xs text-white/50">
                {phase === 'idle'
                  ? 'Ready'
                  : phase === 'focus'
                    ? '🔥 Focus'
                    : '☕ Break'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-2">
            {phase === 'idle' ? (
              <>
                <button
                  onClick={() => timer.startFocus()}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-violet-500"
                >
                  <Zap className="h-4 w-4" />
                  Focus ({recommendation.focusMinutes}m)
                </button>
                <button
                  onClick={() => timer.startBreak()}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/15"
                >
                  <Coffee className="h-4 w-4" />
                  Break ({recommendation.breakMinutes}m)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={isRunning ? timer.pause : timer.resume}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/15"
                >
                  {isRunning ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={timer.stop}
                  className="flex items-center gap-2 rounded-xl bg-red-600/20 px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-600/30"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="mt-5 rounded-xl border border-white/8 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
            <TrendingUp className="h-3.5 w-3.5" />
            Your Rhythm
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-violet-400">
                {recommendation.focusMinutes}m
              </p>
              <p className="text-xs text-white/40">focus</p>
            </div>
            <div className="text-white/20">→</div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {recommendation.breakMinutes}m
              </p>
              <p className="text-xs text-white/40">break</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-bold">
                {recommendation.completionRate}%
              </p>
              <p className="text-xs text-white/40">completion</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/50">
            {recommendation.reason}
          </p>
        </div>

        {/* Session Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>
            {completedCount} completed / {focusSessions.length} total sessions
          </span>
          {history.length > 0 && (
            <button
              onClick={timer.clearHistory}
              className="flex items-center gap-1 text-red-400/60 transition-colors hover:text-red-400"
              title="Clear session history"
            >
              <Trash2 className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

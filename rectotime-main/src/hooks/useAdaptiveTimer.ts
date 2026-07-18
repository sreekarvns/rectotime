import { useState, useEffect, useCallback, useRef } from 'react';

/* ─────────────────────────────────────────────
 * useAdaptiveTimer
 * ─────────────────────────────────────────────
 * Self-learning Pomodoro timer.
 * Adapts work/break durations based on historical
 * session performance.
 *
 * Algorithm (simple & explainable):
 * - Track last N completed/abandoned sessions
 * - If completion rate > 80% → suggest longer focus
 * - If completion rate < 50% → suggest shorter focus
 * - Break adjusts proportionally (1:5 ratio baseline)
 * ───────────────────────────────────────────── */

export interface TimerSession {
  startedAt: number;
  durationSeconds: number;
  completedSeconds: number;
  completed: boolean;
  type: 'focus' | 'break';
  timestamp: number;
}

export interface AdaptiveRecommendation {
  focusMinutes: number;
  breakMinutes: number;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
  sessionCount: number;
  completionRate: number;
}

export interface AdaptiveTimerState {
  /** Current phase */
  phase: 'idle' | 'focus' | 'break';
  /** Remaining seconds */
  remaining: number;
  /** Total duration for the current phase (seconds) */
  total: number;
  /** Is the timer actively counting? */
  isRunning: boolean;
  /** Current recommendation */
  recommendation: AdaptiveRecommendation;
  /** Session history */
  history: TimerSession[];
}

const STORAGE_KEY = 'rectotime_adaptive_timer';
const MAX_HISTORY = 50;
const DEFAULT_FOCUS = 25 * 60;
const MIN_FOCUS = 10 * 60;
const MAX_FOCUS = 50 * 60;
const MIN_BREAK = 3 * 60;
const MAX_BREAK = 15 * 60;

function loadHistory(): TimerSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TimerSession[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: TimerSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
  } catch {
    /* quota exceeded */
  }
}

function computeRecommendation(history: TimerSession[]): AdaptiveRecommendation {
  const focusSessions = history.filter((s) => s.type === 'focus');
  const recentFocus = focusSessions.slice(-10); // last 10 focus sessions
  const sessionCount = recentFocus.length;

  if (sessionCount < 3) {
    return {
      focusMinutes: 25,
      breakMinutes: 5,
      confidence: 'low',
      reason: 'Need at least 3 sessions to learn your rhythm. Using standard Pomodoro for now.',
      sessionCount,
      completionRate: 0,
    };
  }

  const completed = recentFocus.filter((s) => s.completed).length;
  const completionRate = completed / sessionCount;

  // Average actual focus time for completed sessions
  const completedSessions = recentFocus.filter((s) => s.completed);
  const avgCompletedDuration =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.durationSeconds, 0) /
        completedSessions.length
      : DEFAULT_FOCUS;

  let focusSeconds: number;
  let reason: string;

  if (completionRate >= 0.8) {
    // High completion → try 10% longer
    focusSeconds = Math.min(Math.round(avgCompletedDuration * 1.1), MAX_FOCUS);
    reason = `You complete ${Math.round(completionRate * 100)}% of sessions. Stretching focus by 10% to find your ceiling.`;
  } else if (completionRate >= 0.5) {
    // Moderate → keep same
    focusSeconds = Math.round(avgCompletedDuration);
    reason = `${Math.round(completionRate * 100)}% completion rate. Holding your current rhythm steady.`;
  } else {
    // Low completion → shorten by 15%
    focusSeconds = Math.max(Math.round(avgCompletedDuration * 0.85), MIN_FOCUS);
    reason = `Only ${Math.round(completionRate * 100)}% completion rate. Shortening focus blocks to build consistency.`;
  }

  // Break is ~1/5 of focus, clamped
  const breakSeconds = Math.max(MIN_BREAK, Math.min(MAX_BREAK, Math.round(focusSeconds / 5)));

  return {
    focusMinutes: Math.round(focusSeconds / 60),
    breakMinutes: Math.round(breakSeconds / 60),
    confidence: sessionCount >= 8 ? 'high' : 'medium',
    reason,
    sessionCount,
    completionRate: Math.round(completionRate * 100),
  };
}

export function useAdaptiveTimer(): AdaptiveTimerState & {
  startFocus: (customSeconds?: number) => void;
  startBreak: (customSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  clearHistory: () => void;
} {
  const [history, setHistory] = useState<TimerSession[]>(loadHistory);
  const [phase, setPhase] = useState<'idle' | 'focus' | 'break'>('idle');
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startedAtRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const recommendation = computeRecommendation(history);

  // Clean up interval
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, []);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        // Session completed
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);

        // Record completed session
        setHistory((prevHistory) => {
          const session: TimerSession = {
            startedAt: startedAtRef.current,
            durationSeconds: total,
            completedSeconds: total,
            completed: true,
            type: phase as 'focus' | 'break',
            timestamp: Date.now(),
          };
          const newHistory = [...prevHistory, session].slice(-MAX_HISTORY);
          saveHistory(newHistory);
          return newHistory;
        });

        setPhase('idle');
        return 0;
      }
      return prev - 1;
    });
  }, [phase, total]);

  const startFocus = useCallback(
    (customSeconds?: number) => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      const duration = customSeconds ?? recommendation.focusMinutes * 60;
      setPhase('focus');
      setTotal(duration);
      setRemaining(duration);
      setIsRunning(true);
      startedAtRef.current = Date.now();
      intervalRef.current = window.setInterval(tick, 1000);
    },
    [recommendation.focusMinutes, tick]
  );

  const startBreak = useCallback(
    (customSeconds?: number) => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      const duration = customSeconds ?? recommendation.breakMinutes * 60;
      setPhase('break');
      setTotal(duration);
      setRemaining(duration);
      setIsRunning(true);
      startedAtRef.current = Date.now();
      intervalRef.current = window.setInterval(tick, 1000);
    },
    [recommendation.breakMinutes, tick]
  );

  const pause = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (remaining > 0 && !isRunning) {
      intervalRef.current = window.setInterval(tick, 1000);
      setIsRunning(true);
    }
  }, [remaining, isRunning, tick]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Record abandoned session
    if (phase !== 'idle' && total > 0) {
      const elapsed = total - remaining;
      const session: TimerSession = {
        startedAt: startedAtRef.current,
        durationSeconds: total,
        completedSeconds: elapsed,
        completed: false,
        type: phase as 'focus' | 'break',
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const newHistory = [...prev, session].slice(-MAX_HISTORY);
        saveHistory(newHistory);
        return newHistory;
      });
    }

    setPhase('idle');
    setRemaining(0);
    setTotal(0);
    setIsRunning(false);
  }, [phase, total, remaining]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    phase,
    remaining,
    total,
    isRunning,
    recommendation,
    history,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    clearHistory,
  };
}

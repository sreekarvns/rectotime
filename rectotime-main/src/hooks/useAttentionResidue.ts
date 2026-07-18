import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────
 * useAttentionResidue
 * ─────────────────────────────────────────────
 * Tracks context switches and quantifies attention
 * residue — the cognitive drag from frequent task/view
 * switching.
 *
 * Based on Sophie Leroy (2009):
 *  "Why is it so hard to do my work?"
 *
 * Exposes a 0-100 residue score and actionable advice.
 * ───────────────────────────────────────────── */

export interface AttentionResidueState {
  /** 0-100, higher = more residue / fragmented attention */
  score: number;
  level: 'clear' | 'some_residue' | 'fragmented' | 'scattered';
  /** Switches in the rolling window */
  switchCount: number;
  /** Average dwell time per context (seconds) */
  avgDwellSeconds: number;
  /** Advisory message */
  advice: string;
}

interface ContextEntry {
  context: string;
  enterTs: number;
}

const WINDOW_MS = 15 * 60_000; // 15-minute rolling window
const MAX_HISTORY = 200;
const STORAGE_KEY = 'rectotime_attention_residue';

function classifyResidue(score: number): AttentionResidueState['level'] {
  if (score <= 20) return 'clear';
  if (score <= 45) return 'some_residue';
  if (score <= 70) return 'fragmented';
  return 'scattered';
}

function adviceFor(level: AttentionResidueState['level'], avgDwell: number): string {
  switch (level) {
    case 'clear':
      return 'Your attention is clean. Good time for deep work.';
    case 'some_residue':
      return 'Mild residue building. Try to finish the current task before switching.';
    case 'fragmented':
      return `You've been switching frequently (avg ${Math.round(avgDwell)}s per context). Consider staying with one task for the next 10 minutes.`;
    case 'scattered':
      return 'High residue detected. Stop multitasking — pick one task and commit to it for at least 15 minutes.';
  }
}

export function useAttentionResidue() {
  const historyRef = useRef<ContextEntry[]>([]);
  const currentContextRef = useRef<string>('dashboard');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ContextEntry[];
        if (Array.isArray(parsed)) {
          historyRef.current = parsed;
        }
      }
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  // Persist to localStorage
  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyRef.current.slice(-MAX_HISTORY)));
    } catch {
      /* non-critical */
    }
  }, []);

  /** Call this whenever the user navigates to a different view/task */
  const recordSwitch = useCallback(
    (newContext: string) => {
      if (newContext === currentContextRef.current) return;

      const now = Date.now();
      historyRef.current.push({
        context: currentContextRef.current,
        enterTs: now,
      });

      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current = historyRef.current.slice(-MAX_HISTORY);
      }

      currentContextRef.current = newContext;
      persist();
    },
    [persist]
  );

  /** Compute the current residue state */
  const getState = useCallback((): AttentionResidueState => {
    const now = Date.now();
    const cutoff = now - WINDOW_MS;

    // Filter to rolling window
    const recent = historyRef.current.filter((e) => e.enterTs >= cutoff);
    const switchCount = recent.length;

    // Average dwell time
    let totalDwell = 0;
    for (let i = 1; i < recent.length; i++) {
      totalDwell += recent[i].enterTs - recent[i - 1].enterTs;
    }
    const avgDwellMs = switchCount > 1 ? totalDwell / (switchCount - 1) : WINDOW_MS;
    const avgDwellSeconds = avgDwellMs / 1000;

    // Score: more switches + shorter dwells = higher residue
    // 0 switches → 0; 15+ switches in 15 min → 100
    const switchFactor = Math.min(switchCount / 15, 1) * 60;

    // Short average dwells → more residue
    // <30s avg dwell → max penalty; >300s → no penalty
    const dwellFactor =
      avgDwellSeconds < 300
        ? (1 - Math.min(avgDwellSeconds / 300, 1)) * 40
        : 0;

    const score = Math.round(Math.min(100, switchFactor + dwellFactor));
    const level = classifyResidue(score);

    return {
      score,
      level,
      switchCount,
      avgDwellSeconds: Math.round(avgDwellSeconds),
      advice: adviceFor(level, avgDwellSeconds),
    };
  }, []);

  return { recordSwitch, getState };
}

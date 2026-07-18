import { useEffect, useRef, useMemo, useCallback } from 'react';
import { type BehavioralSnapshot } from './useBehavioralSensing';

/* ─────────────────────────────────────────────
 * useFlowState
 * ─────────────────────────────────────────────
 * Detects Csikszentmihalyi-style flow states from
 * behavioural signals.
 *
 * Flow criteria (all must hold for ≥ 90 s):
 *  1. Sustained typing with long bursts
 *  2. Low error / backspace ratio
 *  3. Consistent keystroke rhythm (low IKI std-dev)
 *  4. Low mouse idle ratio (user is engaged)
 *  5. No context switches (tracked separately)
 *
 * Transitions:  idle → warming_up → in_flow → cooling_down → idle
 * ───────────────────────────────────────────── */

export type FlowPhase = 'idle' | 'warming_up' | 'in_flow' | 'cooling_down';

export interface FlowStateInfo {
  phase: FlowPhase;
  /** Seconds spent in current phase */
  phaseDuration: number;
  /** Total seconds spent in flow during this session */
  totalFlowSeconds: number;
  /** 0-100 flow likelihood (smooth) */
  flowScore: number;
  /** Whether the UI should enter zen-mode */
  zenMode: boolean;
  /** Human-readable status */
  label: string;
}

// ── Thresholds ──────────────────────────────

const FLOW_ENTRY_THRESHOLD = 65; // score above which → warming_up
const FLOW_CONFIRM_THRESHOLD = 70; // score above which, after warmup → in_flow
const FLOW_EXIT_THRESHOLD = 40; // score below which → cooling_down
const WARMUP_REQUIRED_MS = 90_000; // 90 s of warm-up before confirming flow
const COOLDOWN_GRACE_MS = 30_000; // 30 s grace before dropping out of flow

const STORAGE_KEY = 'rectotime_flow_total_seconds';

function computeRawFlowScore(snap: BehavioralSnapshot): number {
  const { typing, mouse } = snap;
  let score = 0;

  // Sustained typing burst ≥ 15 s  →  +25
  if (typing.longestBurstMs > 15_000) score += 25;
  else if (typing.longestBurstMs > 8_000) score += 15;
  else if (typing.longestBurstMs > 3_000) score += 5;

  // Low backspace ratio  →  +20
  if (typing.backspaceRatio < 0.06) score += 20;
  else if (typing.backspaceRatio < 0.12) score += 10;

  // Consistent rhythm (low IKI std-dev)  →  +20
  if (typing.stdIKI > 0 && typing.stdIKI < 120) score += 20;
  else if (typing.stdIKI < 250) score += 10;

  // Good WPM  →  +15
  if (typing.wpm > 35) score += 15;
  else if (typing.wpm > 20) score += 8;

  // Few pauses  →  +10
  if (typing.pauseCount <= 1) score += 10;
  else if (typing.pauseCount <= 3) score += 5;

  // User is active (low mouse idle)  →  +10
  if (mouse.idleRatio < 0.3) score += 10;
  else if (mouse.idleRatio < 0.5) score += 5;

  return Math.min(100, score);
}

function loadTotalFlow(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function useFlowState(snapshot: BehavioralSnapshot): FlowStateInfo {
  const phaseRef = useRef<FlowPhase>('idle');
  const phaseStartRef = useRef(Date.now());
  const totalFlowRef = useRef(loadTotalFlow());
  const lastTickRef = useRef(Date.now());

  // Persist total flow seconds periodically
  const persistTotal = useCallback((seconds: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(seconds));
    } catch {
      /* quota exceeded – non-critical */
    }
  }, []);

  // Run the state machine on each snapshot
  useEffect(() => {
    const now = Date.now();
    const dt = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    const rawScore = computeRawFlowScore(snapshot);
    const phase = phaseRef.current;
    const elapsed = now - phaseStartRef.current;

    switch (phase) {
      case 'idle':
        if (rawScore >= FLOW_ENTRY_THRESHOLD) {
          phaseRef.current = 'warming_up';
          phaseStartRef.current = now;
        }
        break;

      case 'warming_up':
        if (rawScore < FLOW_EXIT_THRESHOLD) {
          phaseRef.current = 'idle';
          phaseStartRef.current = now;
        } else if (rawScore >= FLOW_CONFIRM_THRESHOLD && elapsed >= WARMUP_REQUIRED_MS) {
          phaseRef.current = 'in_flow';
          phaseStartRef.current = now;
        }
        break;

      case 'in_flow':
        // Accumulate flow seconds
        totalFlowRef.current += dt;
        persistTotal(Math.round(totalFlowRef.current));

        if (rawScore < FLOW_EXIT_THRESHOLD) {
          phaseRef.current = 'cooling_down';
          phaseStartRef.current = now;
        }
        break;

      case 'cooling_down':
        if (rawScore >= FLOW_CONFIRM_THRESHOLD) {
          // Re-enter flow (recovered within grace period)
          phaseRef.current = 'in_flow';
          phaseStartRef.current = now;
        } else if (elapsed >= COOLDOWN_GRACE_MS) {
          phaseRef.current = 'idle';
          phaseStartRef.current = now;
        }
        break;
    }
  }, [snapshot, persistTotal]);

  return useMemo(() => {
    const now = Date.now();
    const phase = phaseRef.current;
    const phaseDuration = Math.round((now - phaseStartRef.current) / 1000);
    const totalFlowSeconds = Math.round(totalFlowRef.current);

    const flowScore = computeRawFlowScore(snapshot);

    const labels: Record<FlowPhase, string> = {
      idle: 'Waiting for focus signal…',
      warming_up: 'Building momentum…',
      in_flow: '🌊 Deep flow — stay with it',
      cooling_down: 'Flow fading — refocus to recover',
    };

    return {
      phase,
      phaseDuration,
      totalFlowSeconds,
      flowScore,
      zenMode: phase === 'in_flow',
      label: labels[phase],
    };
  }, [snapshot]);
}

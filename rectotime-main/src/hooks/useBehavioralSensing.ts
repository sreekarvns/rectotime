import { useEffect, useRef, useCallback, useState } from 'react';

/* ─────────────────────────────────────────────
 * useBehavioralSensing
 * ─────────────────────────────────────────────
 * Core digital-phenotyping hook.
 * Passively captures typing and mouse dynamics and exposes
 * derived metrics consumed by higher-level classifiers
 * (cognitive-load, flow, attention-residue).
 *
 * ALL processing happens in-browser – no network calls.
 * ───────────────────────────────────────────── */

// ── Public metric shapes ────────────────────

export interface TypingMetrics {
  /** Words per minute (rolling 60 s window) */
  wpm: number;
  /** Mean inter-key interval in ms */
  meanIKI: number;
  /** Std-dev of inter-key intervals */
  stdIKI: number;
  /** Ratio of backspace presses to total keys (0-1) */
  backspaceRatio: number;
  /** Number of pauses >2 s in the window */
  pauseCount: number;
  /** Longest uninterrupted typing burst in ms */
  longestBurstMs: number;
  /** Total keys in the current window */
  totalKeys: number;
}

export interface MouseMetrics {
  /** Mean cursor velocity (px/s) over the window */
  meanVelocity: number;
  /** Std-dev of cursor velocity */
  stdVelocity: number;
  /** Mean path curvature ratio (actual / straight-line) */
  meanCurvature: number;
  /** Mean hesitation before clicks (ms) */
  clickHesitationMs: number;
  /** Total distance travelled (px) */
  totalDistance: number;
  /** Idle time ratio (cursor stationary >1 s / total window) */
  idleRatio: number;
}

export interface BehavioralSnapshot {
  typing: TypingMetrics;
  mouse: MouseMetrics;
  /** Epoch timestamp of the snapshot */
  timestamp: number;
}

// ── Internal ring-buffer helpers ────────────

interface KeyEvent {
  ts: number;
  key: string;
}

interface MouseSample {
  ts: number;
  x: number;
  y: number;
}

interface ClickEvent {
  ts: number;
  lastMoveTs: number; // timestamp of last mousemove before click
}

const WINDOW_MS = 60_000; // 60 s sliding window
const SAMPLE_INTERVAL_MS = 1_000; // recompute metrics every 1 s
const MAX_BUFFER = 600; // cap ring-buffer size

function trimBuffer<T extends { ts: number }>(buf: T[], now: number): T[] {
  const cutoff = now - WINDOW_MS;
  const idx = buf.findIndex((e) => e.ts >= cutoff);
  return idx <= 0 ? buf : buf.slice(idx);
}

// ── Hook ────────────────────────────────────

export function useBehavioralSensing() {
  const keyBuffer = useRef<KeyEvent[]>([]);
  const mouseBuffer = useRef<MouseSample[]>([]);
  const clickBuffer = useRef<ClickEvent[]>([]);
  const lastMouseTs = useRef(0);

  const [snapshot, setSnapshot] = useState<BehavioralSnapshot>(() => ({
    typing: {
      wpm: 0,
      meanIKI: 0,
      stdIKI: 0,
      backspaceRatio: 0,
      pauseCount: 0,
      longestBurstMs: 0,
      totalKeys: 0,
    },
    mouse: {
      meanVelocity: 0,
      stdVelocity: 0,
      meanCurvature: 1,
      clickHesitationMs: 0,
      totalDistance: 0,
      idleRatio: 1,
    },
    timestamp: Date.now(),
  }));

  // ── Event handlers (stable refs) ──────────

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore modifier-only presses
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    const now = Date.now();
    keyBuffer.current.push({ ts: now, key: e.key });
    if (keyBuffer.current.length > MAX_BUFFER) {
      keyBuffer.current = keyBuffer.current.slice(-MAX_BUFFER);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    // Throttle to ~30 Hz
    if (now - lastMouseTs.current < 33) return;
    lastMouseTs.current = now;
    mouseBuffer.current.push({ ts: now, x: e.clientX, y: e.clientY });
    if (mouseBuffer.current.length > MAX_BUFFER) {
      mouseBuffer.current = mouseBuffer.current.slice(-MAX_BUFFER);
    }
  }, []);

  const handleClick = useCallback(() => {
    const now = Date.now();
    clickBuffer.current.push({
      ts: now,
      lastMoveTs: lastMouseTs.current,
    });
    if (clickBuffer.current.length > MAX_BUFFER) {
      clickBuffer.current = clickBuffer.current.slice(-MAX_BUFFER);
    }
  }, []);

  // ── Metric computation ────────────────────

  const computeSnapshot = useCallback((): BehavioralSnapshot => {
    const now = Date.now();

    // Trim buffers to the sliding window
    keyBuffer.current = trimBuffer(keyBuffer.current, now);
    mouseBuffer.current = trimBuffer(mouseBuffer.current, now);
    clickBuffer.current = trimBuffer(clickBuffer.current, now);

    const keys = keyBuffer.current;
    const mouse = mouseBuffer.current;
    const clicks = clickBuffer.current;

    // ── Typing metrics ──────────────────────

    const totalKeys = keys.length;
    const backspaces = keys.filter((k) => k.key === 'Backspace').length;

    // Inter-key intervals (IKI)
    const ikis: number[] = [];
    for (let i = 1; i < keys.length; i++) {
      ikis.push(keys[i].ts - keys[i - 1].ts);
    }

    const meanIKI = ikis.length > 0 ? ikis.reduce((a, b) => a + b, 0) / ikis.length : 0;
    const stdIKI =
      ikis.length > 1
        ? Math.sqrt(ikis.reduce((sum, v) => sum + (v - meanIKI) ** 2, 0) / ikis.length)
        : 0;

    // WPM — estimate (5 chars = 1 word)
    const nonBackspaceKeys = totalKeys - backspaces;
    const windowSeconds = Math.min((now - (keys[0]?.ts ?? now)) / 1000, WINDOW_MS / 1000);
    const wpm = windowSeconds > 0 ? (nonBackspaceKeys / 5) / (windowSeconds / 60) : 0;

    // Pauses (>2 s gaps)
    const pauseCount = ikis.filter((iki) => iki > 2000).length;

    // Longest uninterrupted burst
    let longestBurstMs = 0;
    let currentBurst = 0;
    for (const iki of ikis) {
      if (iki < 2000) {
        currentBurst += iki;
      } else {
        longestBurstMs = Math.max(longestBurstMs, currentBurst);
        currentBurst = 0;
      }
    }
    longestBurstMs = Math.max(longestBurstMs, currentBurst);

    const typingMetrics: TypingMetrics = {
      wpm: Math.round(wpm * 10) / 10,
      meanIKI: Math.round(meanIKI),
      stdIKI: Math.round(stdIKI),
      backspaceRatio: totalKeys > 0 ? Math.round((backspaces / totalKeys) * 100) / 100 : 0,
      pauseCount,
      longestBurstMs: Math.round(longestBurstMs),
      totalKeys,
    };

    // ── Mouse metrics ───────────────────────

    let totalDistance = 0;
    const velocities: number[] = [];

    for (let i = 1; i < mouse.length; i++) {
      const dx = mouse[i].x - mouse[i - 1].x;
      const dy = mouse[i].y - mouse[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = (mouse[i].ts - mouse[i - 1].ts) / 1000; // seconds
      totalDistance += dist;
      if (dt > 0) velocities.push(dist / dt);
    }

    const meanVelocity =
      velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;
    const stdVelocity =
      velocities.length > 1
        ? Math.sqrt(velocities.reduce((sum, v) => sum + (v - meanVelocity) ** 2, 0) / velocities.length)
        : 0;

    // Curvature: ratio of actual path to straight-line between first/last point
    let meanCurvature = 1;
    if (mouse.length >= 2) {
      const first = mouse[0];
      const last = mouse[mouse.length - 1];
      const straightLine = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);
      meanCurvature = straightLine > 0 ? Math.min(totalDistance / straightLine, 5) : 1;
    }

    // Click hesitation (time between last mouse-move and click)
    const hesitations = clicks
      .map((c) => c.ts - c.lastMoveTs)
      .filter((h) => h >= 0 && h < 5000);
    const clickHesitationMs =
      hesitations.length > 0 ? hesitations.reduce((a, b) => a + b, 0) / hesitations.length : 0;

    // Idle ratio: time where cursor was stationary (>1 s between samples)
    let idleMs = 0;
    for (let i = 1; i < mouse.length; i++) {
      const gap = mouse[i].ts - mouse[i - 1].ts;
      if (gap > 1000) idleMs += gap;
    }
    const totalWindowMs = mouse.length >= 2 ? mouse[mouse.length - 1].ts - mouse[0].ts : WINDOW_MS;
    const idleRatio = totalWindowMs > 0 ? Math.min(idleMs / totalWindowMs, 1) : 1;

    const mouseMetrics: MouseMetrics = {
      meanVelocity: Math.round(meanVelocity),
      stdVelocity: Math.round(stdVelocity),
      meanCurvature: Math.round(meanCurvature * 100) / 100,
      clickHesitationMs: Math.round(clickHesitationMs),
      totalDistance: Math.round(totalDistance),
      idleRatio: Math.round(idleRatio * 100) / 100,
    };

    return { typing: typingMetrics, mouse: mouseMetrics, timestamp: now };
  }, []);

  // ── Mount listeners & recompute interval ──

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    const interval = window.setInterval(() => {
      setSnapshot(computeSnapshot());
    }, SAMPLE_INTERVAL_MS);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.clearInterval(interval);
    };
  }, [handleKeyDown, handleMouseMove, handleClick, computeSnapshot]);

  return snapshot;
}

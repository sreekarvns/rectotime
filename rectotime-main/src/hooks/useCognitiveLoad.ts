import { useMemo } from 'react';
import { type BehavioralSnapshot } from './useBehavioralSensing';

/* ─────────────────────────────────────────────
 * useCognitiveLoad
 * ─────────────────────────────────────────────
 * Multi-modal cognitive load estimator.
 * Fuses typing + mouse signals into a 0-100 score.
 *
 * Based on:
 * - Hibbeln et al. (2017) – mouse dynamics & cognitive load
 * - Grimes & Valacich (2015) – cursor curvature under load
 * ───────────────────────────────────────────── */

export type CognitiveLoadLevel = 'low' | 'moderate' | 'high' | 'overloaded';

export interface CognitiveLoadState {
  /** 0-100, higher = more cognitive load */
  score: number;
  level: CognitiveLoadLevel;
  /** Human-readable explanation */
  label: string;
  /** Contributing factors for transparency */
  factors: string[];
}

function classifyLevel(score: number): CognitiveLoadLevel {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'overloaded';
}

function labelFor(level: CognitiveLoadLevel): string {
  switch (level) {
    case 'low':
      return 'Light load — you have bandwidth';
    case 'moderate':
      return 'Normal load — working steadily';
    case 'high':
      return 'Heavy load — consider simplifying';
    case 'overloaded':
      return 'Overloaded — take a break soon';
  }
}

export function useCognitiveLoad(snapshot: BehavioralSnapshot): CognitiveLoadState {
  return useMemo(() => {
    const { typing, mouse } = snapshot;
    const factors: string[] = [];
    let score = 30; // base (moderate)

    // ── Typing signals ──────────────────────

    // High IKI variance → indecision / cognitive struggle
    if (typing.stdIKI > 400) {
      score += 12;
      factors.push('Irregular typing rhythm');
    } else if (typing.stdIKI > 200) {
      score += 5;
    }

    // High backspace ratio → error correction under load
    if (typing.backspaceRatio > 0.25) {
      score += 15;
      factors.push('Frequent corrections');
    } else if (typing.backspaceRatio > 0.12) {
      score += 7;
    }

    // Many pauses → difficulty formulating thoughts
    if (typing.pauseCount > 5) {
      score += 12;
      factors.push('Frequent pauses');
    } else if (typing.pauseCount > 2) {
      score += 5;
    }

    // Very low WPM when there is typing activity → struggling
    if (typing.totalKeys > 10 && typing.wpm < 15) {
      score += 10;
      factors.push('Slow typing speed');
    }

    // Steady, fast typing with few errors → reduce load score
    if (typing.totalKeys > 20 && typing.wpm > 40 && typing.backspaceRatio < 0.08) {
      score -= 15;
      factors.push('Fluent typing');
    }

    // ── Mouse signals ───────────────────────

    // High cursor curvature → uncertainty / cognitive load
    if (mouse.meanCurvature > 2.5) {
      score += 12;
      factors.push('Erratic cursor paths');
    } else if (mouse.meanCurvature > 1.8) {
      score += 5;
    }

    // High velocity variance → indecisive movement
    if (mouse.stdVelocity > 600) {
      score += 8;
      factors.push('Unsteady cursor speed');
    }

    // Long click hesitation → deliberation
    if (mouse.clickHesitationMs > 1200) {
      score += 10;
      factors.push('Hesitant clicks');
    } else if (mouse.clickHesitationMs > 600) {
      score += 4;
    }

    // High idle ratio → disengagement or overwhelm
    if (mouse.idleRatio > 0.7) {
      score += 8;
      factors.push('Long cursor idle periods');
    }

    // Smooth, purposeful movement → reduce
    if (mouse.meanCurvature < 1.3 && mouse.stdVelocity < 200 && mouse.totalDistance > 500) {
      score -= 10;
      factors.push('Purposeful cursor movement');
    }

    // ── Clamp ───────────────────────────────

    score = Math.max(0, Math.min(100, Math.round(score)));
    const level = classifyLevel(score);

    return {
      score,
      level,
      label: labelFor(level),
      factors: factors.length > 0 ? factors : ['Insufficient activity for assessment'],
    };
  }, [snapshot]);
}

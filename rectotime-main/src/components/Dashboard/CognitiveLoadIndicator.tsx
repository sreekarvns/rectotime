import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, AlertTriangle, Zap } from 'lucide-react';
import { type CognitiveLoadState } from '../../hooks/useCognitiveLoad';
import { type FlowStateInfo } from '../../hooks/useFlowState';
import { type AttentionResidueState } from '../../hooks/useAttentionResidue';

/* ─────────────────────────────────────────────
 * CognitiveLoadIndicator
 * ─────────────────────────────────────────────
 * Compact header bar showing real-time cognitive load,
 * flow state, and attention residue at a glance.
 * ───────────────────────────────────────────── */

interface Props {
  cognitiveLoad: CognitiveLoadState;
  flowState: FlowStateInfo;
  residue: AttentionResidueState;
}

const loadColors: Record<CognitiveLoadState['level'], string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  overloaded: '#ef4444',
};

const loadBgColors: Record<CognitiveLoadState['level'], string> = {
  low: 'rgba(34,197,94,0.12)',
  moderate: 'rgba(234,179,8,0.12)',
  high: 'rgba(249,115,22,0.12)',
  overloaded: 'rgba(239,68,68,0.12)',
};

const flowColors: Record<FlowStateInfo['phase'], string> = {
  idle: '#6b7280',
  warming_up: '#eab308',
  in_flow: '#8b5cf6',
  cooling_down: '#f97316',
};

const residueColors: Record<AttentionResidueState['level'], string> = {
  clear: '#22c55e',
  some_residue: '#eab308',
  fragmented: '#f97316',
  scattered: '#ef4444',
};

export const CognitiveLoadIndicator: React.FC<Props> = ({
  cognitiveLoad,
  flowState,
  residue,
}) => {
  return (
    <motion.div
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Cognitive Load ────────────────── */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: loadBgColors[cognitiveLoad.level] }}
        >
          <Brain
            className="h-4 w-4"
            style={{ color: loadColors[cognitiveLoad.level] }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Cognitive Load
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: loadColors[cognitiveLoad.level] }}
                animate={{ width: `${cognitiveLoad.score}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span
              className="text-xs font-bold"
              style={{ color: loadColors[cognitiveLoad.level] }}
            >
              {cognitiveLoad.score}
            </span>
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* ── Flow State ────────────────────── */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              flowState.phase === 'in_flow'
                ? 'rgba(139,92,246,0.15)'
                : 'rgba(107,114,128,0.1)',
          }}
        >
          {flowState.phase === 'in_flow' ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap
                className="h-4 w-4"
                style={{ color: flowColors[flowState.phase] }}
              />
            </motion.div>
          ) : (
            <Activity
              className="h-4 w-4"
              style={{ color: flowColors[flowState.phase] }}
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Flow
          </p>
          <p
            className="truncate text-xs font-medium"
            style={{ color: flowColors[flowState.phase] }}
          >
            {flowState.phase === 'idle' && 'Waiting…'}
            {flowState.phase === 'warming_up' && 'Building…'}
            {flowState.phase === 'in_flow' && `🌊 ${Math.floor(flowState.phaseDuration / 60)}m`}
            {flowState.phase === 'cooling_down' && 'Fading…'}
          </p>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* ── Attention Residue ─────────────── */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              residue.level === 'clear'
                ? 'rgba(34,197,94,0.1)'
                : residue.level === 'scattered'
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(234,179,8,0.1)',
          }}
        >
          <AlertTriangle
            className="h-4 w-4"
            style={{ color: residueColors[residue.level] }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Residue
          </p>
          <p
            className="text-xs font-medium"
            style={{ color: residueColors[residue.level] }}
          >
            {residue.switchCount} switches
          </p>
        </div>
      </div>

      {/* ── Flow total (lifetime) ────────── */}
      {flowState.totalFlowSeconds > 0 && (
        <>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-purple-400">
              {Math.floor(flowState.totalFlowSeconds / 60)}m
            </span>{' '}
            total flow
          </div>
        </>
      )}
    </motion.div>
  );
};

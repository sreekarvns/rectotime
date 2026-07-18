import React from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Focus, Clock } from 'lucide-react';
import { type AttentionResidueState } from '../../hooks/useAttentionResidue';
import { Card } from '../ui/Card';

/* ─────────────────────────────────────────────
 * AttentionResidueCard
 * ─────────────────────────────────────────────
 * Displays attention residue score and advice.
 * ───────────────────────────────────────────── */

interface Props {
  residue: AttentionResidueState;
}

const levelEmoji: Record<AttentionResidueState['level'], string> = {
  clear: '🟢',
  some_residue: '🟡',
  fragmented: '🟠',
  scattered: '🔴',
};

const levelLabel: Record<AttentionResidueState['level'], string> = {
  clear: 'Clear',
  some_residue: 'Mild Residue',
  fragmented: 'Fragmented',
  scattered: 'Scattered',
};

export const AttentionResidueCard: React.FC<Props> = ({ residue }) => {
  return (
    <Card className="overflow-hidden p-0" hover={false}>
      <div className="relative rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold">Attention Residue</h3>
          </div>
          <span className="text-lg">{levelEmoji[residue.level]}</span>
        </div>

        {/* Score + Level */}
        <div className="mt-4 flex items-end gap-3">
          <span className="text-4xl font-black">{residue.score}</span>
          <span className="mb-1 text-sm text-white/60">/ 100</span>
          <span className="mb-1.5 ml-auto rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold">
            {levelLabel[residue.level]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                residue.score <= 20
                  ? '#22c55e'
                  : residue.score <= 45
                    ? '#eab308'
                    : residue.score <= 70
                      ? '#f97316'
                      : '#ef4444',
            }}
            animate={{ width: `${residue.score}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Shuffle className="h-3 w-3" />
              Switches (15m)
            </div>
            <p className="mt-1 text-lg font-bold">{residue.switchCount}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Clock className="h-3 w-3" />
              Avg dwell
            </div>
            <p className="mt-1 text-lg font-bold">
              {residue.avgDwellSeconds > 60
                ? `${Math.floor(residue.avgDwellSeconds / 60)}m`
                : `${residue.avgDwellSeconds}s`}
            </p>
          </div>
        </div>

        {/* Advice */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/8 bg-white/5 p-3">
          <Focus className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" />
          <p className="text-xs leading-5 text-white/70">{residue.advice}</p>
        </div>
      </div>
    </Card>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';

/* ─────────────────────────────────────────────
 * FlowStateOverlay
 * ─────────────────────────────────────────────
 * When flow is detected, show an ambient overlay
 * that signals zen-mode without being intrusive.
 *
 * A subtle top-bar glow + minimal notification.
 * Can be dismissed by the user.
 * ───────────────────────────────────────────── */

interface Props {
  isInFlow: boolean;
  flowDurationSeconds: number;
  onDismiss: () => void;
}

export const FlowStateOverlay: React.FC<Props> = ({
  isInFlow,
  flowDurationSeconds,
  onDismiss,
}) => {
  const minutes = Math.floor(flowDurationSeconds / 60);
  const seconds = flowDurationSeconds % 60;

  return (
    <AnimatePresence>
      {isInFlow && (
        <>
          {/* ── Ambient top glow ──────────────── */}
          <motion.div
            className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* ── Flow badge (bottom-right) ─────── */}
          <motion.div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-purple-950/80 px-5 py-3 shadow-2xl shadow-purple-500/20 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-5 w-5 text-purple-400" />
            </motion.div>

            <div>
              <p className="text-sm font-bold text-purple-200">Deep Flow</p>
              <p className="text-xs text-purple-400">
                {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`} in the zone
              </p>
            </div>

            <button
              onClick={onDismiss}
              className="ml-2 rounded-lg p-1 text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-200"
              aria-label="Dismiss flow notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

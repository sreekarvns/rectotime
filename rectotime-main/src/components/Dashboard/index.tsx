import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Goal } from '../../types';
import { GoalsWidget } from './GoalsWidget';
import { ActivityStatsWidget } from './ActivityStatsWidget';
import { MLInsights } from './MLInsights';
import { DailyOperatingBrief } from './DailyOperatingBrief';
import { CognitiveLoadIndicator } from './CognitiveLoadIndicator';
import { FlowStateOverlay } from './FlowStateOverlay';
import { AttentionResidueCard } from './AttentionResidueCard';
import { AdaptiveTimerWidget } from './AdaptiveTimerWidget';
import { useGoalManagement } from '../../hooks/useGoalManagement';
import { useBehavioralSensing } from '../../hooks/useBehavioralSensing';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { useFlowState } from '../../hooks/useFlowState';
import { useAttentionResidue, type AttentionResidueState } from '../../hooks/useAttentionResidue';
import { StaggeredContainer, StaggeredItem } from '../ui/AnimatedPage';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Link2, Sparkles, Target, TrendingUp } from 'lucide-react';

interface DashboardProps {
  goals: Goal[];
  tasksCount?: number;
  onNavigate?: (view: 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'integrations' | 'settings') => void;
}

/**
 * Main dashboard view combining goals, timers, activity, ML insights,
 * and digital phenotyping (cognitive load, flow state, attention residue).
 */
const Dashboard: React.FC<DashboardProps> = ({ goals: initialGoals, tasksCount = 0, onNavigate }) => {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalManagement(initialGoals);
  const [goalComposerSignal, setGoalComposerSignal] = useState(0);
  const [isGuidedSetupActive, setIsGuidedSetupActive] = useState(
    () => localStorage.getItem('rectotime_guided_setup_active') === 'true'
  );
  const [flowDismissed, setFlowDismissed] = useState(false);

  // ── Digital Phenotyping hooks ─────────────
  const behavioralSnapshot = useBehavioralSensing();
  const cognitiveLoad = useCognitiveLoad(behavioralSnapshot);
  const flowState = useFlowState(behavioralSnapshot);
  const { recordSwitch, getState: getResidueState } = useAttentionResidue();
  const [residueState, setResidueState] = useState<AttentionResidueState>({
    score: 0,
    level: 'clear',
    switchCount: 0,
    avgDwellSeconds: 0,
    advice: 'Your attention is clean. Good time for deep work.',
  });

  // Track view switches for attention residue
  const handleNavigate = useCallback(
    (view: 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'integrations' | 'settings') => {
      recordSwitch(view);
      setResidueState(getResidueState());
      onNavigate?.(view);
    },
    [recordSwitch, getResidueState, onNavigate]
  );

  // Refresh residue state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setResidueState(getResidueState());
    }, 5000);
    return () => clearInterval(interval);
  }, [getResidueState]);

  // Reset flow dismissed when flow ends
  useEffect(() => {
    if (flowState.phase !== 'in_flow') setFlowDismissed(false);
  }, [flowState.phase]);

  const isFirstRun = goals.length === 0;

  const hasIntegrationConnection = useMemo(() => {
    try {
      const integrationMapRaw = localStorage.getItem('rectotime_integrations_v2');
      if (integrationMapRaw) {
        const parsed = JSON.parse(integrationMapRaw) as Record<string, boolean>;
        if (Object.values(parsed).some(Boolean)) {
          return true;
        }
      }
    } catch {
      // Ignore malformed local storage data and fall back to legacy key checks.
    }

    return localStorage.getItem('rectotime_wearable_connected') === 'true';
  }, [tasksCount, goals.length]);

  const setupSteps = useMemo(
    () => [
      {
        id: 'goal',
        title: 'Create your first goal',
        description: 'Give the system one measurable objective to optimize around.',
        icon: Target,
        completed: goals.length > 0,
        actionLabel: goals.length > 0 ? 'Completed' : 'Add goal',
        action: () => setGoalComposerSignal((value) => value + 1),
      },
      {
        id: 'integration',
        title: 'Connect an integration',
        description: 'Use passive signals to reduce manual effort and improve predictions.',
        icon: Link2,
        completed: hasIntegrationConnection,
        actionLabel: hasIntegrationConnection ? 'Connected' : 'Open integrations',
        action: () => handleNavigate('integrations'),
      },
      {
        id: 'calendar',
        title: 'Schedule one focus block',
        description: 'Turn intent into a real time block inside your calendar.',
        icon: CalendarDays,
        completed: tasksCount > 0,
        actionLabel: tasksCount > 0 ? 'Scheduled' : 'Open calendar',
        action: () => handleNavigate('calendar'),
      },
    ],
    [goals.length, hasIntegrationConnection, handleNavigate, tasksCount]
  );

  const setupProgress = Math.round((setupSteps.filter((step) => step.completed).length / setupSteps.length) * 100);

  useEffect(() => {
    if (isGuidedSetupActive && setupSteps.every((step) => step.completed)) {
      localStorage.removeItem('rectotime_guided_setup_active');
      setIsGuidedSetupActive(false);
    }
  }, [isGuidedSetupActive, setupSteps]);

  const launchCards = useMemo(
    () => [
      {
        title: 'Create your first goal',
        description: 'Start with one concrete objective so your dashboard has something to organize around.',
        icon: Target,
        actionLabel: 'Add goal',
        action: () => setGoalComposerSignal((value) => value + 1),
      },
      {
        title: 'Connect your apps',
        description: 'Link Strava, Terra, and future providers so stress and productivity become more automatic.',
        icon: Link2,
        actionLabel: 'Open integrations',
        action: () => handleNavigate('integrations'),
      },
      {
        title: 'Map the week',
        description: 'Use the calendar and timetable to turn ideas into a visible time system.',
        icon: CalendarDays,
        actionLabel: 'Open calendar',
        action: () => handleNavigate('calendar'),
      },
      {
        title: 'Preview your insights',
        description: 'Explore analytics and ML features so you can see how the product closes the loop.',
        icon: TrendingUp,
        actionLabel: 'View analytics',
        action: () => handleNavigate('analytics'),
      },
    ],
    [handleNavigate]
  );

  return (
    <div className="space-y-6">
      {/* ── Flow State Overlay (page-level) ──── */}
      <FlowStateOverlay
        isInFlow={flowState.phase === 'in_flow' && !flowDismissed}
        flowDurationSeconds={flowState.phaseDuration}
        onDismiss={() => setFlowDismissed(true)}
      />

      {/* ── Cognitive Sensing Bar ────────────── */}
      <CognitiveLoadIndicator
        cognitiveLoad={cognitiveLoad}
        flowState={flowState}
        residue={residueState}
      />

      {(isFirstRun || isGuidedSetupActive) && (
        <motion.section
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(79,158,248,0.18),rgba(167,139,250,0.14),rgba(10,15,30,0.90))] p-6 text-white shadow-2xl sm:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              {isGuidedSetupActive ? 'Guided setup sequence' : 'First-run command center'}
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              {isGuidedSetupActive
                ? 'Let\u2019s complete your first operating loop.'
                : 'Your workspace is ready. Now give it a real signal to organize around.'}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
              {isGuidedSetupActive
                ? 'Complete these three milestones to unlock a stronger signal loop across planning, integrations, and execution.'
                : 'Start with a goal, connect a live data source, or map your week. RectoTime works best when time, intent, and feedback all enter the same loop.'}
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/70">
                <span>Setup progress</span>
                <span>{setupProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F9EF8] to-[#A78BFA]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(8, setupProgress)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {(isGuidedSetupActive ? setupSteps : launchCards).map((card) => {
                const { title, description, icon: Icon, actionLabel, action } = card;
                const isCompleted = 'completed' in card ? Boolean(card.completed) : false;

                return (
                  <motion.button
                    key={title}
                    onClick={action}
                    className={`group rounded-[1.5rem] border p-5 text-left backdrop-blur-sm ${
                      isCompleted
                        ? 'border-emerald-300/30 bg-emerald-500/12'
                        : 'border-white/10 bg-white/8'
                    }`}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/75">{description}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-white/60 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-4 text-sm font-medium text-white/90">{actionLabel}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      <StaggeredContainer>
        <StaggeredItem>
          <DailyOperatingBrief
            goals={goals}
            onNavigate={handleNavigate}
            onOpenGoalComposer={() => setGoalComposerSignal((value) => value + 1)}
          />
        </StaggeredItem>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Widget */}
          <StaggeredItem>
            <GoalsWidget
              goals={goals}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
              openComposerSignal={goalComposerSignal}
            />
          </StaggeredItem>

          {/* Adaptive Timer (replaces basic timer) */}
          <StaggeredItem>
            <AdaptiveTimerWidget />
          </StaggeredItem>

          {/* Attention Residue */}
          <StaggeredItem>
            <AttentionResidueCard residue={residueState} />
          </StaggeredItem>

          {/* Activity Stats */}
          <StaggeredItem>
            <ActivityStatsWidget
              currentStatus={{
                activity: null,
                timeSpent: 0,
                focusScore: { value: 0, trend: 'stable', factors: [] },
                isIdle: false,
              }}
            />
          </StaggeredItem>
        </div>

        {/* ML Insights - Full Width */}
        <StaggeredItem>
          <MLInsights />
        </StaggeredItem>
      </StaggeredContainer>
    </div>
  );
};

export default Dashboard;

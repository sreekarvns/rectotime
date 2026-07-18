import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Link2,
  Save,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { Goal } from '../../types';
import { getTodayStats } from '../../utils/activityMonitor';
import { storage } from '../../utils/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type DashboardView = 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'integrations' | 'settings';

interface DailyOperatingBriefProps {
  goals: Goal[];
  onNavigate?: (view: DashboardView) => void;
  onOpenGoalComposer?: () => void;
}

interface ActionCard {
  id: string;
  title: string;
  description: string;
  label: string;
  tone: 'blue' | 'emerald' | 'amber';
  action: () => void;
}

const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatTime = (date: Date): string =>
  date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const actionToneClasses: Record<ActionCard['tone'], string> = {
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
};

export const DailyOperatingBrief: React.FC<DailyOperatingBriefProps> = ({
  goals,
  onNavigate,
  onOpenGoalComposer,
}) => {
  const [topPriority, setTopPriority] = useState('');
  const [mustWin, setMustWin] = useState('');
  const [shutdownNote, setShutdownNote] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const now = new Date();
  const todayKey = getDateKey(now);
  const stats = getTodayStats();

  const tasks = useMemo(() => storage.getTasks(), []);
  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => isSameDay(new Date(task.startTime), now))
        .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()),
    [now, tasks]
  );

  const completedBlocks = todayTasks.filter((task) => task.status === 'completed').length;
  const nextBlock = todayTasks.find((task) => new Date(task.endTime).getTime() >= now.getTime()) ?? null;
  const incompleteGoals = goals.filter((goal) => !goal.completed);

  const priorityGoal = useMemo(() => {
    if (incompleteGoals.length === 0) return null;

    return [...incompleteGoals].sort((left, right) => {
      const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Number.POSITIVE_INFINITY;
      const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Number.POSITIVE_INFINITY;

      if (leftDeadline !== rightDeadline) return leftDeadline - rightDeadline;

      const leftProgress = left.current / Math.max(left.target, 1);
      const rightProgress = right.current / Math.max(right.target, 1);
      return leftProgress - rightProgress;
    })[0];
  }, [incompleteGoals]);

  const recentStress = storage.getLastStressCheckIns(1);
  const latestStress = recentStress.length > 0 ? recentStress[recentStress.length - 1] : null;
  const integrationConnected = useMemo(() => {
    try {
      const raw = localStorage.getItem('rectotime_integrations_v2');
      if (!raw) return localStorage.getItem('rectotime_wearable_connected') === 'true';
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return Object.values(parsed).some(Boolean);
    } catch {
      return localStorage.getItem('rectotime_wearable_connected') === 'true';
    }
  }, []);

  const goalCompletionRatio = goals.length > 0 ? goals.filter((goal) => goal.completed).length / goals.length : 0;
  const momentumScore = clamp(
    Math.round(
      34 +
        Math.min(stats.productive / 4, 26) +
        Math.min(todayTasks.length * 7, 18) +
        goalCompletionRatio * 22 +
        (integrationConnected ? 8 : 0) +
        (completedBlocks > 0 ? 6 : 0) -
        (stats.distraction > stats.productive ? 14 : 0) -
        ((latestStress?.stressLevel ?? 0) >= 7 ? 10 : 0)
    ),
    18,
    97
  );

  const operatingNarrative = useMemo(() => {
    if (!priorityGoal && todayTasks.length === 0) {
      return 'Your system is under-defined right now. Set one real outcome and protect one block so the app has something meaningful to optimize.';
    }

    if ((latestStress?.stressLevel ?? 0) >= 7) {
      return 'Your system is signaling overload. Simplify the day, protect one meaningful win, and avoid expanding the task list.';
    }

    if (nextBlock) {
      return `Your next scheduled commitment is ${nextBlock.title} at ${formatTime(new Date(nextBlock.startTime))}. Protect the run-up and reduce context switching before it starts.`;
    }

    if (priorityGoal) {
      return `Your highest-leverage objective is ${priorityGoal.title}. The fastest way to increase momentum is to turn it into a concrete block on today’s calendar.`;
    }

    return 'You have signal, but the loop is still loose. Convert your strongest intent into a scheduled block and measure the day against that.';
  }, [latestStress?.stressLevel, nextBlock, priorityGoal, todayTasks.length]);

  const actions = useMemo<ActionCard[]>(() => {
    const nextActions: ActionCard[] = [];

    if (!priorityGoal) {
      nextActions.push({
        id: 'goal',
        title: 'Define the main outcome',
        description: 'One concrete goal gives every other module a target to optimize around.',
        label: 'Create goal',
        tone: 'blue',
        action: () => onOpenGoalComposer?.(),
      });
    }

    if (todayTasks.length === 0) {
      nextActions.push({
        id: 'calendar',
        title: 'Protect a focus block',
        description: 'No scheduled work means the day will be driven by interruptions instead of intent.',
        label: 'Open calendar',
        tone: 'amber',
        action: () => onNavigate?.('calendar'),
      });
    }

    if (!integrationConnected) {
      nextActions.push({
        id: 'integrations',
        title: 'Connect a live signal',
        description: 'Wearable or workflow data reduces manual input and makes insights worth trusting.',
        label: 'Open integrations',
        tone: 'emerald',
        action: () => onNavigate?.('integrations'),
      });
    }

    if ((latestStress?.stressLevel ?? 0) >= 7) {
      nextActions.push({
        id: 'analytics',
        title: 'Reduce overload before adding work',
        description: 'Your recent stress trend is elevated. Review signals and adjust the plan before stacking more commitments.',
        label: 'Open analytics',
        tone: 'amber',
        action: () => onNavigate?.('analytics'),
      });
    }

    if (nextActions.length === 0) {
      nextActions.push({
        id: 'tighten',
        title: 'Tighten the operating loop',
        description: 'You already have signal. Use analytics to review what is compounding and what is leaking attention.',
        label: 'Review insights',
        tone: 'blue',
        action: () => onNavigate?.('analytics'),
      });
    }

    return nextActions.slice(0, 3);
  }, [integrationConnected, latestStress?.stressLevel, onNavigate, onOpenGoalComposer, priorityGoal, todayTasks.length]);

  useEffect(() => {
    const saved = storage.getDailyBrief(todayKey);

    if (saved) {
      setTopPriority(saved.topPriority);
      setMustWin(saved.mustWin);
      setShutdownNote(saved.shutdownNote);
      setSavedAt(saved.updatedAt);
      return;
    }

    setTopPriority(priorityGoal?.title ?? '');
    setMustWin(nextBlock ? `Protect ${nextBlock.title} at ${formatTime(new Date(nextBlock.startTime))}` : '');
    setShutdownNote('');
    setSavedAt(null);
  }, [todayKey, priorityGoal, nextBlock]);

  const handleSave = () => {
    const nextSavedAt = new Date().toISOString();
    storage.saveDailyBrief({
      date: todayKey,
      topPriority: topPriority.trim(),
      mustWin: mustWin.trim(),
      shutdownNote: shutdownNote.trim(),
      updatedAt: nextSavedAt,
    });
    setSavedAt(nextSavedAt);
  };

  const priorityGoalProgress = priorityGoal
    ? Math.min(100, Math.round((priorityGoal.current / Math.max(priorityGoal.target, 1)) * 100))
    : 0;

  const healthRiskLabel = (latestStress?.stressLevel ?? 0) >= 7
    ? 'High strain'
    : (latestStress?.stressLevel ?? 0) >= 4
      ? 'Watch load'
      : 'Stable';

  return (
    <Card className="overflow-hidden p-0" hover={false}>
      <div className="relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(135deg,rgba(79,158,248,0.14),rgba(38,66,119,0.16),rgba(8,12,24,0.98))] p-6 text-white sm:p-7">
        <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.18),transparent_68%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Daily operating brief
            </div>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-black tracking-tight sm:text-[2.25rem]">One place to decide the day.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  {operatingNarrative}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-w-[148px] rounded-[1.5rem] border border-white/12 bg-white/8 px-5 py-4 text-center backdrop-blur-xl"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Momentum</p>
                <p className="mt-3 text-5xl font-black">{momentumScore}</p>
                <p className="mt-2 text-xs text-white/60">Out of 100 system health</p>
              </motion.div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">Productive time</p>
                <p className="mt-3 text-2xl font-bold">{stats.productive}m</p>
                <p className="mt-1 text-xs text-white/60">Focus captured today</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">Scheduled blocks</p>
                <p className="mt-3 text-2xl font-bold">{todayTasks.length}</p>
                <p className="mt-1 text-xs text-white/60">{completedBlocks} completed so far</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">Signal coverage</p>
                <p className="mt-3 text-2xl font-bold">{integrationConnected ? 'Live' : 'Manual'}</p>
                <p className="mt-1 text-xs text-white/60">{integrationConnected ? 'Integrations connected' : 'Connect passive data'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">Health risk</p>
                <p className="mt-3 text-2xl font-bold">{healthRiskLabel}</p>
                <p className="mt-1 text-xs text-white/60">Latest stress: {latestStress?.stressLevel ?? 'n/a'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`rounded-2xl border p-4 text-left transition-transform hover:-translate-y-0.5 ${actionToneClasses[action.tone]}`}
                >
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{action.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                    {action.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-[#08111f]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/50">Plan the day</p>
                <h3 className="mt-2 text-xl font-bold">Daily brief</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSave}
                icon={<Save className="h-4 w-4" />}
                className="border-white/12 bg-white/8 text-white hover:bg-white/12"
              >
                Save brief
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Top priority</label>
                <input
                  value={topPriority}
                  onChange={(event) => setTopPriority(event.target.value)}
                  placeholder="What must move today?"
                  className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#7EA4D1] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Must-win condition</label>
                <textarea
                  value={mustWin}
                  onChange={(event) => setMustWin(event.target.value)}
                  placeholder="Define what makes the day successful."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#7EA4D1] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Shutdown note</label>
                <textarea
                  value={shutdownNote}
                  onChange={(event) => setShutdownNote(event.target.value)}
                  placeholder="What should future-you remember when the day ends?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#7EA4D1] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Target className="h-4 w-4 text-[#7EA4D1]" />
                  Goal in play
                </div>
                <p className="mt-3 text-sm text-white/85">
                  {priorityGoal ? priorityGoal.title : 'No active goal yet.'}
                </p>
                <p className="mt-2 text-xs text-white/55">
                  {priorityGoal
                    ? `${priorityGoalProgress}% complete${priorityGoal.deadline ? `, due ${new Date(priorityGoal.deadline).toLocaleDateString()}` : ''}`
                    : 'Create one measurable target to tighten the system.'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CalendarRange className="h-4 w-4 text-[#8BE9CB]" />
                  Next block
                </div>
                <p className="mt-3 text-sm text-white/85">
                  {nextBlock ? nextBlock.title : 'No block scheduled.'}
                </p>
                <p className="mt-2 text-xs text-white/55">
                  {nextBlock
                    ? `${formatTime(new Date(nextBlock.startTime))} to ${formatTime(new Date(nextBlock.endTime))}`
                    : 'Put your highest-value work on the calendar.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <TrendingUp className="h-3.5 w-3.5" />
                {stats.distraction > stats.productive ? 'Attention is leaking today' : 'Attention trend is healthy'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Link2 className="h-3.5 w-3.5" />
                {integrationConnected ? 'Passive signals active' : 'Manual-only mode'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                {(savedAt ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />)}
                {savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Brief not saved yet'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DailyOperatingBrief;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BarChart3, CalendarDays, Link2, Sparkles, Target, Wand2, X } from 'lucide-react';

type AppView = 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'integrations' | 'settings';

/**
 * Onboarding Modal for First-Time Users
 * Guides users through key features and tips
 */
export const OnboardingModal: React.FC<{ onComplete?: () => void; onNavigate?: (view: AppView) => void }> = ({ onComplete, onNavigate }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(() => {
    // Check localStorage to see if user disabled onboarding
    const neverShow = localStorage.getItem('onboarding_never_show');
    if (neverShow === 'true') return false;
    // Show if not completed
    return !localStorage.getItem('onboarding_completed');
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      title: 'Welcome to your time system',
      description: 'RectoTime is strongest when planning, focus, health signals, and analytics all work together instead of living in separate tabs.',
      icon: <Sparkles className="w-16 h-16 text-sky-400" />,
      accent: 'from-sky-500 to-indigo-500',
      tips: ['Use the dashboard as your command center', 'Let time blocks and goals reinforce each other', 'Treat onboarding like system setup, not a tutorial'],
    },
    {
      title: 'Connect live inputs',
      description: 'Integrations turn RectoTime into a feedback loop. Start with wearables and health apps, then expand as more providers come online.',
      icon: <Link2 className="w-16 h-16 text-emerald-400" />,
      accent: 'from-emerald-500 to-teal-500',
      tips: [
        'Open Integrations to connect Strava or Terra',
        'Use passive data to reduce manual daily input',
        'Sync-first workflows make stress predictions much more useful',
      ],
      ctaLabel: 'Open integrations',
      destination: 'integrations' as AppView,
    },
    {
      title: 'Create your first goal',
      description: 'Goals give the system something concrete to organize around. Start small, then let momentum compound.',
      icon: <Target className="w-16 h-16 text-amber-400" />,
      accent: 'from-amber-500 to-orange-500',
      tips: [
        'Use one measurable goal first',
        'Keep the target simple enough to complete this week',
        'The dashboard command center can open goal creation for you',
      ],
      ctaLabel: 'Go to dashboard',
      destination: 'dashboard' as AppView,
    },
    {
      title: 'Map the week visually',
      description: 'Use the calendar and timetable to turn ambition into visible blocks of time. The system becomes much clearer when your week is explicit.',
      icon: <CalendarDays className="w-16 h-16 text-purple-400" />,
      accent: 'from-fuchsia-500 to-violet-500',
      tips: [
        'Use the week view to place deep-work blocks first',
        'Timetable is ideal for predictable routines',
        'A visible schedule makes stress signals easier to interpret',
      ],
      ctaLabel: 'Open calendar',
      destination: 'calendar' as AppView,
    },
    {
      title: 'Close the loop with analytics',
      description: 'Productivity becomes durable when you can measure what the system sees and how your actions change it over time.',
      icon: <BarChart3 className="w-16 h-16 text-rose-400" />,
      accent: 'from-rose-500 to-pink-500',
      tips: [
        'Analytics shows whether actions are actually working',
        'ML Insights turns raw data into next steps',
        'Use the Midnight theme if you prefer a deeper focus atmosphere',
      ],
      ctaLabel: 'View analytics',
      destination: 'analytics' as AppView,
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    if (dontShowAgain) {
      localStorage.setItem('onboarding_never_show', 'true');
    }
    setIsVisible(false);
    onComplete?.();
  };

  const handleClose = () => {
    handleComplete();
  };

  const handleGoToStepDestination = () => {
    const destination = currentStep.destination;
    if (destination && onNavigate) {
      onNavigate(destination);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-panel relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] shadow-2xl"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className={`relative overflow-hidden rounded-t-[2rem] bg-gradient-to-r ${currentStep.accent} p-8 text-white`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_32%)]" />
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-xl p-2 transition-colors hover:bg-white/20"
              aria-label="Close onboarding"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative">
              <div className="mb-4 flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all ${index <= step ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>

              <p className="text-sm font-medium text-white/80">Step {step + 1} of {steps.length}</p>
              <div className="mt-6 flex items-start gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/15 backdrop-blur-sm">
                  {currentStep.icon}
                </div>
                <div className="max-w-xl">
                  <h2 className="text-3xl font-black leading-tight">{currentStep.title}</h2>
                  <p className="mt-3 text-base leading-7 text-white/85">{currentStep.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Wand2 className="h-4 w-4 text-[#4F9EF8]" />
                Recommended moves
              </div>
              <div className="space-y-3">
                {currentStep.tips.map((tip, index) => (
                  <div key={index} className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#4F9EF8]" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-medium text-[var(--text-primary)] transition-colors hover:bg-white/5"
                >
                  Back
                </button>
              )}
              {currentStep.destination && onNavigate && (
                <button
                  onClick={handleGoToStepDestination}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-[var(--text-primary)] transition-colors hover:bg-white/10"
                >
                  {currentStep.ctaLabel}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600"
              >
                {step === steps.length - 1 ? 'Enter dashboard' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>Don’t show this again</span>
              </label>
              <button
                onClick={handleClose}
                className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Skip setup
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;

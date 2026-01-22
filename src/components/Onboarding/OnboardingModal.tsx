import React, { useState } from 'react';
import { ChevronRight, Target, Clock, Zap, BarChart3, X } from 'lucide-react';

/**
 * Onboarding Modal for First-Time Users
 * Guides users through key features and tips
 */
export const OnboardingModal: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
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
      title: 'Welcome to Productivity OS',
      description: 'Your AI-powered dashboard to track goals, manage time, and maximize focus.',
      icon: <Target className="w-16 h-16 text-blue-500" />,
      tips: ['Set meaningful goals', 'Track your time', 'Get AI insights'],
    },
    {
      title: 'Set & Track Goals',
      description: 'Add your daily, weekly, or monthly goals. Log progress as you complete tasks.',
      icon: <Target className="w-16 h-16 text-green-500" />,
      tips: [
        'Click "Add Goal" to create a new objective',
        'Use the + button to log daily progress',
        'Categories: LeetCode, Applications, Learning, Other',
      ],
    },
    {
      title: 'Use Study Timers',
      description: 'Choose from Pomodoro (25min), Short Break (5min), or custom timers.',
      icon: <Clock className="w-16 h-16 text-orange-500" />,
      tips: [
        'Pomodoro technique: 25 min focus + 5 min break',
        'Set custom durations for your workflow',
        'Get notifications when timer completes',
      ],
    },
    {
      title: 'Monitor Analytics',
      description: 'Track your productivity patterns and focus score over time.',
      icon: <BarChart3 className="w-16 h-16 text-purple-500" />,
      tips: [
        'View today\'s productive time',
        'Track total activities',
        'Monitor focus score trends',
      ],
    },
    {
      title: 'AI Companion',
      description: 'Get personalized nudges, suggestions, and encouragement from your AI assistant.',
      icon: <Zap className="w-16 h-16 text-yellow-500" />,
      tips: [
        'Collapse/expand the AI panel anytime',
        'Receive contextual productivity tips',
        'Get real-time focus recommendations',
      ],
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-background-darkSecondary rounded-2xl max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step Progress */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= step
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-medium opacity-90">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {currentStep.icon}
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-center mb-3 text-primary-dark dark:text-white">
            {currentStep.title}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            {currentStep.description}
          </p>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2">
              💡 Key Tips:
            </h3>
            <ul className="space-y-2">
              {currentStep.tips.map((tip, index) => (
                <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                  <span className="flex-shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-primary-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip Tour & Don't Show Again */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span>Don't show this again</span>
            </label>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-medium"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartPulse,
  Layers3,
  LineChart,
  Link2,
  Shield,
  Sparkles,
  TimerReset,
  Workflow,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { StaggeredContainer, StaggeredItem } from '../components/ui/AnimatedPage';

interface StarDot {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const buildStarLayer = (count: number, seed: number): StarDot[] => {
  return Array.from({ length: count }, (_, index) => {
    const n = (index + 1) * (seed * 0.137);
    const fract = (value: number) => value - Math.floor(value);

    return {
      x: fract(Math.sin(n * 12.9898) * 43758.5453) * 100,
      y: fract(Math.cos(n * 78.233) * 24634.6345) * 100,
      size: 1 + fract(Math.sin(n * 32.17) * 9345.23) * 2.1,
      opacity: 0.25 + fract(Math.cos(n * 18.13) * 2712.91) * 0.55,
    };
  });
};

const STAR_LAYERS = [
  { speed: 0.012, stars: buildStarLayer(38, 1.17) },
  { speed: 0.022, stars: buildStarLayer(30, 2.43) },
  { speed: 0.034, stars: buildStarLayer(22, 3.61) },
];

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

interface ProductSnapshot {
  product: {
    name: string;
    tagline: string;
    version: string;
    generated_at: string;
  };
  system: {
    api_status: string;
    models_loaded: {
      productivity: boolean;
      stress: boolean;
    };
    analytics_events: number;
  };
  integrations: {
    providers_total: number;
    providers_configured: number;
    providers: Record<string, { name: string; description: string; configured: boolean }>;
  };
  growth: {
    analytics_30d: {
      prediction_viewed: number;
      action_viewed: number;
      action_completed: number;
      trial_started: number;
    };
    focus_loops: Array<{
      title: string;
      description: string;
    }>;
  };
}

const fallbackSnapshot: ProductSnapshot = {
  product: {
    name: 'RectoTime',
    tagline: 'A time-aware operating system for focused work',
    version: '1.1',
    generated_at: new Date().toISOString(),
  },
  system: {
    api_status: 'offline',
    models_loaded: {
      productivity: true,
      stress: true,
    },
    analytics_events: 0,
  },
  integrations: {
    providers_total: 5,
    providers_configured: 1,
    providers: {
      strava: { name: 'Strava', description: 'Running and activity data', configured: true },
      fitbit: { name: 'Fitbit', description: 'Heart rate, sleep and steps', configured: false },
      garmin: { name: 'Garmin Connect', description: 'HRV and recovery signals', configured: false },
      oura: { name: 'Oura Ring', description: 'Readiness and sleep quality', configured: false },
      terra: { name: 'Terra', description: 'Samsung Health, Apple Health and more', configured: false },
    },
  },
  growth: {
    analytics_30d: {
      prediction_viewed: 0,
      action_viewed: 0,
      action_completed: 0,
      trial_started: 0,
    },
    focus_loops: [
      { title: 'Sense', description: 'Capture time, health, and workflow signals automatically.' },
      { title: 'Decide', description: 'Use ML to prioritize what matters and when to do it.' },
      { title: 'Protect', description: 'Reduce burnout by pacing your workload intelligently.' },
    ],
  },
};

const productPillars = [
  {
    icon: Workflow,
    title: 'One operating system for your day',
    description: 'Calendar, goals, stress signals, focus sessions, and third-party integrations work as one loop instead of separate tabs.',
  },
  {
    icon: Brain,
    title: 'ML that acts, not just reports',
    description: 'RectoTime turns predictions into next actions, recovery recommendations, and a clearer work cadence.',
  },
  {
    icon: HeartPulse,
    title: 'Passive signal collection',
    description: 'Wearables and health apps reduce manual entry so the product stays useful every day, not just once a week.',
  },
];

const proofCards = [
  {
    icon: CalendarDays,
    label: 'Adaptive planning',
    value: 'Live',
    description: 'Calendar, timetable, and goals share the same decision surface.',
  },
  {
    icon: TimerReset,
    label: 'Focus rhythm',
    value: 'Built-in',
    description: 'The interface pushes users toward repeatable deep-work loops instead of a cluttered dashboard.',
  },
  {
    icon: Shield,
    label: 'Burnout protection',
    value: 'Stress-aware',
    description: 'Recovery guidance sits next to performance metrics, not buried in settings.',
  },
];

const motionHighlights = [
  'Theme switching with a live tri-mode system: Light, Dark, Midnight',
  'Staggered card choreography instead of static sections',
  'Interaction layers tuned for depth, hover lift, and smoother transitions',
];

const logoStrip = [
  { name: 'GitHub', slug: 'github', color: 'FFFFFF', fallback: 'GH' },
  { name: 'Strava', slug: 'strava', color: 'FC4C02', fallback: 'ST' },
  { name: 'Fitbit', slug: 'fitbit', color: '00B0B9', fallback: 'FB' },
  { name: 'Garmin', slug: 'garmin', color: '00A8E0', fallback: 'GA' },
  { name: 'Oura', slug: 'ouraring', color: 'FFFFFF', fallback: 'OU' },
  { name: 'Terra', slug: 'tera', color: '9FE870', fallback: 'TR' },
  { name: 'Google Calendar', slug: 'googlecalendar', color: '4285F4', fallback: 'GC' },
  { name: 'Apple Health', slug: 'apple', color: 'FFFFFF', fallback: 'AH' },
  { name: 'Notion', slug: 'notion', color: 'FFFFFF', fallback: 'NO' },
  { name: 'Slack', slug: 'slack', color: '4A154B', fallback: 'SL' },
];

const storySteps = [
  {
    icon: Activity,
    eyebrow: '01 Signal Capture',
    title: 'Your day becomes observable',
    description: 'Wearable, calendar, and app behavior signals are fused so the model sees reality, not just what users manually enter.',
    accent: 'from-[#57B0E6] to-[#7EA4D1]',
  },
  {
    icon: Brain,
    eyebrow: '02 Decision Layer',
    title: 'The system recommends timing, not just tasks',
    description: 'ML adapts focus windows and effort pacing around stress and momentum, so planning reflects cognitive state.',
    accent: 'from-[#7EA4D1] to-[#5E7694]',
  },
  {
    icon: Shield,
    eyebrow: '03 Protection Loop',
    title: 'Performance improves without burnout debt',
    description: 'Recovery cues and friction alerts keep users in a sustainable cadence instead of sprint-crash cycles.',
    accent: 'from-[#E8B26C] to-[#DA8A4A]',
  },
];

const clockEssencePanels = [
  {
    title: 'Chronometric Clarity',
    subtitle: 'Every second, rendered with intent',
    description: 'A visual timing engine that stays readable under pressure, in meetings, and during deep work windows.',
  },
  {
    title: 'Adaptive Time Core',
    subtitle: 'Your pace responds to context',
    description: 'Scroll, focus state, and workload dynamics feed a single timeline so the interface feels alive, not static.',
  },
  {
    title: 'Frictionless Control',
    subtitle: 'Precision without complexity',
    description: 'Direct interactions shape time behavior instantly with no modal clutter or hidden control surfaces.',
  },
];

const editionModules = [
  'Agentic',
  'Online',
  'Retail',
  'Marketing',
  'Checkout',
  'Operations',
  'Finance',
  'Shipping',
  'Developer',
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 38, damping: 18, mass: 1.1 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.55]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.97]);
  const pipelineX = useTransform(scrollYProgress, [0.2, 0.8], [-40, 40]);
  const narrativeY = useTransform(scrollYProgress, [0.35, 0.9], [20, -40]);
  const narrativeRotate = useTransform(scrollYProgress, [0.3, 0.9], [-5, 5]);
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const springX = useSpring(magnetX, { stiffness: 280, damping: 20, mass: 0.3 });
  const springY = useSpring(magnetY, { stiffness: 280, damping: 20, mass: 0.3 });

  const [snapshot, setSnapshot] = useState<ProductSnapshot>(fallbackSnapshot);
  const [liveTick, setLiveTick] = useState(0);
  const [clockMinutes, setClockMinutes] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/product/snapshot`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Snapshot unavailable');
        }
        const data = (await response.json()) as ProductSnapshot;
        setSnapshot(data);
      })
      .catch(() => {
        setSnapshot(fallbackSnapshot);
      });
  }, []);

  useEffect(() => {
    const previousTheme = document.documentElement.getAttribute('data-theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', 'midnight');

    return () => {
      document.documentElement.setAttribute('data-theme', previousTheme);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveTick((value) => (value + 1) % 1000);
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = smoothScrollProgress.on('change', (progress) => {
      // Scroll down advances clock time; scroll up reverses naturally.
      setClockMinutes(progress * 720);
    });

    return () => unsubscribe();
  }, [smoothScrollProgress]);

  const configuredProviders = snapshot.integrations.providers_configured;
  const configuredProviderNames = useMemo(
    () => Object.values(snapshot.integrations.providers).filter((provider) => provider.configured).map((provider) => provider.name),
    [snapshot.integrations.providers]
  );

  const heroStats = [
    {
      label: 'Providers wired',
      value: `${configuredProviders}/${snapshot.integrations.providers_total}`,
      icon: Link2,
    },
    {
      label: 'Prediction views (30d)',
      value: `${snapshot.growth.analytics_30d.prediction_viewed}`,
      icon: LineChart,
    },
    {
      label: 'API status',
      value: snapshot.system.api_status,
      icon: Zap,
    },
  ];

  // Continuous angles avoid wrap-around jumps (e.g. 359deg -> 0deg) that cause visible glitches.
  const minuteHandRotation = clockMinutes * 6;
  const hourHandRotation = clockMinutes * 0.5;
  const syncClockLabel = `${String(Math.floor((clockMinutes % 720) / 60) || 12).padStart(2, '0')}:${String(Math.floor(clockMinutes % 60)).padStart(2, '0')}`;

  const onMagnetMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - rect.left - rect.width / 2;
    const relativeY = event.clientY - rect.top - rect.height / 2;
    magnetX.set(relativeX * 0.22);
    magnetY.set(relativeY * 0.22);
  };

  const onMagnetLeave = () => {
    magnetX.set(0);
    magnetY.set(0);
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    setPointer({ x, y });
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]" onMouseMove={handlePointerMove}>
      <div className="space-starfield" aria-hidden="true">
        {STAR_LAYERS.map((layer, layerIndex) => (
          <div
            key={layerIndex}
            className="space-star-layer"
            style={{
              transform: `translate3d(${pointer.x * -18 * layer.speed * 100}px, ${pointer.y * -18 * layer.speed * 100}px, 0)`,
            }}
          >
            {layer.stars.map((star, starIndex) => (
              <span
                key={`${layerIndex}-${starIndex}`}
                className="space-star"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDelay: `${(starIndex % 12) * 0.22}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="clock-background" aria-hidden="true">
        <div className="clock-bg-face">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="clock-bg-marker"
              style={{ transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-45vmin)` }}
            />
          ))}
          <div
            className="clock-bg-hand clock-bg-hour"
            style={{ transform: `translate(-50%, -100%) rotate(${hourHandRotation}deg)` }}
          />
          <div
            className="clock-bg-hand clock-bg-minute"
            style={{ transform: `translate(-50%, -100%) rotate(${minuteHandRotation}deg)` }}
          />
          <div className="clock-bg-center" />
        </div>
      </div>

      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-[#57B0E6] via-[#7EA4D1] to-[#DA8A4A]"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="aurora-bg fixed inset-x-0 top-0 h-[28rem] opacity-90" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[color:var(--bg-primary)]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-6 py-4 md:px-10">
          <Logo size="md" onClick={() => navigate('/')} />
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B111B]/85 px-4 py-2 text-xs text-[#B7C8DF] backdrop-blur-xl">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 font-semibold uppercase tracking-[0.08em] text-emerald-300">
              Synced
            </span>
            <div className="hidden items-end gap-1 sm:flex" aria-hidden="true">
              {[0, 1, 2, 3].map((bar) => (
                <motion.span
                  key={bar}
                  className="w-1 rounded-full bg-[#57B0E6]"
                  animate={{ height: [4, 11 + bar, 5] }}
                  transition={{ duration: 1.15, repeat: Infinity, delay: bar * 0.12, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <span className="font-medium tracking-[0.06em] text-[#DCE7F8]">NODE.MIDNIGHT</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[11px] tracking-[0.04em] text-[#9BC7FF]">
              {syncClockLabel}
            </span>
          </div>
        </div>
      </header>

      <main>
        <motion.section
          className="relative mx-auto grid min-h-[88vh] w-full max-w-[1360px] items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-24"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <div className="relative z-10">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-xl"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Sparkles className="h-4 w-4 text-accent-blue" />
              RectoTime Editions | Midnight Release
            </motion.div>

            <motion.h1
              className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              Time without drift.
              <span className="block bg-gradient-to-r from-[var(--text-primary)] via-[#57B0E6] to-[#9CB5CF] bg-clip-text text-transparent">
                Rhythm without friction.
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              RectoTime brings scheduling, energy, and focus signals into a single chronometric surface.
              The result feels like a product instrument, not a dashboard template.
            </motion.p>

            <motion.div
              className="edition-module-strip mt-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
            >
              {editionModules.map((module) => (
                <span key={module} className="edition-module-chip">
                  {module}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
            >
              <Button variant="accent" size="lg" onClick={() => navigate('/signup')} className="min-w-[220px]">
                Start the system
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/login')}
                className="min-w-[220px] border border-white/20 bg-[#0F172A]/88 text-[#DCE7F8] hover:bg-[#17233A]"
              >
                Open workspace
              </Button>
            </motion.div>

            <motion.div
              className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
            >
              {heroStats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-panel hover-lift rounded-2xl px-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                    <Icon className="h-4 w-4 text-accent-blue" />
                  </div>
                  <p className="mt-4 text-2xl font-bold capitalize text-[var(--text-primary)]">{value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,158,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.12),transparent_35%)]" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Chrono Surface</p>
                    <h2 className="mt-2 text-2xl font-bold">Live timing intelligence</h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {snapshot.system.api_status}
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Clock3 className="h-4 w-4 text-[#57B0E6]" />
                        Work rhythm
                      </div>
                      <p className="mt-4 text-3xl font-black">50 / 10</p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">Default loop tuned for focused blocks with recovery built in.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Brain className="h-4 w-4 text-[#7EA4D1]" />
                        ML stack
                      </div>
                      <p className="mt-4 text-3xl font-black">
                        {snapshot.system.models_loaded.productivity && snapshot.system.models_loaded.stress ? '2 models' : 'Partial'}
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">Productivity and stress intelligence available to guide planning decisions.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Connected surfaces</p>
                        <h3 className="mt-1 text-lg font-semibold">Integration readiness</h3>
                      </div>
                      <Layers3 className="h-5 w-5 text-[#57B0E6]" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(configuredProviderNames.length > 0 ? configuredProviderNames : ['Strava ready', 'More connectors available']).map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)]">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#57B0E6] to-[#9CB5CF]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(12, (configuredProviders / Math.max(snapshot.integrations.providers_total, 1)) * 100)}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <section className="w-full py-14">
          <div className="clock-essence-shell mx-auto w-full max-w-[1360px] rounded-[2rem] border border-white/10 p-6 sm:p-8 md:px-10">
            <div className="mb-8 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">A Product Story In Time</p>
              <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Crafted for people who measure moments, not just tasks.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {clockEssencePanels.map((panel, index) => (
                <motion.article
                  key={panel.title}
                  className="clock-essence-card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">0{index + 1}</p>
                  <h3 className="mt-3 text-2xl font-bold">{panel.title}</h3>
                  <p className="mt-3 text-sm font-semibold text-[#9bc7ff]">{panel.subtitle}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{panel.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full pb-6">
          <div className="logo-marquee-shell mx-auto w-full max-w-[1360px] rounded-[1.75rem] border border-white/10 px-4 py-4 md:px-8">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Connected ecosystem in motion
            </p>
            <div className="logo-marquee">
              <div className="logo-track">
                {[...logoStrip, ...logoStrip].map((logo, index) => (
                  <span key={`${logo.name}-${index}`} className="logo-chip">
                    <span className="logo-mark" aria-hidden="true">
                      <img
                        src={`https://cdn.simpleicons.org/${logo.slug}/${logo.color}`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="logo-fallback">{logo.fallback}</span>
                    </span>
                    {logo.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="logo-marquee mt-3 reverse">
              <div className="logo-track">
                {[...logoStrip.slice().reverse(), ...logoStrip.slice().reverse()].map((logo, index) => (
                  <span key={`${logo.name}-reverse-${index}`} className="logo-chip">
                    <span className="logo-mark" aria-hidden="true">
                      <img
                        src={`https://cdn.simpleicons.org/${logo.slug}/${logo.color}`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="logo-fallback">{logo.fallback}</span>
                    </span>
                    {logo.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-10">
          <StaggeredContainer className="mx-auto grid w-full max-w-[1360px] gap-5 px-6 md:px-10 lg:grid-cols-3">
            {productPillars.map(({ icon: Icon, title, description }) => (
              <StaggeredItem key={title} className="h-full">
                <div className="glass-panel hover-lift h-full rounded-[1.75rem] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#57B0E6]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">{description}</p>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredContainer>
        </section>

        <section className="w-full py-8">
          <motion.div
            className="genz-pro-stage relative mx-auto w-full max-w-[1360px] overflow-hidden rounded-[2rem] border border-white/10 p-6 sm:p-8 md:px-10"
            style={{ x: pipelineX }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,194,255,0.14),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(0,229,155,0.11),transparent_40%)]" />
            <div className="relative grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Visual language</p>
                <h3 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  Professional signal. Gen Z energy.
                </h3>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
                  Sharp data blocks, kinetic gradients, and scroll-linked graphics keep this interface alive while still credible for serious work.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {['Signal', 'Flow', 'Recovery', 'Momentum'].map((tag, index) => (
                  <motion.div
                    key={tag}
                    className="neo-tag"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-90px' }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                  >
                    {tag}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto w-full max-w-[1360px] px-6 py-16 md:px-10">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Why this feels different</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Designed like a product system, not a landing page template.</h2>
            <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
              The frontend now centers around motion, layered surfaces, and a live backend snapshot so the brand promise matches the actual platform.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-solid rounded-[2rem] p-6 shadow-xl">
              <div className="grid gap-4 md:grid-cols-3">
                {proofCards.map(({ icon: Icon, label, value, description }) => (
                  <motion.div
                    key={label}
                    className="rounded-[1.5rem] border border-white/10 bg-[#0F172A]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  >
                    <Icon className="h-5 w-5 text-[#57B0E6]" />
                    <p className="mt-5 text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-bordered rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Motion system</p>
                  <h3 className="mt-2 text-2xl font-bold">Interaction language</h3>
                </div>
                <Workflow className="h-6 w-6 text-[#7EA4D1]" />
              </div>
              <div className="mt-6 space-y-4">
                {motionHighlights.map((item) => (
                  <motion.div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  >
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#57B0E6]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1360px] px-6 py-16 md:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Live backend feed</p>
              <h3 className="mt-3 text-3xl font-black">Product snapshot</h3>
              <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
                This page is backed by a dedicated API endpoint, so visitors see real platform readiness instead of decorative marketing numbers.
              </p>
              <div className="mt-8 space-y-3">
                {snapshot.growth.focus_loops.map((loop, index) => (
                  <motion.div
                    key={loop.title}
                    className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-4"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-[#57B0E6]">0{index + 1}</span>
                      <div>
                        <p className="font-semibold">{loop.title}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{loop.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-solid rounded-[2rem] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Operational proof</p>
                  <h3 className="mt-2 text-3xl font-black">What the system knows today</h3>
                </div>
                <LineChart className="h-6 w-6 text-[#57B0E6]" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0F172A]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-sm text-[var(--text-secondary)]">Action views</p>
                  <p className="mt-3 text-4xl font-black">{snapshot.growth.analytics_30d.action_viewed}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0F172A]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-sm text-[var(--text-secondary)]">Actions completed</p>
                  <p className="mt-3 text-4xl font-black">{snapshot.growth.analytics_30d.action_completed}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0F172A]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:col-span-2">
                  <p className="text-sm text-[var(--text-secondary)]">Configured integrations</p>
                  <p className="mt-3 text-4xl font-black">{configuredProviders}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    Current providers available: {configuredProviderNames.length > 0 ? configuredProviderNames.join(', ') : 'No providers configured yet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1360px] px-6 py-20 md:px-10">
          <div className="mb-10 max-w-4xl">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">Signature scroll sequence</p>
            <h2 className="font-display mt-3 text-4xl font-black leading-[0.95] sm:text-6xl">
              A living product narrative,
              <span className="block bg-gradient-to-r from-[#00C2FF] via-[#00E59B] to-[#FF8A00] bg-clip-text text-transparent">
                not a static hero banner.
              </span>
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              className="story-grid-bg sticky top-24 h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 p-6"
              style={{ y: narrativeY, rotate: narrativeRotate }}
            >
              <div className="orbital-stage">
                <div className="orbital-ring ring-one" />
                <div className="orbital-ring ring-two" />
                <div className="orbital-ring ring-three" />

                <motion.div
                  className="orbital-node node-a"
                  animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Signal
                </motion.div>
                <motion.div
                  className="orbital-node node-b"
                  animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
                  transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Model
                </motion.div>
                <motion.div
                  className="orbital-node node-c"
                  animate={{ y: [0, -8, 0], x: [0, -6, 0] }}
                  transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Action
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
                    <div className="flex h-full items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(0,194,255,0.32),rgba(0,229,155,0.28))] text-sm font-black uppercase tracking-[0.12em] text-white">
                      RectoTime
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {storySteps.map(({ icon: Icon, eyebrow, title, description, accent }, index) => (
                <motion.article
                  key={title}
                  className="glass-panel rounded-[1.5rem] border border-white/10 p-6"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{eyebrow}</p>
                      <h3 className="mt-2 text-2xl font-black leading-tight">{title}</h3>
                      <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">{description}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1360px] px-6 py-20 md:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="preview-shell rounded-[2rem] border border-white/10 p-5 sm:p-6">
              <div className="preview-head mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Live preview</p>
                  <h3 className="mt-2 text-2xl font-black">Adaptive cockpit</h3>
                </div>
                <span className="preview-live-badge">Live</span>
              </div>

              <div className="preview-window rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>

                <div className="space-y-3">
                  {[62, 78, 84].map((base, index) => (
                    <div key={base} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>Signal lane {index + 1}</span>
                        <span>{Math.min(99, base + (liveTick % 7))}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#00C2FF] via-[#00E59B] to-[#FF8A00]"
                          animate={{ width: `${Math.min(99, base + (liveTick % 7))}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] border border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Kinetic trust layer</p>
              <h3 className="mt-3 text-3xl font-black leading-tight">Motion that communicates state, not decoration.</h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
                Progress rails, pinned chapters, and live micro-metrics create a tactile product signal users can feel while scrolling.
              </p>
              <div className="mt-6 space-y-3">
                {['Real-time rhythm score', 'Friction alerts', 'Recovery recommendation pulse'].map((item, index) => (
                  <motion.div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.3, delay: index * 0.07 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20">
          <div className="mx-auto w-full max-w-[1360px] rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(79,158,248,0.20),rgba(167,139,250,0.16),rgba(10,15,30,0.88))] p-8 shadow-2xl sm:p-12 md:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/70">Distinct direction</p>
                <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  Similar ambition, different category.
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/80">
                  This is not a clone of another study site. It now positions RectoTime as a more technical,
                  more adaptive, and more integrated platform built around time intelligence.
                </p>
              </div>
              <motion.div
                className="magnetic-cta-wrapper"
                onMouseMove={onMagnetMove}
                onMouseLeave={onMagnetLeave}
                style={{ x: springX, y: springY }}
              >
                <Button variant="secondary" size="lg" onClick={() => navigate('/signup')} className="whitespace-nowrap bg-white text-primary-dark">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

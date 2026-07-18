import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  HeartPulse,
  Lock,
  Mail,
  Rocket,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const onboardingPromises = [
  'Start with planning, focus, and ML insights in one place.',
  'Connect integrations as your workflow matures.',
  'Use the Midnight theme and motion system out of the box.',
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loginAsDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const success = await signup(name, email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email already exists. Please use a different email or sign in.');
    }

    setIsLoading(false);
  };

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: 'bg-white/10' };
    if (pwd.length < 8) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 12) return { strength: 50, label: 'Fair', color: 'bg-orange-500' };
    if (pwd.length < 16) return { strength: 75, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="aurora-bg fixed inset-x-0 top-0 h-[24rem] opacity-90" />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo size="md" onClick={() => navigate('/')} />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-6 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-panel mx-auto w-full max-w-xl rounded-[2rem] p-7 shadow-2xl sm:p-9">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Create account</p>
                <h2 className="mt-2 text-3xl font-black">Start your system</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Get into the dashboard quickly, then expand with integrations and ML-driven routines as you go.
                </p>
              </div>
              <div className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                Guided setup
              </div>
            </div>

            {error && (
              <motion.div
                className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="pl-11"
                    required
                  />
                </div>
                {password && (
                  <motion.div className="mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Password strength</span>
                      <span>{strength.label}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full ${strength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.strength}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="pl-11 pr-11"
                    required
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" />
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-button gradient-accent px-6 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 12px 28px rgba(79,158,248,0.32)' } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">or skip auth</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <motion.button
              type="button"
              onClick={() => {
                loginAsDemo();
                navigate('/dashboard');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-button border border-[#A78BFA]/30 bg-gradient-to-r from-[#A78BFA]/15 to-[#7C3AED]/15 px-6 py-4 text-base font-semibold text-[#C4B5FD] transition-colors hover:from-[#A78BFA]/25 hover:to-[#7C3AED]/25"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(167,139,250,0.22)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              <Zap className="h-4 w-4" />
              Continue with Demo Account
            </motion.button>

            <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[var(--text-secondary)]">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[#4F9EF8] hover:text-[var(--text-primary)] transition-colors">
                  Sign in
                </Link>
              </p>
              <Link to="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Back to home
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="hidden lg:block"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-xl">
              Create the foundation once
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight">
              Start focused.
              <span className="block bg-gradient-to-r from-[var(--text-primary)] via-[#4F9EF8] to-[#A78BFA] bg-clip-text text-transparent">
                Grow into the system.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--text-secondary)]">
              Begin with the core workspace today, then connect wearables, calendar signals, and analytics loops as the product expands around you.
            </p>

            <div className="mt-10 glass-panel rounded-[2rem] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#4F9EF8]">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold">New account runway</p>
                  <p className="text-sm text-[var(--text-secondary)]">Start with a polished base and expand into integrations over time.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {onboardingPromises.map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.2, duration: 0.35 }}
                  >
                    <HeartPulse className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#A78BFA]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

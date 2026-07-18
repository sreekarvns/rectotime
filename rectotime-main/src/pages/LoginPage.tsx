import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Lock,
  Mail,
  Shield,
  TimerReset,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const productSignals = [
  {
    icon: Brain,
    title: 'Stress-aware planning',
    description: 'Machine learning guides action, pacing, and recovery instead of just visualizing data.',
  },
  {
    icon: TimerReset,
    title: 'Rhythm over chaos',
    description: 'Your schedule, focus blocks, and goals stay connected inside one operating layer.',
  },
  {
    icon: Shield,
    title: 'Built to sustain momentum',
    description: 'The system is designed to help you keep consistency without grinding yourself down.',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';

  type GoogleCredentialResponse = { credential?: string };

  type GoogleAccounts = {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'large' | 'medium' | 'small';
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
          shape?: 'pill' | 'rectangular' | 'square' | 'circle';
          width?: string;
        }
      ) => void;
    };
  };

  const getGoogleAccounts = (): GoogleAccounts | null => {
    const googleObject = (window as Window & { google?: { accounts?: GoogleAccounts } }).google;
    return googleObject?.accounts || null;
  };

  // Cursor-reactive ambient colors for subtle movement on the login background.
  const cursorAX = useMotionValue(560);
  const cursorAY = useMotionValue(300);
  const cursorBX = useMotionValue(920);
  const cursorBY = useMotionValue(440);

  const smoothAX = useSpring(cursorAX, { stiffness: 65, damping: 24, mass: 0.9 });
  const smoothAY = useSpring(cursorAY, { stiffness: 65, damping: 24, mass: 0.9 });
  const smoothBX = useSpring(cursorBX, { stiffness: 42, damping: 20, mass: 1.05 });
  const smoothBY = useSpring(cursorBY, { stiffness: 42, damping: 20, mass: 1.05 });

  const ambientPrimary = useMotionTemplate`
    radial-gradient(420px circle at ${smoothAX}px ${smoothAY}px, rgba(87, 176, 230, 0.26), rgba(87, 176, 230, 0.10) 36%, transparent 72%)
  `;
  const ambientSecondary = useMotionTemplate`
    radial-gradient(520px circle at ${smoothBX}px ${smoothBY}px, rgba(167, 139, 250, 0.20), rgba(167, 139, 250, 0.07) 34%, transparent 72%)
  `;

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      cursorAX.set(clientX);
      cursorAY.set(clientY);

      // Secondary blob trails with offset for layered parallax feel.
      const trailingX = window.innerWidth - clientX * 0.58;
      const trailingY = clientY * 0.62 + 110;
      cursorBX.set(trailingX);
      cursorBY.set(trailingY);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, [cursorAX, cursorAY, cursorBX, cursorBY]);

  useEffect(() => {
    if (!googleClientId) return;

    const renderGoogleButton = () => {
      const googleAccounts = getGoogleAccounts();
      if (!googleAccounts || !googleButtonContainerRef.current) return;

      googleAccounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setError('Google sign-in did not return a credential. Please try again.');
            return;
          }

          setError('');
          setIsGoogleLoading(true);
          const success = await loginWithGoogle(response.credential);
          setIsGoogleLoading(false);

          if (success) {
            navigate('/dashboard');
          } else {
            setError('Google sign-in failed. Please try again.');
          }
        },
      });

      googleButtonContainerRef.current.innerHTML = '';
      googleAccounts.id.renderButton(googleButtonContainerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: '360',
      });
    };

    const existing = document.getElementById('google-identity-script') as HTMLScriptElement | null;
    if (existing) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => renderGoogleButton();
    document.head.appendChild(script);
  }, [googleClientId, loginWithGoogle, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="aurora-bg fixed inset-x-0 top-0 h-[24rem] opacity-90" />
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          style={{ background: ambientPrimary }}
          animate={{ opacity: [0.46, 0.64, 0.46] }}
          transition={{ duration: 7.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0"
          style={{ background: ambientSecondary }}
          animate={{ opacity: [0.38, 0.56, 0.38] }}
          transition={{ duration: 9.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(79,158,248,0.20),rgba(79,158,248,0.03)_58%,transparent_72%)] blur-2xl"
          style={{
            x: smoothAX,
            y: smoothAY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{ opacity: [0.22, 0.34, 0.22], scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo size="md" onClick={() => navigate('/')} />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/signup" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Create account
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-6 pb-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          className="hidden lg:block"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-xl">
              Returning to your time system
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight">
              Welcome back to
              <span className="block bg-gradient-to-r from-[var(--text-primary)] via-[#4F9EF8] to-[#A78BFA] bg-clip-text text-transparent">
                calmer execution.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--text-secondary)]">
              Sign in to continue your planning loop, reconnect your integrations, and pick up exactly where your rhythm left off.
            </p>

            <div className="mt-10 space-y-4">
              {productSignals.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  className="glass-panel rounded-[1.5rem] p-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index + 0.15, duration: 0.35 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#4F9EF8]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="glass-panel mx-auto w-full max-w-xl rounded-[2rem] p-7 shadow-2xl sm:p-9">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Sign in</p>
                <h2 className="mt-2 text-3xl font-black">Open your workspace</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Your data syncs through the API when available, with local fallback so the app stays usable.
                </p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Auth ready
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
                    placeholder="••••••••"
                    className="pl-11"
                    required
                  />
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue to dashboard
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

            <div className="mt-4">
              {googleClientId ? (
                <>
                  <div className="my-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">or</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div ref={googleButtonContainerRef} className="min-h-[44px]" />
                    {isGoogleLoading && (
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">Signing in with Google...</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-[var(--text-secondary)]">
                  Google sign-in is unavailable. Set `VITE_GOOGLE_CLIENT_ID` to enable it.
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Mode</p>
                <p className="mt-2 text-base font-semibold">Backend-first auth</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Fallback</p>
                <p className="mt-2 text-base font-semibold">Local demo storage</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 text-[var(--text-secondary)]">
                <Link to="/forgot-password" className="text-sm font-medium text-[#4F9EF8] hover:text-[var(--text-primary)] transition-colors">
                  Forgot password?
                </Link>
                <p>
                New here?{' '}
                <Link to="/signup" className="font-medium text-[#4F9EF8] hover:text-[var(--text-primary)] transition-colors">
                  Create an account
                </Link>
                </p>
              </div>
              <Link to="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Back to home
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

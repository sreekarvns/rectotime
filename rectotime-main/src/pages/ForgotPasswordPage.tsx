import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requestPasswordReset, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsRequesting(true);
    const result = await requestPasswordReset(email);
    setIsRequesting(false);

    if (!result.ok) {
      setError(result.message || 'Failed to request password reset.');
      return;
    }

    setMessage(result.message);
    if (result.debugResetToken) {
      setDebugToken(result.debugResetToken);
      setToken(result.debugResetToken);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset token is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    const result = await resetPassword(token, newPassword);
    setIsResetting(false);

    if (!result.ok) {
      setError(result.message || 'Failed to reset password.');
      return;
    }

    setMessage(result.message || 'Password reset successful. You can now sign in.');
    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="aurora-bg fixed inset-x-0 top-0 h-[24rem] opacity-90" />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo size="md" onClick={() => navigate('/')} />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Back to sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-8 px-6 pb-10 lg:grid-cols-2">
        <motion.section
          className="glass-panel mx-auto w-full max-w-xl rounded-[2rem] p-7 shadow-2xl sm:p-9"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Recover account</p>
              <h2 className="mt-2 text-3xl font-black">Forgot password</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Request a reset token, then set a new password.
              </p>
            </div>
            <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              Secure flow
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />
              <p className="text-sm text-green-300">{message}</p>
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4">
            <label htmlFor="reset-email" className="block text-sm font-medium text-[var(--text-secondary)]">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-11"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isRequesting}
              className="flex w-full items-center justify-center gap-2 rounded-button gradient-accent px-6 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRequesting ? 'Requesting...' : 'Request reset token'}
            </button>
          </form>

          <div className="my-6 h-px bg-white/10" />

          <form onSubmit={handleResetPassword} className="space-y-4">
            <label htmlFor="reset-token" className="block text-sm font-medium text-[var(--text-secondary)]">
              Reset token
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                id="reset-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token here"
                className="pl-11"
                required
              />
            </div>

            <label htmlFor="new-password" className="block text-sm font-medium text-[var(--text-secondary)]">
              New password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="pl-11"
                required
              />
            </div>

            <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--text-secondary)]">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pl-11"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="flex w-full items-center justify-center gap-2 rounded-button bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResetting ? 'Resetting...' : 'Reset password'}
              {!isResetting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {debugToken && (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Development token: <span className="font-mono">{debugToken}</span>
            </p>
          )}
        </motion.section>

        <motion.section
          className="hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-panel rounded-[2rem] p-7">
            <h3 className="text-2xl font-black">How this works</h3>
            <ol className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
              <li>1. Enter your account email and request a reset token.</li>
              <li>2. Use the token from your email (or debug token in local dev).</li>
              <li>3. Set a new password and sign in again.</li>
            </ol>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;

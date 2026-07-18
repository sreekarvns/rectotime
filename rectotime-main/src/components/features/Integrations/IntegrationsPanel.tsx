import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Link2,
  CheckCircle2,
  RefreshCw,
  Unlink,
  Loader,
  Activity,
  Calendar,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Code2,
  Globe,
  AlertCircle,
  Zap,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { csrfFetch } from '../../../utils/csrf';

// ---------------------------------------------------------------------------
// API base (mirrors MLInsights)
// ---------------------------------------------------------------------------
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

const STORAGE_KEY = 'rectotime_integrations_v2';

// Legacy key used by MLInsights – keep in sync for compatibility
const LEGACY_PROVIDER_KEY = 'rectotime_wearable_provider';
const LEGACY_CONNECTED_KEY = 'rectotime_wearable_connected';

function loadConnected(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // ignore
  }
  // Seed from legacy single-provider key
  const legacy = localStorage.getItem(LEGACY_PROVIDER_KEY);
  const legacyConnected = localStorage.getItem(LEGACY_CONNECTED_KEY) === 'true';
  if (legacy && legacyConnected) return { [legacy]: true };
  return {};
}

function saveConnected(map: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  // Sync legacy key: pick first connected provider
  const active = Object.entries(map).find(([, v]) => v);
  if (active) {
    localStorage.setItem(LEGACY_PROVIDER_KEY, active[0]);
    localStorage.setItem(LEGACY_CONNECTED_KEY, 'true');
  } else {
    localStorage.removeItem(LEGACY_PROVIDER_KEY);
    localStorage.removeItem(LEGACY_CONNECTED_KEY);
  }
}

// ---------------------------------------------------------------------------
// Provider catalogue
// ---------------------------------------------------------------------------

interface ProviderDef {
  key: string;
  name: string;
  tagline: string;
  /** Tailwind color token used for the accent ring */
  accent: string;
  comingSoon?: boolean;
  Icon: React.FC<{ className?: string }>;
}

const HEALTH_PROVIDERS: ProviderDef[] = [
  {
    key: 'strava',
    name: 'Strava',
    tagline: 'Running, cycling & activity data',
    accent: 'orange',
    Icon: Activity,
  },
  {
    key: 'fitbit',
    name: 'Fitbit',
    tagline: 'Heart rate, sleep & daily steps',
    accent: 'teal',
    Icon: Activity,
  },
  {
    key: 'garmin',
    name: 'Garmin Connect',
    tagline: 'Heart rate, HRV & sleep scores',
    accent: 'blue',
    Icon: Activity,
  },
  {
    key: 'oura',
    name: 'Oura Ring',
    tagline: 'Readiness score & HRV monitoring',
    accent: 'purple',
    Icon: Zap,
  },
  {
    key: 'terra',
    name: 'Terra',
    tagline: 'Samsung Health, Apple Health & 50+ devices',
    accent: 'green',
    Icon: Globe,
  },
];

const PRODUCTIVITY_PROVIDERS: ProviderDef[] = [
  {
    key: 'google_calendar',
    name: 'Google Calendar',
    tagline: 'Sync events & schedule awareness',
    accent: 'blue',
    comingSoon: true,
    Icon: Calendar,
  },
  {
    key: 'notion',
    name: 'Notion',
    tagline: 'Tasks, notes & project management',
    accent: 'gray',
    comingSoon: true,
    Icon: BookOpen,
  },
  {
    key: 'todoist',
    name: 'Todoist',
    tagline: 'Task management & to-do lists',
    accent: 'red',
    comingSoon: true,
    Icon: CheckSquare,
  },
  {
    key: 'slack',
    name: 'Slack',
    tagline: 'Focus time & communication insights',
    accent: 'purple',
    comingSoon: true,
    Icon: MessageSquare,
  },
];

const DEVELOPER_PROVIDERS: ProviderDef[] = [
  {
    key: 'github',
    name: 'GitHub',
    tagline: 'Commits, pull requests & coding activity',
    accent: 'gray',
    comingSoon: true,
    Icon: Code2,
  },
];

// Accent color → Tailwind classes (bg + text)
const ACCENT_CLASSES: Record<string, { ring: string; icon: string; badge: string }> = {
  orange:  { ring: 'ring-orange-400/30  bg-orange-500/10',  icon: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300' },
  teal:    { ring: 'ring-teal-400/30    bg-teal-500/10',    icon: 'text-teal-400',    badge: 'bg-teal-500/20   text-teal-300' },
  blue:    { ring: 'ring-blue-400/30    bg-blue-500/10',    icon: 'text-blue-400',    badge: 'bg-blue-500/20   text-blue-300' },
  purple:  { ring: 'ring-purple-400/30  bg-purple-500/10',  icon: 'text-purple-400',  badge: 'bg-purple-500/20 text-purple-300' },
  green:   { ring: 'ring-green-400/30   bg-green-500/10',   icon: 'text-green-400',   badge: 'bg-green-500/20  text-green-300' },
  red:     { ring: 'ring-red-400/30     bg-red-500/10',     icon: 'text-red-400',     badge: 'bg-red-500/20    text-red-300' },
  gray:    { ring: 'ring-gray-400/30    bg-gray-500/10',    icon: 'text-gray-400',    badge: 'bg-gray-500/20   text-gray-300' },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const IntegrationsPanel: React.FC = () => {
  const authPollingRef = useRef<number | null>(null);

  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>(loadConnected);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Refresh from backend on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/integrations/status`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.connected_providers) {
          const merged: Record<string, boolean> = { ...loadConnected() };
          Object.entries(data.connected_providers as Record<string, unknown>).forEach(([k, v]) => {
            if (v) merged[k] = true;
          });
          setConnectedMap(merged);
          saveConnected(merged);
        }
      })
      .catch(() => {});
  }, []);

  const clearPolling = useCallback(() => {
    if (authPollingRef.current !== null) {
      window.clearInterval(authPollingRef.current);
      authPollingRef.current = null;
    }
  }, []);

  useEffect(() => () => clearPolling(), [clearPolling]);

  const setMessage = (providerKey: string, msg: string) =>
    setMessages((prev) => ({ ...prev, [providerKey]: msg }));

  const clearMessage = (providerKey: string) =>
    setMessages((prev) => {
      const next = { ...prev };
      delete next[providerKey];
      return next;
    });

  const handleConnect = useCallback(
    async (provider: ProviderDef) => {
      if (provider.comingSoon) return;
      clearPolling();
      setGlobalError(null);
      setConnectingProvider(provider.key);
      setMessage(provider.key, `Opening ${provider.name} authorization…`);

      try {
        const redirectUri = `${window.location.protocol}//${window.location.hostname}:8000/integrations/callback`;
        const res = await csrfFetch(`${API_BASE_URL}/integrations/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: provider.key, redirect_uri: redirectUri }),
        });
        const data = await res.json();

        if (data.status === 'not_configured') {
          setConnectingProvider(null);
          setMessage(provider.key, data.message || `${provider.name} is not configured.`);
          return;
        }

        // Open OAuth tab
        const oauthUrl = data.oauth_url || data.auth_url;
        const authWindow = window.open(oauthUrl, '_blank', 'width=600,height=700');

        let attempts = 0;
        authPollingRef.current = window.setInterval(async () => {
          attempts++;

          if (authWindow?.closed) {
            clearPolling();
            setConnectingProvider(null);
            setMessage(provider.key, `Tab was closed. Click Connect to try again.`);
            return;
          }

          if (attempts >= 40) {
            clearPolling();
            setConnectingProvider(null);
            setMessage(provider.key, `Authorization timed out. Please try again.`);
            return;
          }

          try {
            const statusRes = await fetch(
              `${API_BASE_URL}/integrations/status`,
              { credentials: 'include' }
            );
            const statusData = await statusRes.json();
            const cp = statusData.connected_providers || {};

            if (cp[provider.key]) {
              clearPolling();
              authWindow?.close();
              setConnectedMap((prev) => {
                const next = { ...prev, [provider.key]: true };
                saveConnected(next);
                return next;
              });
              setConnectingProvider(null);
              clearMessage(provider.key);
            }
          } catch {
            // keep polling
          }
        }, 1500);
      } catch (err) {
        setConnectingProvider(null);
        setMessage(provider.key, err instanceof Error ? err.message : 'Connection failed. Is the API running?');
      }
    },
    [clearPolling]
  );

  const handleDisconnect = useCallback(async (providerKey: string) => {
    await csrfFetch(
      `${API_BASE_URL}/integrations/disconnect` +
        `?provider=${encodeURIComponent(providerKey)}`,
      { method: 'DELETE' }
    ).catch(() => {});

    setConnectedMap((prev) => {
      const next = { ...prev };
      delete next[providerKey];
      saveConnected(next);
      return next;
    });
    clearMessage(providerKey);
  }, []);

  const handleSync = useCallback(async (providerKey: string) => {
    setSyncingProvider(providerKey);
    setGlobalError(null);
    try {
      const res = await csrfFetch(
        `${API_BASE_URL}/integrations/sync-now` +
          `?provider=${encodeURIComponent(providerKey)}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Sync failed');
      setMessage(providerKey, `Synced ${providerKey} data successfully.`);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setSyncingProvider(null);
    }
  }, []);

  const connectedCount = Object.values(connectedMap).filter(Boolean).length;

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderProvider = (p: ProviderDef) => {
    const isConnected = !!connectedMap[p.key];
    const isConnecting = connectingProvider === p.key;
    const isSyncing = syncingProvider === p.key;
    const msg = messages[p.key];
    const ac = ACCENT_CLASSES[p.accent] ?? ACCENT_CLASSES.gray;

    return (
      <motion.div
        key={p.key}
        className={`relative flex flex-col gap-3 p-5 rounded-xl border overflow-hidden hover-lift ${
          p.comingSoon
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 opacity-60'
            : isConnected
            ? 'border-green-300/40 dark:border-green-700/40 bg-green-50/30 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background-darkSecondary'
        }`}
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        whileHover={!p.comingSoon ? { borderColor: isConnected ? undefined : 'rgba(0,122,255,0.35)' } : {}}
      >
        {/* Pulsing ring while connecting */}
        <AnimatePresence>
          {isConnecting && (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-xl border-2 border-accent-blue"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0.7, 0.2, 0.7], scale: [1, 1.025, 1] }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {/* Coming soon overlay label */}
        {p.comingSoon && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Coming Soon
          </span>
        )}

        {/* Header row */}
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-10 h-10 rounded-lg ring-2 flex items-center justify-center flex-shrink-0 ${ac.ring}`}
            animate={isConnecting ? { rotate: [0, 5, -5, 0] } : {}}
            transition={isConnecting ? { duration: 0.5, repeat: Infinity, repeatDelay: 1 } : {}}
          >
            <p.Icon className={`w-5 h-5 ${ac.icon}`} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-primary-dark dark:text-white">{p.name}</p>
              <AnimatePresence mode="wait">
                {isConnected && (
                  <motion.span
                    key="connected-badge"
                    className="flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400"
                    initial={{ opacity: 0, scale: 0.7, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {/* Animated checkmark SVG */}
                    <motion.svg
                      viewBox="0 0 12 12"
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M2 6l3 3 5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </motion.svg>
                    Connected
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{p.tagline}</p>
          </div>
        </div>

        {/* Status message */}
        <AnimatePresence>
          {msg && (
            <motion.p
              className="text-[11px] px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {msg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!p.comingSoon && (
          <div className="flex gap-2 flex-wrap">
            {isConnected ? (
              <>
                <motion.button
                  onClick={() => handleSync(p.key)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                  whileHover={{ scale: 1.04, boxShadow: '0 6px 18px rgba(99,102,241,0.35)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {isSyncing ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Sync Now
                </motion.button>
                <motion.button
                  onClick={() => handleDisconnect(p.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  whileHover={{ scale: 1.04, backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Unlink className="w-3 h-3" />
                  Disconnect
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={() => handleConnect(p)}
                disabled={!!connectingProvider}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-blue text-white disabled:opacity-50"
                whileHover={!connectingProvider ? { scale: 1.04, boxShadow: '0 6px 18px rgba(0,122,255,0.35)' } : {}}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isConnecting ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <Link2 className="w-3 h-3" />
                )}
                {isConnecting ? 'Connecting…' : 'Connect'}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  const renderSection = (title: string, subtitle: string, providers: ProviderDef[], Icon: React.FC<{ className?: string }>) => (
    <section className="space-y-4">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <Icon className="w-5 h-5 text-accent-blue" />
        <div>
          <h3 className="text-base font-semibold text-primary-dark dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
      >
        {providers.map(renderProvider)}
      </motion.div>
    </section>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative space-y-8">
      {/* Aurora overlay for midnight theme */}
      <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-48 rounded-2xl" />

      {/* Page header */}
      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <h2 className="text-2xl font-bold text-primary-dark dark:text-white">Integrations</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Connect your favourite apps and wearables to power smarter productivity insights.
          </p>
        </motion.div>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-background-darkSecondary border border-secondary-light dark:border-gray-700 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 0.1 }}
        >
          <motion.div
            animate={connectedCount > 0 ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle2 className={`w-4 h-4 ${connectedCount > 0 ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
          </motion.div>
          <span className="text-sm font-medium text-primary-dark dark:text-white">
            <motion.span
              key={connectedCount}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ display: 'inline-block' }}
            >
              {connectedCount}
            </motion.span>
            {' '}app{connectedCount !== 1 ? 's' : ''} connected
          </span>
        </motion.div>
      </div>

      {/* Global error */}
      <AnimatePresence>
      {globalError && (
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{globalError}</p>
        </motion.div>
      )}
      </AnimatePresence>

      {/* API status hint */}
      {connectingProvider === null && connectedCount === 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50">
          <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">API required for live connections</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              Make sure the backend is running at <code className="font-mono">{API_BASE_URL}</code> before connecting.
            </p>
          </div>
        </div>
      )}

      {/* Health & Wearables */}
      {renderSection(
        'Health & Wearables',
        'Sync biometric data for automatic stress & productivity detection',
        HEALTH_PROVIDERS,
        Activity
      )}

      {/* Productivity Tools */}
      {renderSection(
        'Productivity Tools',
        'Bring your tasks and calendar into the dashboard',
        PRODUCTIVITY_PROVIDERS,
        CheckSquare
      )}

      {/* Developer Tools */}
      {renderSection(
        'Developer Tools',
        'Track coding activity and engineering momentum',
        DEVELOPER_PROVIDERS,
        Code2
      )}

      {/* Bottom tip */}
      <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Missing an integration?{' '}
          <span className="text-accent-blue font-medium">More connectors coming soon.</span>
        </p>
      </div>
    </div>
  );
};

export default IntegrationsPanel;

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Activity, TrendingUp, AlertCircle, Loader, Smartphone, Unlink } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { type StressPredictionV2 } from '../../types';
import { PRODUCT_CONFIG } from '../../constants/config';
import { storage } from '../../utils/storage';
import { csrfFetch } from '../../utils/csrf';

interface StressAnalyticsSnapshot {
  predictionViewed: number;
  actionViewed: number;
  actionCompleted: number;
  trialStarted: number;
  actionViewRate: number;
  actionCompletionRate: number;
  trialConversionRate: number;
}

interface ProductivityPrediction {
  productivity_score: number;
  message: string;
}

interface FormData {
  // Productivity inputs
  hours_studied: number;
  previous_scores: number;
  extracurricular_activities: number;
  sleep_hours: number;
  sample_question_papers_practiced: number;
  // Stress inputs
  gender: number;
  age: number;
  occupation: number;
  sleep_duration: number;
  quality_of_sleep: number;
  physical_activity_level: number;
  bmi_category: number;
  heart_rate: number;
  daily_steps: number;
  sleep_disorder: number;
  bp_systolic: number;
  bp_diastolic: number;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

/**
 * MLInsights Component
 * Collects user statistics and displays AI-powered productivity and stress predictions
 */
export const MLInsights: React.FC = () => {
  const authPollingRef = useRef<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    hours_studied: 5,
    previous_scores: 75,
    extracurricular_activities: 1,
    sleep_hours: 7,
    sample_question_papers_practiced: 10,
    gender: 1,
    age: 25,
    occupation: 2,
    sleep_duration: 7,
    quality_of_sleep: 8,
    physical_activity_level: 3,
    bmi_category: 1,
    heart_rate: 70,
    daily_steps: 8000,
    sleep_disorder: 0,
    bp_systolic: 120,
    bp_diastolic: 80,
  });

  const [predictions, setPredictions] = useState<{
    productivity?: ProductivityPrediction;
    stress?: StressPredictionV2;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProductivity, setShowProductivity] = useState(true);
  const [showStress, setShowStress] = useState(true);
  const [isStressPro, setIsStressPro] = useState(false);
  const [stressHistory, setStressHistory] = useState<Array<{ timestamp: string; stressLevel: number }>>([]);
  const [completedActionIds, setCompletedActionIds] = useState<Record<string, boolean>>({});
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState<StressAnalyticsSnapshot>({
    predictionViewed: 0,
    actionViewed: 0,
    actionCompleted: 0,
    trialStarted: 0,
    actionViewRate: 0,
    actionCompletionRate: 0,
    trialConversionRate: 0,
  });

  // Wearable integration state
  const [wearableConnected, setWearableConnected] = useState(false);
  const [wearableProvider, setWearableProvider] = useState('');
  const [lastSyncedMetrics, setLastSyncedMetrics] = useState<Record<string, number> | null>(null);
  const [loadingWearable, setLoadingWearable] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [selfReport, setSelfReport] = useState(0);
  const [showManualForm, setShowManualForm] = useState(true);
  const [wearableSetupMessage, setWearableSetupMessage] = useState<string | null>(null);

  const clearAuthPolling = useCallback(() => {
    if (authPollingRef.current !== null) {
      window.clearInterval(authPollingRef.current);
      authPollingRef.current = null;
    }
  }, []);

  const refreshAnalyticsSnapshot = useCallback(() => {
    fetch(`${API_BASE_URL}/analytics/funnel?window_days=30`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch analytics funnel');
        }
        const data = await response.json();
        setAnalyticsSnapshot({
          predictionViewed: data.prediction_viewed ?? 0,
          actionViewed: data.action_viewed ?? 0,
          actionCompleted: data.action_completed ?? 0,
          trialStarted: data.trial_started ?? 0,
          actionViewRate: data.action_view_rate ?? 0,
          actionCompletionRate: data.action_completion_rate ?? 0,
          trialConversionRate: data.trial_conversion_rate ?? 0,
        });
      })
      .catch(() => {
        // Fallback keeps analytics available when API cannot be reached.
        setAnalyticsSnapshot(storage.getStressAnalyticsSnapshot(30));
      });
  }, []);

  const trackEvent = useCallback(
    (
      name: string,
      metadata?: Record<string, string | number | boolean | null | undefined>
    ) => {
      const eventPayload = {
        name,
        timestamp: new Date().toISOString(),
        metadata,
      };

      storage.saveAnalyticsEvent({
        name: eventPayload.name,
        timestamp: eventPayload.timestamp,
        metadata: eventPayload.metadata,
      });

      // Mirror events to backend for cross-device/account-level analytics.
      fetch(`${API_BASE_URL}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      }).catch(() => {
        // Keep UX non-blocking: local analytics still works if API is unavailable.
      });

      refreshAnalyticsSnapshot();
    },
    [refreshAnalyticsSnapshot]
  );

  useEffect(() => {
    const tier = localStorage.getItem('rectotime_subscription_tier');
    setIsStressPro(tier === 'pro');
    const recent = storage.getLastStressCheckIns(7).map((item) => ({
      timestamp: item.timestamp,
      stressLevel: item.stressLevel,
    }));
    setStressHistory(recent);
    refreshAnalyticsSnapshot();

    // Restore wearable connection from previous session.
    const provider = localStorage.getItem('rectotime_wearable_provider') || '';
    const connected = localStorage.getItem('rectotime_wearable_connected') === 'true';
    if (connected && provider) {
      setWearableConnected(true);
      setWearableProvider(provider);
      setShowManualForm(false);
      try {
        fetch(`${API_BASE_URL}/health/latest`, {
          credentials: 'include',
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((metrics) => { if (metrics && !metrics.error) setLastSyncedMetrics(metrics); })
          .catch(() => {});
      } catch { /* ignore */ }
    }
    return () => {
      clearAuthPolling();
    };
  }, [clearAuthPolling, refreshAnalyticsSnapshot]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(numValue) ? value : numValue,
    }));
  }, []);

  const handlePredict = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const productivityData = {
        hours_studied: formData.hours_studied,
        previous_scores: formData.previous_scores,
        extracurricular_activities: formData.extracurricular_activities,
        sleep_hours: formData.sleep_hours,
        sample_question_papers_practiced: formData.sample_question_papers_practiced,
      };

      const stressData = {
        gender: formData.gender,
        age: formData.age,
        occupation: formData.occupation,
        sleep_duration: formData.sleep_duration,
        quality_of_sleep: formData.quality_of_sleep,
        physical_activity_level: formData.physical_activity_level,
        bmi_category: formData.bmi_category,
        heart_rate: formData.heart_rate,
        daily_steps: formData.daily_steps,
        sleep_disorder: formData.sleep_disorder,
        bp_systolic: formData.bp_systolic,
        bp_diastolic: formData.bp_diastolic,
      };

      const [productivityRes, stressRes] = await Promise.all([
        fetch(`${API_BASE_URL}/predict/productivity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productivityData),
        }),
        fetch(`${API_BASE_URL}/predict/stress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stressData),
        }),
      ]);

      if (!productivityRes.ok || !stressRes.ok) {
        throw new Error('Failed to get predictions');
      }

      const productivity = await productivityRes.json();
      const stress = await stressRes.json();

      setPredictions({ productivity, stress });

      if (typeof stress?.stress_level === 'number') {
        const checkIn = {
          timestamp: new Date().toISOString(),
          stressLevel: stress.stress_level,
          riskBand: stress.risk_band,
        };
        storage.addStressCheckIn(checkIn);
        setStressHistory(storage.getLastStressCheckIns(7).map((item) => ({
          timestamp: item.timestamp,
          stressLevel: item.stressLevel,
        })));
      }

      trackEvent('prediction_viewed', {
        module: 'ml_insights',
        has_stress_prediction: !!stress?.stress_level,
        has_productivity_prediction: !!productivity?.productivity_score,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get predictions. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  }, [formData, trackEvent]);

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStressColor = (level: number) => {
    if (level <= 4) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDriverLabel = (driver: string) =>
    driver
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const getRiskBadgeVariant = (riskBand?: string): 'success' | 'warning' | 'error' => {
    if (riskBand === 'low') return 'success';
    if (riskBand === 'moderate') return 'warning';
    return 'error';
  };

  const hasAdvancedStressInsights = !PRODUCT_CONFIG.ENABLE_STRESS_PREMIUM_GATE || isStressPro;

  const unlockStressProTrial = () => {
    localStorage.setItem('rectotime_subscription_tier', 'pro');
    setIsStressPro(true);
    trackEvent('stress_pro_trial_started', {
      trial_days: PRODUCT_CONFIG.STRESS_PRO_TRIAL_DAYS,
    });
  };

  const markActionCompleted = (actionTitle: string) => {
    setCompletedActionIds((prev) => ({ ...prev, [actionTitle]: true }));
    trackEvent('action_completed', { action_title: actionTitle, module: 'stress' });
  };

  const openFunnelCsvExport = () => {
    window.open(`${API_BASE_URL}/analytics/funnel/export?window_days=30`, '_blank', 'noopener,noreferrer');
  };

  const handleConnectWearable = useCallback(async (provider: string) => {
    if (authPollingRef.current !== null) {
      setWearableSetupMessage('A connection flow is already in progress. Please finish that first.');
      return;
    }

    try {
      clearAuthPolling();
      setConnectingProvider(provider);
      trackEvent('integration_connect_clicked', { provider });

      const redirectUri = `${API_BASE_URL}/integrations/callback`;
      const res = await csrfFetch(`${API_BASE_URL}/integrations/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, redirect_uri: redirectUri }),
      });
      const data = await res.json();

      if (data.oauth_url) {
        const authWindow = window.open(data.oauth_url, '_blank', 'noopener,noreferrer');
        setWearableSetupMessage(`Finish ${provider} authorization in the opened tab. Sync will activate automatically.`);

        let attempts = 0;
        const maxAttempts = 40;
        authPollingRef.current = window.setInterval(async () => {
          attempts += 1;
          if (attempts > maxAttempts) {
            clearAuthPolling();
            setConnectingProvider(null);
            setWearableSetupMessage(`Authorization check timed out for ${provider}. You can retry connect.`);
            trackEvent('integration_connect_failed', { provider, reason: 'timeout' });
            return;
          }

          if (authWindow && authWindow.closed) {
            clearAuthPolling();
            setConnectingProvider(null);
            setWearableSetupMessage(`Authorization tab was closed for ${provider}. Click reconnect to try again.`);
            trackEvent('integration_connect_failed', { provider, reason: 'window_closed' });
            return;
          }

          try {
            const statusRes = await fetch(`${API_BASE_URL}/integrations/status`, {
              credentials: 'include',
            });
            if (!statusRes.ok) return;

            const statusData = await statusRes.json();
            const connectedProviders = statusData.connected_providers || {};
            if (connectedProviders[provider]) {
              clearAuthPolling();
              if (authWindow && !authWindow.closed) {
                authWindow.close();
              }

              localStorage.setItem('rectotime_wearable_provider', provider);
              localStorage.setItem('rectotime_wearable_connected', 'true');
              setWearableConnected(true);
              setWearableProvider(provider);
              setShowManualForm(false);
              setWearableSetupMessage(null);
              setConnectingProvider(null);

              trackEvent('integration_connect_success', { provider });

              const latestRes = await fetch(
                `${API_BASE_URL}/health/latest?provider=${encodeURIComponent(provider)}`,
                { credentials: 'include' }
              );
              if (latestRes.ok) {
                const latestData = await latestRes.json();
                if (!latestData.error) {
                  setLastSyncedMetrics(latestData);
                }
              }
            }
          } catch {
            // Non-blocking while waiting for OAuth callback completion.
          }
        }, 1500);
      } else if (data.status === 'not_configured') {
        setConnectingProvider(null);
        setWearableSetupMessage(`${data.message} Get API credentials: ${data.setup_url}`);
        trackEvent('integration_connect_failed', { provider, reason: 'not_configured' });
      }
    } catch {
      // Simulate connection in local/demo mode when API is unavailable.
      localStorage.setItem('rectotime_wearable_provider', provider);
      localStorage.setItem('rectotime_wearable_connected', 'true');
      setWearableConnected(true);
      setWearableProvider(provider);
      setShowManualForm(false);
      setWearableSetupMessage(null);
      setConnectingProvider(null);
      trackEvent('integration_connect_success', { provider, mode: 'demo_fallback' });
    }
  }, [clearAuthPolling, trackEvent]);

  const handleDisconnectWearable = useCallback(async () => {
    csrfFetch(
      `${API_BASE_URL}/integrations/disconnect?provider=${encodeURIComponent(wearableProvider)}`,
      { method: 'DELETE' }
    ).catch(() => {});
    localStorage.removeItem('rectotime_wearable_provider');
    localStorage.removeItem('rectotime_wearable_connected');
    setWearableConnected(false);
    setWearableProvider('');
    setLastSyncedMetrics(null);
    setShowManualForm(true);
  }, [wearableProvider]);

  const handleReconnectWearable = useCallback(async () => {
    if (!wearableProvider) return;
    await handleConnectWearable(wearableProvider);
  }, [handleConnectWearable, wearableProvider]);

  const handleSyncNow = useCallback(async () => {
    if (!wearableProvider) return;
    setLoadingWearable(true);
    setError(null);
    try {
      const syncRes = await csrfFetch(
        `${API_BASE_URL}/integrations/sync-now?provider=${encodeURIComponent(wearableProvider)}`,
        { method: 'POST' }
      );
      const syncData = await syncRes.json();
      if (!syncRes.ok || syncData.error) {
        throw new Error(syncData.error || 'Sync failed');
      }

      if (syncData.metrics && !syncData.metrics.error) {
        setLastSyncedMetrics(syncData.metrics);
      } else {
        const latestRes = await fetch(
          `${API_BASE_URL}/health/latest?provider=${encodeURIComponent(wearableProvider)}`,
          { credentials: 'include' }
        );
        if (latestRes.ok) {
          const latestData = await latestRes.json();
          if (!latestData.error) {
            setLastSyncedMetrics(latestData);
          }
        }
      }

      setWearableSetupMessage(`Synced latest ${wearableProvider} data successfully.`);
      trackEvent('integration_sync_success', { provider: wearableProvider });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed. Please try reconnecting.');
      trackEvent('integration_sync_failed', { provider: wearableProvider });
    } finally {
      setLoadingWearable(false);
    }
  }, [trackEvent, wearableProvider]);

  const handleAutoPredict = useCallback(async () => {
    setLoadingWearable(true);
    setError(null);
    try {
      let metrics: Record<string, number> = {};
      try {
        const healthRes = await fetch(`${API_BASE_URL}/health/latest`, {
          credentials: 'include',
        });
        if (healthRes.ok) {
          const data = await healthRes.json();
          if (!data.error) metrics = data;
        }
      } catch { /* use defaults */ }

      const litePayload = {
        heart_rate: metrics.heart_rate ?? null,
        sleep_duration: metrics.sleep_duration ?? null,
        sleep_quality_score: metrics.sleep_quality_score ?? null,
        daily_steps: metrics.daily_steps ?? null,
        active_minutes: metrics.active_minutes ?? null,
        hrv: metrics.hrv ?? null,
        self_report: selfReport > 0 ? selfReport : null,
      };

      const stressRes = await fetch(`${API_BASE_URL}/predict/stress/lite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(litePayload),
      });
      if (!stressRes.ok) throw new Error('Auto-predict failed');
      const stress = await stressRes.json();

      if (typeof stress.stress_level === 'number') {
        storage.addStressCheckIn({
          timestamp: new Date().toISOString(),
          stressLevel: stress.stress_level,
          riskBand: stress.risk_band,
        });
        setStressHistory(
          storage.getLastStressCheckIns(7).map((item) => ({
            timestamp: item.timestamp,
            stressLevel: item.stressLevel,
          }))
        );
      }
      setPredictions((prev) => ({ ...prev, stress }));
      trackEvent('prediction_viewed', { module: 'stress_lite', source: 'wearable' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-predict failed. Ensure API is running.');
    } finally {
      setLoadingWearable(false);
    }
  }, [selfReport, trackEvent]);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">ML Insights</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Wearable / Auto Check-in Section */}
        <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white">Auto Check-in</h3>
            </div>
            {wearableConnected && <Badge variant="success">Connected</Badge>}
          </div>

          {wearableConnected ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 capitalize">Synced via {wearableProvider}</p>
              {lastSyncedMetrics && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {lastSyncedMetrics.heart_rate !== undefined && (
                    <div className="p-2 rounded bg-slate-900/60">
                      <p className="text-slate-400">Resting HR</p>
                      <p className="text-white font-semibold">{lastSyncedMetrics.heart_rate} bpm</p>
                    </div>
                  )}
                  {lastSyncedMetrics.sleep_duration !== undefined && (
                    <div className="p-2 rounded bg-slate-900/60">
                      <p className="text-slate-400">Sleep</p>
                      <p className="text-white font-semibold">{lastSyncedMetrics.sleep_duration}h</p>
                    </div>
                  )}
                  {lastSyncedMetrics.daily_steps !== undefined && (
                    <div className="p-2 rounded bg-slate-900/60">
                      <p className="text-slate-400">Steps</p>
                      <p className="text-white font-semibold">{Number(lastSyncedMetrics.daily_steps).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-slate-400">How stressed do you feel right now? (optional, 0 = calm, 5 = very stressed)</p>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={selfReport}
                  onChange={(e) => setSelfReport(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 — Calm</span><span>5 — Very Stressed</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAutoPredict}
                  disabled={loadingWearable}
                  className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  {loadingWearable ? <Loader className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  Auto Predict
                </button>
                <button
                  onClick={handleSyncNow}
                  disabled={loadingWearable}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 text-white text-sm rounded-lg"
                >
                  Sync now
                </button>
                <button
                  onClick={handleReconnectWearable}
                  disabled={loadingWearable}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-slate-200 text-sm rounded-lg"
                >
                  Reconnect
                </button>
                <button
                  onClick={handleDisconnectWearable}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg flex items-center gap-2"
                >
                  <Unlink className="w-4 h-4" /> Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Connect a wearable or health app once — stress is auto-detected daily with no manual input needed.
              </p>
              {wearableSetupMessage && (
                <p className="text-xs text-amber-300 p-2 rounded bg-amber-900/20 border border-amber-700/30">
                  {wearableSetupMessage}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'strava', label: 'Strava', desc: 'Walk, run, ride activity' },
                  { key: 'fitbit', label: 'Fitbit', desc: 'HR, sleep, steps' },
                  { key: 'garmin', label: 'Garmin Connect', desc: 'HR, HRV, sleep' },
                  { key: 'oura', label: 'Oura Ring', desc: 'Readiness + HRV' },
                  { key: 'terra', label: 'Terra · Samsung / Apple', desc: '50+ devices & apps' },
                ]).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => handleConnectWearable(key)}
                    disabled={!!connectingProvider}
                    className="p-3 rounded-lg border border-slate-600 hover:border-teal-500/70 bg-slate-900/60 text-left transition-colors"
                  >
                    <p className="text-sm text-white font-medium">{label}</p>
                    <p className="text-[11px] text-slate-400">{desc}</p>
                    {connectingProvider === key && <p className="text-[11px] text-teal-300 mt-1">Connecting...</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowManualForm((prev) => !prev)}
          >
            <h3 className="text-lg font-semibold text-white">
              {wearableConnected ? 'Manual Input (Advanced Fallback)' : 'Enter Your Stats'}
            </h3>
            {wearableConnected && (
              <span className="text-xs text-slate-400">{showManualForm ? '▲ Hide' : '▼ Show'}</span>
            )}
          </button>

          {(!wearableConnected || showManualForm) && <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Productivity Fields */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Hours Studied</label>
              <input
                type="number"
                name="hours_studied"
                value={formData.hours_studied}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Previous Scores (0-100)</label>
              <input
                type="number"
                name="previous_scores"
                value={formData.previous_scores}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Extracurricular Activities</label>
              <select
                name="extracurricular_activities"
                value={formData.extracurricular_activities}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sleep Hours (Last Night)</label>
              <input
                type="number"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sample Papers Practiced</label>
              <input
                type="number"
                name="sample_question_papers_practiced"
                value={formData.sample_question_papers_practiced}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Stress Fields */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                max="120"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sleep Duration (hrs)</label>
              <input
                type="number"
                name="sleep_duration"
                value={formData.sleep_duration}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Quality of Sleep (1-10)</label>
              <input
                type="number"
                name="quality_of_sleep"
                value={formData.quality_of_sleep}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Heart Rate (bpm)</label>
              <input
                type="number"
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleInputChange}
                min="0"
                max="200"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Daily Steps</label>
              <input
                type="number"
                name="daily_steps"
                value={formData.daily_steps}
                onChange={handleInputChange}
                min="0"
                max="50000"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Physical Activity Level (1-5)</label>
              <input
                type="number"
                name="physical_activity_level"
                value={formData.physical_activity_level}
                onChange={handleInputChange}
                min="1"
                max="5"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">BMI Category</label>
              <input
                type="number"
                name="bmi_category"
                value={formData.bmi_category}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Blood Pressure (Systolic)</label>
              <input
                type="number"
                name="bp_systolic"
                value={formData.bp_systolic}
                onChange={handleInputChange}
                min="0"
                max="200"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Blood Pressure (Diastolic)</label>
              <input
                type="number"
                name="bp_diastolic"
                value={formData.bp_diastolic}
                onChange={handleInputChange}
                min="0"
                max="150"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Occupation</label>
              <input
                type="number"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sleep Disorder</label>
              <select
                name="sleep_disorder"
                value={formData.sleep_disorder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" /> Get Predictions
              </>
            )}
          </button>
          </>}
        </div>

        {/* Results Section */}
        {Object.keys(predictions).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Productivity Result */}
            {predictions.productivity && (
              <div
                className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors"
                onClick={() => setShowProductivity(!showProductivity)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Productivity Score</h4>
                  </div>
                  <Badge>{showProductivity ? 'Hide' : 'Show'}</Badge>
                </div>

                {showProductivity && (
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">
                      <span className={getProductivityColor(predictions.productivity.productivity_score)}>
                        {predictions.productivity.productivity_score}
                      </span>
                      <span className="text-xl text-slate-400">/100</span>
                    </div>
                    <p className="text-slate-300 text-sm">{predictions.productivity.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Stress Result */}
            {predictions.stress && (
              <div
                className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:border-red-500/50 transition-colors"
                onClick={() => {
                  const nextShow = !showStress;
                  setShowStress(nextShow);
                  if (nextShow && predictions.stress?.actions?.length && hasAdvancedStressInsights) {
                    trackEvent('action_viewed', { count: predictions.stress.actions.length });
                  }
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h4 className="font-semibold text-white">Stress Level</h4>
                  </div>
                  <Badge variant="error">{showStress ? 'Hide' : 'Show'}</Badge>
                </div>

                {showStress && (
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">
                      <span className={getStressColor(predictions.stress.stress_level)}>
                        {predictions.stress.stress_level.toFixed(1)}
                      </span>
                      <span className="text-xl text-slate-400">/8</span>
                    </div>
                    {predictions.stress.risk_band && (
                      <Badge variant={getRiskBadgeVariant(predictions.stress.risk_band)}>
                        Risk: {predictions.stress.risk_band.toUpperCase()}
                      </Badge>
                    )}
                    <p className="text-slate-300 text-sm">{predictions.stress.message}</p>

                    {stressHistory.length > 1 && (
                      <div className="pt-2">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">7-Day Trend</p>
                        <div className="flex items-end gap-1 h-14">
                          {stressHistory.map((point) => {
                            const barHeight = Math.max(8, Math.min(56, (point.stressLevel / 8) * 56));
                            return (
                              <div
                                key={point.timestamp}
                                className="flex-1 rounded-sm bg-red-400/70"
                                style={{ height: `${barHeight}px` }}
                                title={`${new Date(point.timestamp).toLocaleDateString()}: ${point.stressLevel.toFixed(1)}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!hasAdvancedStressInsights && (
                      <div className="pt-3 p-3 rounded-md bg-slate-900/80 border border-amber-600/40">
                        <p className="text-sm text-amber-200">
                          Unlock personalized actions and advanced stress insights with Pro.
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unlockStressProTrial();
                          }}
                          className="mt-2 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-semibold"
                        >
                          Start {PRODUCT_CONFIG.STRESS_PRO_TRIAL_DAYS}-day trial
                        </button>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Then ${PRODUCT_CONFIG.STRESS_PRO_MONTHLY_USD.toFixed(2)}/month
                        </p>
                      </div>
                    )}

                    {hasAdvancedStressInsights && predictions.stress.key_drivers && predictions.stress.key_drivers.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Key Drivers</p>
                        <div className="flex flex-wrap gap-2">
                          {predictions.stress.key_drivers.map((driver) => (
                            <Badge key={driver}>
                              {formatDriverLabel(driver)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasAdvancedStressInsights && predictions.stress.actions && predictions.stress.actions.length > 0 && (
                      <div className="pt-3 space-y-2">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Suggested Actions</p>
                        {predictions.stress.actions.map((action) => (
                          <div key={action.title} className="p-2 rounded-md bg-slate-900/70 border border-slate-700">
                            <p className="text-sm text-white font-medium">{action.title}</p>
                            <p className="text-xs text-slate-300">{action.description}</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {action.frequency} • {action.minutes} min
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markActionCompleted(action.title);
                              }}
                              disabled={!!completedActionIds[action.title]}
                              className="mt-2 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white text-[11px]"
                            >
                              {completedActionIds[action.title] ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {hasAdvancedStressInsights && predictions.stress.expected_impact_range && (
                      <p className="text-xs text-emerald-300 pt-1">
                        Expected improvement in {predictions.stress.expected_impact_range.window_days} days:{' '}
                        {predictions.stress.expected_impact_range.min} to {predictions.stress.expected_impact_range.max}
                      </p>
                    )}

                    <div className="pt-3 mt-2 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Growth Funnel (30d)</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openFunnelCsvExport();
                          }}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[11px] text-slate-200"
                        >
                          Export CSV
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-900/60">
                          <p className="text-slate-400">Predictions</p>
                          <p className="text-white font-semibold">{analyticsSnapshot.predictionViewed}</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900/60">
                          <p className="text-slate-400">Action Views</p>
                          <p className="text-white font-semibold">{analyticsSnapshot.actionViewed}</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900/60">
                          <p className="text-slate-400">Actions Done</p>
                          <p className="text-white font-semibold">{analyticsSnapshot.actionCompleted}</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900/60">
                          <p className="text-slate-400">Trials Started</p>
                          <p className="text-white font-semibold">{analyticsSnapshot.trialStarted}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        View rate: {(analyticsSnapshot.actionViewRate * 100).toFixed(1)}% | Completion rate:{' '}
                        {(analyticsSnapshot.actionCompletionRate * 100).toFixed(1)}% | Trial conversion:{' '}
                        {(analyticsSnapshot.trialConversionRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {Object.keys(predictions).length === 0 && !loading && (
          <div className="p-8 text-center">
            <Brain className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400">Enter your stats and click "Get Predictions" to analyze your productivity and stress levels</p>
          </div>
        )}
      </div>
    </Card>
  );
};

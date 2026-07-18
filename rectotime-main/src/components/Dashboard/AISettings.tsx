import React, { useState, useEffect, memo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Save, Key, AlertCircle, Shield, Info, CheckCircle } from 'lucide-react';
import { getAIConfigSafe, saveAIConfig } from '../../utils/aiService';

export const AISettings: React.FC = memo(() => {
  const [provider, setProvider] = useState<'claude' | 'openai' | 'proxy' | 'mock'>('mock');
  const [saved, setSaved] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    hasApiKey: boolean;
    isProxyEnabled: boolean;
  }>({ hasApiKey: false, isProxyEnabled: false });

  useEffect(() => {
    const config = getAIConfigSafe();
    setProvider(config.provider as 'claude' | 'openai' | 'proxy' | 'mock');
    setConfigStatus({
      hasApiKey: config.hasApiKey,
      isProxyEnabled: config.isProxyEnabled,
    });
  }, []);

  const handleSave = () => {
    saveAIConfig({ provider });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Configuration</h3>
          <p className="text-sm text-[var(--text-secondary)]">Configure your AI provider</p>
        </div>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/12 p-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-300">Provider preference saved!</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="mb-1 font-medium text-blue-300">Secure API Key Configuration</p>
            <p className="text-blue-200/90">
              API keys are configured via environment variables for security. 
              They are never stored in the browser.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'claude' | 'openai' | 'proxy' | 'mock')}
            className="w-full rounded-input border border-[color:var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="mock">Mock AI (No API key needed)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="proxy">Secure Backend Proxy</option>
          </select>
        </div>

        {/* Provider-specific information */}
        {provider === 'mock' && (
          <div className="rounded-lg border border-[color:var(--border-color)] bg-[var(--bg-tertiary)] p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 text-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                Uses simple pattern matching for responses. No API calls are made.
              </p>
            </div>
          </div>
        )}

        {provider === 'proxy' && (
          <div className="rounded-lg border border-green-500/25 bg-green-500/10 p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-500 mt-0.5" />
              <div className="text-sm text-green-300">
                <p className="font-medium mb-1">Recommended for Production</p>
                <p>Set <code className="rounded bg-green-500/15 px-1">VITE_AI_PROXY_URL</code> to your backend endpoint.</p>
              </div>
            </div>
          </div>
        )}

        {(provider === 'claude' || provider === 'openai') && (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-1">Environment Variables Required</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><code className="rounded bg-amber-500/15 px-1">VITE_AI_API_KEY</code> - Your API key</li>
                  <li><code className="rounded bg-amber-500/15 px-1">VITE_AI_MODEL</code> - Model name (optional)</li>
                </ul>
                <p className="mt-2 text-xs">
                  {provider === 'claude' 
                    ? 'Get your key at console.anthropic.com'
                    : 'Get your key at platform.openai.com'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            configStatus.hasApiKey 
              ? 'bg-green-500/15 text-green-300'
              : 'border border-[color:var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
          }`}>
            {configStatus.hasApiKey ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            API Key {configStatus.hasApiKey ? 'Configured' : 'Not Set'}
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            configStatus.isProxyEnabled
              ? 'bg-green-500/15 text-green-300'
              : 'border border-[color:var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
          }`}>
            <Shield className="w-4 h-4" />
            Proxy {configStatus.isProxyEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
          className="w-full"
        >
          Save Provider Preference
        </Button>
      </div>
    </Card>
  );
});

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
          <h3 className="text-lg font-bold text-primary-dark dark:text-white">AI Configuration</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure your AI provider</p>
        </div>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700 dark:text-green-400">Provider preference saved!</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">Secure API Key Configuration</p>
            <p className="text-blue-600 dark:text-blue-300">
              API keys are configured via environment variables for security. 
              They are never stored in the browser.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-dark dark:text-white mb-2">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'claude' | 'openai' | 'proxy' | 'mock')}
            className="w-full px-4 py-3 rounded-input border border-secondary dark:border-gray-700 bg-white dark:bg-background-darkSecondary text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="mock">Mock AI (No API key needed)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="proxy">Secure Backend Proxy</option>
          </select>
        </div>

        {/* Provider-specific information */}
        {provider === 'mock' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uses simple pattern matching for responses. No API calls are made.
              </p>
            </div>
          </div>
        )}

        {provider === 'proxy' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-500 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-400">
                <p className="font-medium mb-1">Recommended for Production</p>
                <p>Set <code className="bg-green-100 dark:bg-green-800 px-1 rounded">VITE_AI_PROXY_URL</code> to your backend endpoint.</p>
              </div>
            </div>
          </div>
        )}

        {(provider === 'claude' || provider === 'openai') && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium mb-1">Environment Variables Required</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li><code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">VITE_AI_API_KEY</code> - Your API key</li>
                  <li><code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">VITE_AI_MODEL</code> - Model name (optional)</li>
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
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
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
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
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

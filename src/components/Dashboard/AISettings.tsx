import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Save, Key, AlertCircle } from 'lucide-react';
import { getAIConfigSafe, saveAIConfig } from '../../utils/aiService';

export const AISettings: React.FC = () => {
  const [provider, setProvider] = useState<'claude' | 'openai' | 'mock'>('mock');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const config = getAIConfigSafe();
    setProvider(config.provider);
    setModel(config.model || '');
    // Don't load API key for security
  }, []);

  const handleSave = () => {
    try {
      saveAIConfig({
        provider,
        apiKey: apiKey.trim() || undefined,
        model: model.trim() || undefined,
      });
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    }
  };

  const getModelPlaceholder = () => {
    if (provider === 'claude') return 'claude-3-haiku-20240307';
    if (provider === 'openai') return 'gpt-3.5-turbo';
    return '';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary-dark dark:text-white">AI Configuration</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure your AI provider and API key</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {saved && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400">Configuration saved successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-dark dark:text-white mb-2">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'claude' | 'openai' | 'mock')}
            className="w-full px-4 py-3 rounded-input border border-secondary dark:border-gray-700 bg-white dark:bg-background-darkSecondary text-primary-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="mock">Mock AI (No API key needed)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (GPT)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {provider === 'mock' && 'Uses simple pattern matching - no API calls'}
            {provider === 'claude' && 'Get your API key from https://console.anthropic.com/'}
            {provider === 'openai' && 'Get your API key from https://platform.openai.com/api-keys'}
          </p>
        </div>

        {provider !== 'mock' && (
          <>
            <Input
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider === 'claude' ? 'Claude' : 'OpenAI'} API key`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              Your API key is stored locally and never sent to our servers
            </p>

            <Input
              label="Model (Optional)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={getModelPlaceholder()}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              Leave empty to use default model
            </p>
          </>
        )}

        <Button
          variant="primary"
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
          className="w-full"
        >
          Save Configuration
        </Button>
      </div>
    </Card>
  );
};

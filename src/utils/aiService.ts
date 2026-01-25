/**
 * AI Service - Secure API Configuration
 * 
 * SECURITY NOTICE:
 * - API keys should ONLY be set via environment variables (VITE_AI_API_KEY)
 * - Never store API keys in localStorage (vulnerable to XSS)
 * - For production, use a backend proxy to protect API keys
 * 
 * Recommended Production Setup:
 * 1. Create a backend API endpoint (e.g., /api/ai/chat)
 * 2. Store API keys in server environment variables
 * 3. Set VITE_AI_PROXY_URL to your backend endpoint
 */

interface AIConfig {
  provider: 'claude' | 'openai' | 'mock' | 'proxy';
  apiKey?: string;
  model?: string;
  proxyUrl?: string;
}

// Security: Only read from environment variables, never localStorage
const getAIConfig = (): AIConfig => {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {} as Record<string, string>;
  
  // Check for proxy URL first (recommended for production)
  const proxyUrl = env.VITE_AI_PROXY_URL;
  if (proxyUrl) {
    return {
      provider: 'proxy',
      proxyUrl,
      model: env.VITE_AI_MODEL || '',
    };
  }
  
  // Development: Allow direct API calls with env variables only
  const provider = (env.VITE_AI_PROVIDER || 'mock') as AIConfig['provider'];
  const apiKey = env.VITE_AI_API_KEY || '';
  const model = env.VITE_AI_MODEL || '';

  // Security warning for development
  if (apiKey && import.meta.env.DEV) {
    console.warn(
      '⚠️ Security Warning: Using API key from environment variable.\n' +
      'For production, use a backend proxy (set VITE_AI_PROXY_URL) to protect your API key.'
    );
  }

  return { provider, apiKey, model };
};

export interface ChatContext {
  currentStatus: {
    activity: { domain: string; category: string } | null;
    timeSpent: number;
    focusScore: { value: number };
  };
  goals: Array<{
    title: string;
    current: number;
    target: number;
    unit: string;
    completed: boolean;
  }>;
  chatHistory?: Array<{ role: string; content: string }>;
}

// Claude API (Anthropic)
const callClaudeAPI = async (message: string, context: ChatContext, config: AIConfig): Promise<string> => {
  if (!config.apiKey) {
    throw new Error('Claude API key not configured. Please set VITE_AI_API_KEY or add it in settings.');
  }

  const model = config.model || 'claude-3-haiku-20240307';
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: buildPrompt(message, context),
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error: unknown) {
    console.error('Claude API error:', error);
    throw error;
  }
};

// OpenAI API
const callOpenAIAPI = async (message: string, context: ChatContext, config: AIConfig): Promise<string> => {
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured. Please set VITE_AI_API_KEY or add it in settings.');
  }

  const model = config.model || 'gpt-3.5-turbo';
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity coach. Provide concise, actionable advice based on the user\'s activity and goals.',
          },
          {
            role: 'user',
            content: buildPrompt(message, context),
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

// Build context-aware prompt
const buildPrompt = (message: string, context: ChatContext): string => {
  const { currentStatus, goals } = context;
  
  let prompt = `You are a productivity coach helping a user with their goals. Here's their current context:\n\n`;
  
  if (currentStatus.activity) {
    prompt += `Current Activity: ${currentStatus.activity.domain} (${currentStatus.activity.category})\n`;
    prompt += `Time Spent: ${Math.floor(currentStatus.timeSpent / 60)} minutes\n`;
  }
  
  prompt += `Focus Score: ${currentStatus.focusScore.value}/100\n\n`;
  
  if (goals.length > 0) {
    prompt += `Goals:\n`;
    goals.forEach(goal => {
      const progress = Math.round((goal.current / goal.target) * 100);
      prompt += `- ${goal.title}: ${goal.current}/${goal.target} ${goal.unit} (${progress}% complete)\n`;
    });
    prompt += `\n`;
  }
  
  prompt += `User Question: ${message}\n\n`;
  prompt += `Provide a helpful, concise response based on this context.`;
  
  return prompt;
};

// Proxy API call (secure - API key handled by backend)
const callProxyAPI = async (message: string, context: ChatContext, config: AIConfig): Promise<string> => {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  
  if (!proxyUrl) {
    throw new Error('Proxy URL not configured. Set VITE_AI_PROXY_URL environment variable.');
  }
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: buildPrompt(message, context),
        model: config.model,
        // Don't send API key - backend handles authentication
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Proxy API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response || data.content || data.message || 'No response from proxy';
  } catch (error) {
    console.error('Proxy API error:', error);
    throw error;
  }
};

// Mock AI (fallback)
const callMockAI = async (message: string, context: ChatContext): Promise<string> => {
  // Simple pattern matching fallback
  const goals = context.goals;
  
  if (message.toLowerCase().includes('progress')) {
    return `You've been working on your goals. You have ${goals.length} active goals, with ${goals.filter((g) => !g.completed).length} still in progress.`;
  }
  
  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('suggest')) {
    return `Based on your current activity, I'd suggest focusing on your goals. You're currently on ${context.currentStatus.activity?.domain || 'unknown site'}. Try working on your top priority goal!`;
  }
  
  if (message.toLowerCase().includes('goal')) {
    const incompleteGoals = goals.filter((g) => !g.completed);
    if (incompleteGoals.length > 0) {
      return `You have ${incompleteGoals.length} active goals. Your top priority should be "${incompleteGoals[0].title}" - you're ${Math.round((incompleteGoals[0].current / incompleteGoals[0].target) * 100)}% complete.`;
    }
    return "All your goals are completed! Great work! Consider setting new challenges.";
  }
  
  return "I'm here to help you stay productive and reach your goals. Ask me about your progress, goals, or get suggestions for what to work on next!";
};

// Main AI service function
export const callAI = async (message: string, context: ChatContext): Promise<string> => {
  const config = getAIConfig();
  
  try {
    switch (config.provider) {
      case 'claude':
        return await callClaudeAPI(message, context, config);
      case 'openai':
        return await callOpenAIAPI(message, context, config);
      case 'proxy':
        return await callProxyAPI(message, context, config);
      case 'mock':
      default:
        return await callMockAI(message, context);
    }
  } catch (error: unknown) {
    console.error('AI service error:', error);
    // Fallback to mock if API fails
    if (config.provider !== 'mock') {
      console.warn('Falling back to mock AI due to API error');
      return await callMockAI(message, context);
    }
    throw error;
  }
};

// Save API configuration
// SECURITY: No longer saves API keys to localStorage
export const saveAIConfig = (config: Partial<Pick<AIConfig, 'provider' | 'model'>>) => {
  // Only allow saving non-sensitive config
  if (config.provider) {
    // Store preference in sessionStorage (cleared on browser close)
    sessionStorage.setItem('ai_provider_preference', config.provider);
  }
  if (config.model) {
    sessionStorage.setItem('ai_model_preference', config.model);
  }
  
  console.info(
    '💡 To configure AI API keys, set environment variables:\n' +
    '   VITE_AI_PROVIDER=claude|openai\n' +
    '   VITE_AI_API_KEY=your-api-key\n' +
    '   VITE_AI_MODEL=claude-3-haiku-20240307\n\n' +
    'For production, use VITE_AI_PROXY_URL for secure backend proxy.'
  );
};

// Get current configuration (safe for display)
export const getAIConfigSafe = (): { provider: string; model?: string; hasApiKey: boolean; isProxyEnabled: boolean } => {
  const config = getAIConfig();
  return {
    provider: config.provider,
    model: config.model,
    hasApiKey: !!config.apiKey,
    isProxyEnabled: config.provider === 'proxy',
  };
};

// AI Service - Handles API calls to LLM
// Currently supports: Claude (Anthropic), OpenAI, or local mock

interface AIConfig {
  provider: 'claude' | 'openai' | 'mock';
  apiKey?: string;
  model?: string;
}

const getAIConfig = (): AIConfig => {
  // Get config from environment variables or localStorage
  const provider = (import.meta.env.VITE_AI_PROVIDER || localStorage.getItem('ai_provider') || 'mock') as 'claude' | 'openai' | 'mock';
  const apiKey = import.meta.env.VITE_AI_API_KEY || localStorage.getItem('ai_api_key') || '';
  const model = import.meta.env.VITE_AI_MODEL || localStorage.getItem('ai_model') || '';

  return { provider, apiKey, model };
};

export interface ChatContext {
  currentStatus: any;
  goals: any[];
  chatHistory?: any[];
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
  } catch (error: any) {
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
  } catch (error: any) {
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

// Mock AI (fallback)
const callMockAI = async (message: string, context: ChatContext): Promise<string> => {
  // Simple pattern matching fallback
  const stats = { productive: 0 }; // You can calculate this from context
  const goals = context.goals;
  
  if (message.toLowerCase().includes('progress')) {
    return `You've been working on your goals. You have ${goals.length} active goals, with ${goals.filter((g: any) => !g.completed).length} still in progress.`;
  }
  
  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('suggest')) {
    return `Based on your current activity, I'd suggest focusing on your goals. You're currently on ${context.currentStatus.activity?.domain || 'unknown site'}. Try working on your top priority goal!`;
  }
  
  if (message.toLowerCase().includes('goal')) {
    const incompleteGoals = goals.filter((g: any) => !g.completed);
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
      case 'mock':
      default:
        return await callMockAI(message, context);
    }
  } catch (error: any) {
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
export const saveAIConfig = (config: Partial<AIConfig>) => {
  if (config.provider) {
    localStorage.setItem('ai_provider', config.provider);
  }
  if (config.apiKey) {
    localStorage.setItem('ai_api_key', config.apiKey);
  }
  if (config.model) {
    localStorage.setItem('ai_model', config.model);
  }
};

// Get current configuration (without exposing API key)
export const getAIConfigSafe = (): Omit<AIConfig, 'apiKey'> & { hasApiKey: boolean } => {
  const config = getAIConfig();
  return {
    provider: config.provider,
    model: config.model,
    hasApiKey: !!config.apiKey,
  };
};

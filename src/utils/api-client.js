/**
 * Unified API Client for Multiple AI Providers
 * Supports: Anthropic, OpenAI, Google, Groq, Cerebras
 */

export class UnifiedAPIClient {
  constructor(config) {
    this.config = config;
    this.providers = {
      anthropropic: {
        baseUrl: 'https://api.anthropic.com/v1/messages',
        headers: {
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        keyField: 'anthropicApiKey',
        defaultModel: 'claude-3-5-sonnet-20241022'
      },
      openai: {
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json'
        },
        keyField: 'openaiApiKey',
        defaultModel: 'gpt-4-turbo-preview'
      },
      google: {
        baseUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`,
        headers: {
          'Content-Type': 'application/json'
        },
        keyField: 'googleApiKey',
        defaultModel: 'gemini-pro'
      },
      groq: {
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.groqApiKey}`
        },
        keyField: 'groqApiKey',
        defaultModel: 'llama-3.3-70b-versatile'
      },
      cerebras: {
        baseUrl: 'https://api.cerebras.ai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json'
        },
        keyField: 'cerebrasApiKey',
        defaultModel: 'llama-3.3-70b'
      }
    };
  }

  /**
   * Execute a chat completion request with timeout and retry limits
   */
  async chatCompletion(params) {
    const {
      prompt,
      provider = this.config.defaultProvider,
      model = this.providers[provider]?.defaultModel,
      maxTokens = this.config.maxTokens,
      temperature = this.config.temperature,
      timeout = 30000, // 30 second default timeout
      maxRetries = 3 // Maximum retry attempts per provider
    } = params;

    // Track attempted providers to prevent duplicates
    const attemptedProviders = new Set();

    // Try primary provider with retry limit
    let retryCount = 0;
    while (retryCount < maxRetries && !attemptedProviders.has(provider)) {
      try {
        const result = await this.callProviderWithTimeout(provider, { prompt, model, maxTokens, temperature }, timeout);
        return result;
      } catch (error) {
        console.error(`${provider} failed (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
        retryCount++;

        // If this is a timeout or rate limit, try again with same provider
        if (error.message.includes('timeout') || error.message.includes('429')) {
          if (retryCount < maxRetries) {
            await this.sleep(1000 * retryCount); // Exponential backoff
            continue;
          }
        }

        // Mark as attempted and break to fallback
        attemptedProviders.add(provider);
        break;
      }
    }

    // Try fallback providers in aggressive mode
    if (this.config.mode === 'aggressive' && this.config.fallbackProviders?.length > 0) {
      for (const fallbackProvider of this.config.fallbackProviders) {
        // Skip if already tried or not configured
        if (attemptedProviders.has(fallbackProvider) || !this.config[fallbackProvider + 'ApiKey']) {
          continue;
        }

        try {
          console.log(`Trying fallback provider: ${fallbackProvider}`);
          const result = await this.callProviderWithTimeout(fallbackProvider, { prompt, model, maxTokens, temperature }, timeout);
          return result;
        } catch (fallbackError) {
          console.error(`${fallbackProvider} failed:`, fallbackError.message);
          attemptedProviders.add(fallbackProvider);
        }
      }
    }

    throw new Error(`All providers failed after ${attemptedProviders.size} attempts`);
  }

  /**
   * Call provider with timeout protection
   */
  async callProviderWithTimeout(provider, params, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const result = await this.callProvider(provider, { ...params, signal: controller.signal });
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Sleep utility for backoff
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Call a specific provider with cancellation support
   */
  async callProvider(provider, { prompt, model, maxTokens, temperature, signal }) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const apiKey = this.config[providerConfig.keyField];
    if (!apiKey) {
      throw new Error(`No API key configured for ${provider}`);
    }

    const headers = { ...providerConfig.headers };
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
    } else if (provider === 'cerebras') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'groq') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'google') {
      // Google uses API key in URL
    }

    let url = providerConfig.baseUrl;
    if (provider === 'google') {
      url += `?key=${apiKey}`;
    }

    const body = this.formatRequestBody(provider, prompt, model, maxTokens, temperature);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal // Pass AbortSignal to fetch
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return this.formatResponse(provider, data);
  }

  /**
   * Format request body for each provider
   */
  formatRequestBody(provider, prompt, model, maxTokens, temperature) {
    if (provider === 'anthropic') {
      return {
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }]
      };
    } else if (provider === 'google') {
      return {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };
    } else {
      // OpenAI, Groq, Cerebras (OpenAI-compatible)
      return {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      };
    }
  }

  /**
   * Format response from each provider
   */
  formatResponse(provider, data) {
    if (provider === 'anthropic') {
      return {
        text: data.content[0]?.text || '',
        usage: data.usage,
        model: data.model
      };
    } else if (provider === 'google') {
      return {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        usage: data.usageMetadata,
        model: 'gemini-pro'
      };
    } else {
      // OpenAI, Groq, Cerebras
      return {
        text: data.choices?.[0]?.message?.content || '',
        usage: data.usage,
        model: data.model
      };
    }
  }

  /**
   * Test connection to a provider
   */
  async testConnection(provider) {
    try {
      const result = await this.chatCompletion({
        provider,
        prompt: 'Hello',
        maxTokens: 10
      });
      return { success: true, provider, model: result.model };
    } catch (error) {
      return { success: false, provider, error: error.message };
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers).filter(provider => {
      const providerConfig = this.providers[provider];
      return this.config[providerConfig.keyField];
    });
  }
}

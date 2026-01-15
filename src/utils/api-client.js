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
   * Execute a chat completion request
   */
  async chatCompletion(params) {
    const {
      prompt,
      provider = this.config.defaultProvider,
      model = this.providers[provider]?.defaultModel,
      maxTokens = this.config.maxTokens,
      temperature = this.config.temperature
    } = params;

    // Try primary provider
    try {
      return await this.callProvider(provider, { prompt, model, maxTokens, temperature });
    } catch (error) {
      console.error(`${provider} failed:`, error.message);

      // Try fallback providers in aggressive mode
      if (this.config.mode === 'aggressive' && this.config.fallbackProviders?.length > 0) {
        for (const fallbackProvider of this.config.fallbackProviders) {
          try {
            console.log(`Trying fallback provider: ${fallbackProvider}`);
            return await this.callProvider(fallbackProvider, { prompt, model, maxTokens, temperature });
          } catch (fallbackError) {
            console.error(`${fallbackProvider} also failed:`, fallbackError.message);
          }
        }
      }

      throw new Error(`All providers failed. Last error: ${error.message}`);
    }
  }

  /**
   * Call a specific provider
   */
  async callProvider(provider, { prompt, model, maxTokens, temperature }) {
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
      body: JSON.stringify(body)
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

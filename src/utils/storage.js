/**
 * Storage Manager for Eigent Chrome Extension
 * Handles chrome.storage API for configuration and task history
 */

export class StorageManager {
  constructor() {
    this.storageArea = chrome.storage.local;
  }

  /**
   * Initialize storage with default configuration
   */
  async initialize() {
    const defaults = {
      config: {
        // API Keys
        anthropicApiKey: '',
        openaiApiKey: '',
        googleApiKey: '',
        groqApiKey: '',
        cerebrasApiKey: '',

        // Provider Settings
        defaultProvider: 'anthropic',
        fallbackProviders: ['groq', 'cerebras'],
        mode: 'standard', // 'standard' or 'aggressive'

        // Model Settings
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
        temperature: 0.7,

        // Execution Settings
        enableHumanInLoop: true,
        maxConcurrentAgents: 3,
        aggressiveParallelism: false,

        // Task Master Integration
        enableTaskMasterTracking: false,
        taskMasterProjectRoot: ''
      },
      agents: {
        developer: { enabled: true, permissions: ['scripting', 'activeTab'] },
        search: { enabled: true, permissions: ['activeTab'] },
        document: { enabled: true, permissions: ['downloads'] },
        multimodal: { enabled: true, permissions: ['activeTab'] }
      },
      tasks: [],
      mcpTools: []
    };

    const existing = await this.get('config');
    if (!existing.config) {
      await this.set(defaults);
      console.log('Eigent: Initialized with default configuration');
    }
  }

  /**
   * Get configuration
   */
  async getConfig() {
    const result = await this.get('config', 'agents');
    return {
      ...result.config,
      agents: result.agents
    };
  }

  /**
   * Update configuration
   */
  async updateConfig(updates) {
    const current = await this.getConfig();
    const updated = { ...current, ...updates };
    await this.set({ config: updated });
    return updated;
  }

  /**
   * Save task result
   */
  async saveTaskResult(taskId, result) {
    const data = await this.get('tasks');
    data.tasks = data.tasks || [];

    const taskRecord = {
      id: taskId,
      timestamp: Date.now(),
      ...result
    };

    data.tasks.unshift(taskRecord);

    // Keep only last 100 tasks
    if (data.tasks.length > 100) {
      data.tasks = data.tasks.slice(0, 100);
    }

    await this.set({ tasks: data.tasks });
    return taskRecord;
  }

  /**
   * Get task history
   */
  async getTaskHistory(limit = 20) {
    const result = await this.get('tasks');
    return (result.tasks || []).slice(0, limit);
  }

  /**
   * Get specific task
   */
  async getTask(taskId) {
    const tasks = await this.getTaskHistory(100);
    return tasks.find(t => t.id === taskId);
  }

  /**
   * Add MCP tool configuration
   */
  async addMCPTool(tool) {
    const result = await this.get('mcpTools');
    const tools = result.mcpTools || [];

    tools.push({
      id: `mcp_${Date.now()}`,
      ...tool,
      enabled: true
    });

    await this.set({ mcpTools: tools });
    return tools;
  }

  /**
   * Remove MCP tool
   */
  async removeMCPTool(toolId) {
    const result = await this.get('mcpTools');
    const tools = (result.mcpTools || []).filter(t => t.id !== toolId);
    await this.set({ mcpTools: tools });
    return tools;
  }

  /**
   * Generic get method
   */
  async get(...keys) {
    return new Promise((resolve) => {
      this.storageArea.get(keys, (result) => resolve(result));
    });
  }

  /**
   * Generic set method
   */
  async set(data) {
    return new Promise((resolve, reject) => {
      this.storageArea.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Clear all storage
   */
  async clear() {
    return new Promise((resolve) => {
      this.storageArea.clear(() => resolve());
    });
  }
}

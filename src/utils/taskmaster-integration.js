/**
 * Task Master Integration
 * Tracks tasks and syncs with Task Master system
 */

export class TaskMasterIntegration {
  constructor(config) {
    this.config = config;
    this.enabled = config.enableTaskMasterTracking;
    this.projectRoot = config.taskMasterProjectRoot;
  }

  /**
   * Log a task to Task Master
   */
  async logTask(task) {
    if (!this.enabled || !this.projectRoot) {
      return;
    }

    try {
      // This would integrate with Task Master's MCP or API
      // For now, we'll store it in extension storage
      const taskRecord = {
        eigentTaskId: task.id,
        taskMasterId: null, // Would be set by TM
        timestamp: Date.now(),
        type: task.type,
        status: task.status,
        agents: task.agents,
        prompt: task.content
      };

      await this.saveToTaskMasterLog(taskRecord);
      console.log('Task logged to Task Master:', task.id);
    } catch (error) {
      console.error('Failed to log to Task Master:', error);
    }
  }

  /**
   * Update task status in Task Master
   */
  async updateTaskStatus(taskId, status, result) {
    if (!this.enabled) {
      return;
    }

    const update = {
      eigentTaskId: taskId,
      status,
      timestamp: Date.now(),
      result: result ? {
        summary: result.summary,
        artifacts: result.artifacts?.length || 0
      } : null
    };

    await this.saveToTaskMasterLog(update);
  }

  /**
   * Save to Task Master log in storage
   */
  async saveToTaskMasterLog(record) {
    return new Promise((resolve) => {
      chrome.storage.local.get('taskMasterLog', (data) => {
        const log = data.taskMasterLog || [];
        log.push(record);

        // Keep last 50 entries
        if (log.length > 50) {
          log.shift();
        }

        chrome.storage.local.set({ taskMasterLog: log }, () => {
          resolve();
        });
      });
    });
  }

  /**
   * Get Task Master log
   */
  async getLog() {
    return new Promise((resolve) => {
      chrome.storage.local.get('taskMasterLog', (data) => {
        resolve(data.taskMasterLog || []);
      });
    });
  }

  /**
   * Enable Task Master tracking
   */
  async enable(projectRoot) {
    this.enabled = true;
    this.projectRoot = projectRoot;

    // Update config
    chrome.storage.local.get('config', (data) => {
      const config = data.config || {};
      config.enableTaskMasterTracking = true;
      config.taskMasterProjectRoot = projectRoot;
      chrome.storage.local.set({ config });
    });
  }

  /**
   * Disable Task Master tracking
   */
  async disable() {
    this.enabled = false;
    this.projectRoot = '';

    // Update config
    chrome.storage.local.get('config', (data) => {
      const config = data.config || {};
      config.enableTaskMasterTracking = false;
      chrome.storage.local.set({ config });
    });
  }
}

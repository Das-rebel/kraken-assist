/**
 * Agent Orchestrator - Coordinates multiple AI agents
 * Breaks down tasks and delegates to specialized agents
 */

import { DeveloperAgent } from './developer.js';
import { SearchAgent } from './search.js';
import { DocumentAgent } from './document.js';
import { MultiModalAgent } from './multimodal.js';

export class AgentOrchestrator {
  constructor(config) {
    this.config = config;
    this.agents = {
      developer: new DeveloperAgent(config),
      search: new SearchAgent(config),
      document: new DocumentAgent(config),
      multimodal: new MultiModalAgent(config)
    };
    this.activeTasks = new Map();
  }

  /**
   * Execute a task using appropriate agents with timeout protection
   */
  async executeTask(task, callbacks = {}) {
    const { taskId, onProgress } = callbacks;
    const timeout = 60000; // 60 second total timeout
    const controller = new AbortController();

    try {
      // Store task for cancellation
      this.activeTasks.set(taskId, { controller, task, status: 'running' });

      // Create timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          controller.abort();
          reject(new Error(`Task execution timeout after ${timeout}ms`));
        }, timeout);
      });

      // Execute task with timeout protection
      const result = await Promise.race([
        this.executeTaskInternal(task, callbacks, controller.signal),
        timeoutPromise
      ]);

      this.activeTasks.set(taskId, { ...this.activeTasks.get(taskId), status: 'complete' });
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        onProgress?.({ stage: 'cancelled', message: 'Task was cancelled' });
        throw new Error('Task cancelled by user or timeout');
      }
      onProgress?.({ stage: 'error', message: error.message });
      throw error;
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Internal task execution with signal support
   */
  async executeTaskInternal(task, callbacks, signal) {
    const { onProgress } = callbacks;

    if (signal?.aborted) {
      throw new Error('Task aborted before execution');
    }

    // Analyze task and determine which agents to use
    const taskPlan = await this.planTaskExecution(task);
    onProgress?.({ stage: 'planning', message: 'Task analysis complete' });

    if (signal?.aborted) throw new Error('Task aborted during planning');

    // Execute agents in parallel or sequence based on dependencies
    const results = await this.runAgents(taskPlan, task, {
      onProgress: (update) => {
        onProgress?.({
          stage: 'execution',
          agent: update.agent,
          message: update.message
        });
      },
      signal
    });

    if (signal?.aborted) throw new Error('Task aborted during execution');

    // Synthesize results
    const finalResult = await this.synthesizeResults(results, task);
    onProgress?.({ stage: 'complete', message: 'Task completed successfully' });

    return finalResult;
  }

  /**
   * Plan which agents to use for a task
   */
  async planTaskExecution(task) {
    const { type, content, requirements = [] } = task;
    const plan = {
      agents: [],
      executionMode: 'parallel',
      dependencies: []
    };

    // Analyze task requirements
    const needsCode = /code|program|script|function|debug|implement/i.test(content);
    const needsSearch = /research|find|search|look up|investigate/i.test(content);
    const needsDocument = /document|report|write|create|generate.*file/i.test(content);
    const needsAnalysis = /analyze|summarize|extract|process/i.test(content);

    // Determine required agents
    if (needsCode || type === 'developer') {
      plan.agents.push('developer');
    }
    if (needsSearch || type === 'search') {
      plan.agents.push('search');
    }
    if (needsDocument || type === 'document') {
      plan.agents.push('document');
    }
    if (needsAnalysis || type === 'multimodal') {
      plan.agents.push('multimodal');
    }

    // Default to multimodal if no specific type
    if (plan.agents.length === 0) {
      plan.agents.push('multimodal');
    }

    // Check dependencies
    if (plan.agents.includes('search') && plan.agents.includes('document')) {
      plan.executionMode = 'sequential';
      plan.dependencies.push({ from: 'search', to: 'document' });
    }

    return plan;
  }

  /**
   * Run agents based on plan with cancellation support
   */
  async runAgents(plan, task, callbacks) {
    const results = new Map();
    const { signal } = callbacks;

    if (plan.executionMode === 'parallel') {
      // Run agents in parallel with individual error handling
      const agentPromises = plan.agents.map(async (agentType) => {
        if (signal?.aborted) {
          throw new Error(`Agent ${agentType} aborted`);
        }

        callbacks?.onProgress({
          agent: agentType,
          message: 'Starting work...'
        });

        try {
          const agent = this.agents[agentType];

          // Add timeout per agent (30 seconds)
          const agentTimeout = 30000;
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Agent ${agentType} timeout`)), agentTimeout);
          });

          const result = await Promise.race([
            agent.execute(task),
            timeoutPromise
          ]);

          results.set(agentType, result);

          callbacks?.onProgress({
            agent: agentType,
            message: 'Complete'
          });

          return { agentType, result, success: true };
        } catch (error) {
          callbacks?.onProgress({
            agent: agentType,
            message: `Failed: ${error.message}`
          });

          // Store error but don't fail entire task
          results.set(agentType, { error: error.message, success: false });
          return { agentType, error: error.message, success: false };
        }
      });

      // Use allSettled to ensure all agents complete or fail
      await Promise.all(agentPromises);
    } else {
      // Run agents sequentially based on dependencies
      for (const agentType of plan.agents) {
        if (signal?.aborted) {
          throw new Error('Sequential execution aborted');
        }

        callbacks?.onProgress({
          agent: agentType,
          message: 'Starting work...'
        });

        const agent = this.agents[agentType];

        // Pass results from previous agents
        const enhancedTask = {
          ...task,
          context: {
            ...task.context,
            previousResults: Array.from(results.values())
          }
        };

        try {
          // Add timeout per agent (30 seconds)
          const agentTimeout = 30000;
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Agent ${agentType} timeout`)), agentTimeout);
          });

          const result = await Promise.race([
            agent.execute(enhancedTask),
            timeoutPromise
          ]);

          results.set(agentType, result);

          callbacks?.onProgress({
            agent: agentType,
            message: 'Complete'
          });
        } catch (error) {
          results.set(agentType, { error: error.message, success: false });
          callbacks?.onProgress({
            agent: agentType,
            message: `Failed: ${error.message}`
          });

          // Continue with next agent even if this one failed
          console.warn(`Agent ${agentType} failed, continuing with remaining agents:`, error.message);
        }
      }
    }

    return results;
  }

  /**
   * Synthesize results from multiple agents
   */
  async synthesizeResults(results, originalTask) {
    const synthesis = {
      taskId: originalTask.taskId || `task_${Date.now()}`,
      timestamp: Date.now(),
      task: originalTask.content || originalTask.type,
      agentResults: {},
      summary: '',
      artifacts: []
    };

    // Compile results from each agent
    for (const [agentType, result] of results.entries()) {
      synthesis.agentResults[agentType] = result;

      if (result.artifacts) {
        synthesis.artifacts.push(...result.artifacts);
      }
    }

    // Generate summary
    if (results.size === 1) {
      const singleResult = Array.from(results.values())[0];
      synthesis.summary = singleResult.summary || singleResult.output || 'Task completed';
    } else {
      synthesis.summary = `Task completed with ${results.size} agents:\n` +
        Array.from(results.keys())
          .map(agent => `  - ${agent}: ${results.get(agent).status || 'complete'}`)
          .join('\n');
    }

    return synthesis;
  }

  /**
   * Get status of a running task
   */
  async getTaskStatus(taskId) {
    return this.activeTasks.get(taskId) || { status: 'not_found' };
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId) {
    const task = this.activeTasks.get(taskId);
    if (task && task.controller) {
      task.controller.abort();
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Get list of available agents
   */
  getAvailableAgents() {
    return Object.keys(this.agents).map(key => ({
      id: key,
      name: this.agents[key].name,
      description: this.agents[key].description,
      enabled: this.config.agents?.[key]?.enabled !== false
    }));
  }
}

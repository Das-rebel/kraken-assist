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
   * Execute a task using appropriate agents
   */
  async executeTask(task, callbacks = {}) {
    const { taskId, onProgress } = callbacks;

    try {
      // Analyze task and determine which agents to use
      const taskPlan = await this.planTaskExecution(task);
      onProgress?.({ stage: 'planning', message: 'Task analysis complete' });

      // Execute agents in parallel or sequence based on dependencies
      const results = await this.runAgents(taskPlan, task, {
        onProgress: (update) => {
          onProgress?.({
            stage: 'execution',
            agent: update.agent,
            message: update.message
          });
        }
      });

      // Synthesize results
      const finalResult = await this.synthesizeResults(results, task);
      onProgress?.({ stage: 'complete', message: 'Task completed successfully' });

      return finalResult;
    } catch (error) {
      onProgress?.({ stage: 'error', message: error.message });
      throw error;
    }
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
   * Run agents based on plan
   */
  async runAgents(plan, task, callbacks) {
    const results = new Map();

    if (plan.executionMode === 'parallel') {
      // Run agents in parallel
      const agentPromises = plan.agents.map(async (agentType) => {
        callbacks?.onProgress({
          agent: agentType,
          message: 'Starting work...'
        });

        const agent = this.agents[agentType];
        const result = await agent.execute(task);
        results.set(agentType, result);

        callbacks?.onProgress({
          agent: agentType,
          message: 'Complete'
        });

        return { agentType, result };
      });

      await Promise.all(agentPromises);
    } else {
      // Run agents sequentially based on dependencies
      for (const agentType of plan.agents) {
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

        const result = await agent.execute(enhancedTask);
        results.set(agentType, result);

        callbacks?.onProgress({
          agent: agentType,
          message: 'Complete'
        });
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

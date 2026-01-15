/**
 * Eigent Chrome Extension - Background Service Worker
 * Orchestrates multi-agent workforce for task execution
 */

import { AgentOrchestrator } from './src/agents/orchestrator.js';
import { StorageManager } from './src/utils/storage.js';

// Initialize core services
let orchestrator;
let storageManager;

// Extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Eigent installed:', details.reason);

  if (details.reason === 'install') {
    // First-time setup
    await storageManager.initialize();
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html')
    });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  switch (message.action) {
    case 'executeTask':
      handleTaskExecution(message.task).then(sendResponse);
      return true; // async response

    case 'getTaskStatus':
      getTaskStatus(message.taskId).then(sendResponse);
      return true;

    case 'cancelTask':
      cancelTask(message.taskId).then(sendResponse);
      return true;

    case 'getAgents':
      getAvailableAgents().then(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

/**
 * Execute a task using the multi-agent workforce
 */
async function handleTaskExecution(task) {
  try {
    // Initialize orchestrator if not exists
    if (!orchestrator) {
      const config = await storageManager.getConfig();
      orchestrator = new AgentOrchestrator(config);
    }

    // Generate unique task ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Execute task with appropriate agents
    const result = await orchestrator.executeTask(task, {
      taskId,
      onProgress: (update) => {
        // Send progress updates to popup
        chrome.runtime.sendMessage({
          action: 'taskProgress',
          taskId,
          update
        });
      }
    });

    // Store task result
    await storageManager.saveTaskResult(taskId, result);

    return {
      success: true,
      taskId,
      result
    };
  } catch (error) {
    console.error('Task execution error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get status of a running task
 */
async function getTaskStatus(taskId) {
  if (!orchestrator) {
    return { error: 'Orchestrator not initialized' };
  }

  const status = await orchestrator.getTaskStatus(taskId);
  return status;
}

/**
 * Cancel a running task
 */
async function cancelTask(taskId) {
  if (!orchestrator) {
    return { success: false, error: 'Orchestrator not initialized' };
  }

  await orchestrator.cancelTask(taskId);
  return { success: true };
}

/**
 * Get list of available agents
 */
async function getAvailableAgents() {
  if (!orchestrator) {
    const config = await storageManager.getConfig();
    orchestrator = new AgentOrchestrator(config);
  }

  return {
    agents: orchestrator.getAvailableAgents()
  };
}

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'eigent-execute-with-developer',
    title: 'Execute with Developer Agent',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'eigent-search-with-agent',
    title: 'Research with Search Agent',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'eigent-summarize',
    title: 'Summarize with Multi-Modal Agent',
    contexts: ['selection', 'page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const task = {
    type: info.menuItemId,
    content: info.selectionText || tab.url,
    context: { tabId: tab.id, url: tab.url }
  };

  chrome.tabs.sendMessage(tab.id, {
    action: 'showAgentOverlay',
    task
  });
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  storageManager = new StorageManager();
  await storageManager.initialize();
});

/**
 * Popup UI Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const taskInput = document.getElementById('taskInput');
  const executeBtn = document.getElementById('executeBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const setupBtn = document.getElementById('setupBtn');
  const setupPrompt = document.getElementById('setupPrompt');
  const activeTasks = document.getElementById('activeTasks');
  const taskList = document.getElementById('taskList');

  // Check if configured
  const config = await chrome.storage.local.get('config');
  if (!config.config?.anthropicApiKey) {
    setupPrompt.classList.remove('hidden');
    taskInput.disabled = true;
    executeBtn.disabled = true;
  }

  // Load active tasks
  await loadActiveTasks();

  // Event listeners
  executeBtn.addEventListener('click', executeTask);
  settingsBtn.addEventListener('click', openSettings);
  setupBtn.addEventListener('click', openSettings);

  // Listen for task updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'taskProgress') {
      updateTaskProgress(message.taskId, message.update);
    }
  });
});

async function executeTask() {
  const taskInput = document.getElementById('taskInput');
  const executeBtn = document.getElementById('executeBtn');
  const task = taskInput.value.trim();

  if (!task) {
    alert('Please enter a task');
    return;
  }

  // Get selected agents
  const selectedAgents = [];
  if (document.getElementById('agent-developer').checked) selectedAgents.push('developer');
  if (document.getElementById('agent-search').checked) selectedAgents.push('search');
  if (document.getElementById('agent-document').checked) selectedAgents.push('document');
  if (document.getElementById('agent-multimodal').checked) selectedAgents.push('multimodal');

  if (selectedAgents.length === 0) {
    alert('Please select at least one agent');
    return;
  }

  // Disable button
  executeBtn.disabled = true;
  executeBtn.textContent = 'Starting...';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'executeTask',
      task: {
        content: task,
        agents: selectedAgents,
        options: {
          humanInLoop: document.getElementById('humanInLoop').checked,
          parallel: document.getElementById('parallelMode').checked
        }
      }
    });

    if (response.success) {
      // Clear input
      taskInput.value = '';

      // Show task in list
      await loadActiveTasks();

      // Show notification
      showNotification('Task started!', 'success');
    } else {
      showNotification(response.error || 'Task failed to start', 'error');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    executeBtn.disabled = false;
    executeBtn.innerHTML = '<span class="btn-text">Execute Task</span><span class="btn-icon">→</span>';
  }
}

async function loadActiveTasks() {
  const taskList = document.getElementById('taskList');
  const activeTasksSection = document.getElementById('activeTasks');

  const data = await chrome.storage.local.get('tasks');
  const tasks = data.tasks || [];

  if (tasks.length === 0) {
    activeTasksSection.classList.add('hidden');
    return;
  }

  activeTasksSection.classList.remove('hidden');

  // Show last 5 tasks
  const recentTasks = tasks.slice(0, 5);

  taskList.innerHTML = recentTasks.map(task => `
    <div class="task-item" data-task-id="${task.id}">
      <div class="task-header">
        <div class="task-title">${task.task || 'Untitled Task'}</div>
        <div class="task-status">${task.status || 'Complete'}</div>
      </div>
      <div class="task-progress">${task.summary || 'Task completed'}</div>
    </div>
  `).join('');
}

function updateTaskProgress(taskId, update) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  if (taskElement) {
    const progressElement = taskElement.querySelector('.task-progress');
    progressElement.textContent = update.message;
  }
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

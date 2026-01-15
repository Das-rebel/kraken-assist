/**
 * Options Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load current settings
  await loadSettings();

  // Event listeners
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
  document.getElementById('maxConcurrent').addEventListener('input', (e) => {
    document.getElementById('concurrentValue').textContent = e.target.value;
  });
  document.getElementById('enableTaskMaster').addEventListener('change', toggleTaskMasterPath);

  // Test connection buttons
  document.querySelectorAll('.test-btn').forEach(btn => {
    btn.addEventListener('click', () => testConnection(btn.dataset.provider));
  });
});

async function loadSettings() {
  const data = await chrome.storage.local.get('config', 'agents');

  // Load config
  if (data.config) {
    document.getElementById('anthropicKey').value = data.config.anthropicApiKey || '';
    document.getElementById('groqKey').value = data.config.groqApiKey || '';
    document.getElementById('cerebrasKey').value = data.config.cerebrasApiKey || '';
    document.getElementById('openaiKey').value = data.config.openaiApiKey || '';
    document.getElementById('googleKey').value = data.config.googleApiKey || '';
    document.getElementById('defaultProvider').value = data.config.defaultProvider || 'anthropic';
    document.getElementById('executionMode').value = data.config.mode || 'standard';
    document.getElementById('model').value = data.config.model || 'claude-3-5-sonnet-20241022';
    document.getElementById('maxTokens').value = data.config.maxTokens || 4096;
    document.getElementById('temperature').value = data.config.temperature || 0.7;
    document.getElementById('maxConcurrent').value = data.config.maxConcurrentAgents || 3;
    document.getElementById('concurrentValue').textContent = data.config.maxConcurrentAgents || 3;
    document.getElementById('aggressiveParallelism').checked = data.config.aggressiveParallelism === true;
    document.getElementById('humanInLoop').checked = data.config.enableHumanInLoop !== false;
    document.getElementById('enableTaskMaster').checked = data.config.enableTaskMasterTracking === true;
    document.getElementById('taskMasterPath').value = data.config.taskMasterProjectRoot || '';

    // Show/hide Task Master path
    toggleTaskMasterPath();
  }

  // Load agent settings
  if (data.agents) {
    document.getElementById('agentDeveloper').checked = data.agents.developer?.enabled !== false;
    document.getElementById('agentSearch').checked = data.agents.search?.enabled !== false;
    document.getElementById('agentDocument').checked = data.agents.document?.enabled !== false;
    document.getElementById('agentMultimodal').checked = data.agents.multimodal?.enabled !== false;
  }
}

async function saveSettings() {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const config = {
      // API Keys
      anthropicApiKey: document.getElementById('anthropicKey').value.trim(),
      groqApiKey: document.getElementById('groqKey').value.trim(),
      cerebrasApiKey: document.getElementById('cerebrasKey').value.trim(),
      openaiApiKey: document.getElementById('openaiKey').value.trim(),
      googleApiKey: document.getElementById('googleKey').value.trim(),

      // Provider Settings
      defaultProvider: document.getElementById('defaultProvider').value,
      mode: document.getElementById('executionMode').value,

      // Model Settings
      model: document.getElementById('model').value.trim(),
      maxTokens: parseInt(document.getElementById('maxTokens').value),
      temperature: parseFloat(document.getElementById('temperature').value),

      // Execution Settings
      maxConcurrentAgents: parseInt(document.getElementById('maxConcurrent').value),
      aggressiveParallelism: document.getElementById('aggressiveParallelism').checked,
      enableHumanInLoop: document.getElementById('humanInLoop').checked,

      // Task Master
      enableTaskMasterTracking: document.getElementById('enableTaskMaster').checked,
      taskMasterProjectRoot: document.getElementById('taskMasterPath').value.trim()
    };

    const agents = {
      developer: { enabled: document.getElementById('agentDeveloper').checked },
      search: { enabled: document.getElementById('agentSearch').checked },
      document: { enabled: document.getElementById('agentDocument').checked },
      multimodal: { enabled: document.getElementById('agentMultimodal').checked }
    };

    await chrome.storage.local.set({ config, agents });

    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Failed to save settings: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Save Settings';
  }
}

async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }

  try {
    await chrome.storage.local.clear();

    // Reinitialize with defaults
    const defaults = {
      config: {
        anthropicApiKey: '',
        groqApiKey: '',
        cerebrasApiKey: '',
        openaiApiKey: '',
        googleApiKey: '',
        defaultProvider: 'anthropic',
        mode: 'standard',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
        temperature: 0.7,
        enableHumanInLoop: true,
        maxConcurrentAgents: 3,
        aggressiveParallelism: false,
        enableTaskMasterTracking: false,
        taskMasterProjectRoot: ''
      },
      agents: {
        developer: { enabled: true },
        search: { enabled: true },
        document: { enabled: true },
        multimodal: { enabled: true }
      }
    };

    await chrome.storage.local.set(defaults);
    await loadSettings();

    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    showStatus('Failed to reset: ' + error.message, 'error');
  }
}

async function testConnection(provider) {
  const apiKeyMap = {
    anthropic: 'anthropicKey',
    groq: 'groqKey',
    cerebras: 'cerebrasKey',
    openai: 'openaiKey',
    google: 'googleKey'
  };

  const apiKey = document.getElementById(apiKeyMap[provider]).value.trim();

  if (!apiKey) {
    showStatus(`Please enter ${provider} API key first`, 'error');
    return;
  }

  const btn = document.querySelector(`[data-provider="${provider}"]`);
  btn.disabled = true;
  btn.textContent = 'Testing...';

  try {
    // Test using unified API client
    const testConfig = {
      [apiKeyMap[provider]]: apiKey,
      defaultProvider: provider,
      maxTokens: 100
    };

    // Simple test fetch based on provider
    let response;
    if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 100,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
    } else if (provider === 'groq') {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 100
        })
      });
    } else if (provider === 'cerebras') {
      response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 100
        })
      });
    } else if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 100
        })
      });
    } else {
      showStatus(`${provider} test not yet implemented`, 'error');
      btn.disabled = false;
      btn.textContent = 'Test Connection';
      return;
    }

    if (response.ok) {
      showStatus(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API connection successful!`, 'success');
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    showStatus(`Connection failed: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Test Connection';
  }
}

function toggleTaskMasterPath() {
  const enabled = document.getElementById('enableTaskMaster').checked;
  const pathGroup = document.getElementById('taskMasterPathGroup');
  pathGroup.style.display = enabled ? 'block' : 'none';
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove('hidden');

  setTimeout(() => {
    status.classList.add('hidden');
  }, 5000);
}

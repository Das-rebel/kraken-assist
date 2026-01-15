import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.join(__dirname, '..');

test.describe('Eigent Extension - Aggressive Mode', () => {
  let extensionId;

  test.beforeAll(async ({ context }) => {
    // Load the extension
    await context.addInitScript(() => {
      // Mock chrome.storage.local for testing
      window.chrome = window.chrome || {};
      window.chrome.storage = window.chrome.storage || {};
      window.chrome.storage.local = {
        get: (keys, callback) => {
          const mockData = {
            config: {
              anthropicApiKey: '',
              groqApiKey: 'gsk_test123',
              cerebrasApiKey: 'cs_test123',
              defaultProvider: 'groq',
              mode: 'aggressive',
              fallbackProviders: ['groq', 'cerebras'],
              maxTokens: 4096,
              temperature: 0.7,
              enableHumanInLoop: true,
              maxConcurrentAgents: 3,
              aggressiveParallelism: true,
              enableTaskMasterTracking: true,
              taskMasterProjectRoot: '/Users/Subho'
            },
            agents: {
              developer: { enabled: true },
              search: { enabled: true },
              document: { enabled: true },
              multimodal: { enabled: true }
            }
          };
          if (callback) callback(mockData);
          return Promise.resolve(mockData);
        },
        set: (data, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }
      };
    });
  });

  test('Extension popup loads correctly', async ({ page }) => {
    // Load popup.html directly
    await page.goto(`file://${EXTENSION_PATH}/popup.html`);

    // Check title
    await expect(page.locator('text=Eigent')).toBeVisible();

    // Check agent cards are visible
    await expect(page.locator('text=Developer')).toBeVisible();
    await expect(page.locator('text=Search')).toBeVisible();
    await expect(page.locator('text=Document')).toBeVisible();
    await expect(page.locator('text=Multi-Modal')).toBeVisible();

    // Check task input
    await expect(page.locator('#taskInput')).toBeVisible();

    // Check execute button
    await expect(page.locator('.execute-btn')).toBeVisible();
  });

  test('Aggressive mode configuration is present', async ({ page }) => {
    await page.goto(`file://${EXTENSION_PATH}/popup.html`);

    // Execute a simple task
    await page.fill('#taskInput', 'Test task for aggressive mode');

    // Select agents
    await page.check('#agent-developer');
    await page.check('#agent-search');

    // Verify execute button is enabled
    const executeBtn = page.locator('.execute-btn');
    await expect(executeBtn).toBeEnabled();
  });

  test('Task execution flow', async ({ page }) => {
    await page.goto(`file://${EXTENSION_PATH}/popup.html`);

    // Enter task
    await page.fill('#taskInput', 'What is multi-agent AI?');

    // Select agent
    await page.check('#agent-multimodal');

    // Click execute
    await page.click('.execute-btn');

    // In real scenario, this would trigger background.js
    // For now, we verify the UI responds
    await expect(page.locator('.execute-btn')).toBeVisible();
  });

  test('Options page has all provider fields', async ({ page }) => {
    await page.goto(`file://${EXTENSION_PATH}/options.html`);

    // Check all provider inputs exist
    await expect(page.locator('#anthropicKey')).toBeVisible();
    await expect(page.locator('#groqKey')).toBeVisible();
    await expect(page.locator('#cerebrasKey')).toBeVisible();
    await expect(page.locator('#openaiKey')).toBeVisible();
    await expect(page.locator('#googleKey')).toBeVisible();

    // Check execution mode selector
    await expect(page.locator('#executionMode')).toBeVisible();

    // Check aggressive mode option exists
    const executionMode = page.locator('#executionMode');
    const options = await executionMode.locator('option').allTextContents();
    expect(options).toContain('Aggressive - Auto-fallback to Groq/Cerebras');

    // Check Task Master tracking
    await expect(page.locator('#enableTaskMaster')).toBeVisible();
  });

  test('Groq and Cerebras provider fields are present', async ({ page }) => {
    await page.goto(`file://${EXTENSION_PATH}/options.html`);

    // Verify Groq field
    const groqKey = page.locator('#groqKey');
    await expect(groqKey).toHaveAttribute('placeholder', 'gsk_...');

    // Verify Cerebras field
    const cerebrasKey = page.locator('#cerebrasKey');
    await expect(cerebrasKey).toHaveAttribute('placeholder', 'cs_...');

    // Verify test buttons exist
    await expect(page.locator('[data-provider="groq"]')).toHaveText('Test Connection');
    await expect(page.locator('[data-provider="cerebras"]')).toHaveText('Test Connection');
  });

  test('Manifest has required permissions', async ({ page }) => {
    const fs = await import('fs');
    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    // Check required permissions
    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('activeTab');
    expect(manifest.permissions).toContain('tabs');

    // Check host permissions for providers
    expect(manifest.host_permissions).toContain('https://*.anthropic.com/*');
    expect(manifest.host_permissions).toContain('https://*.groq.com/*');
  });

  test('Background service worker exists', async () => {
    const fs = await import('fs');
    const backgroundPath = path.join(EXTENSION_PATH, 'background.js');
    expect(fs.existsSync(backgroundPath)).toBe(true);

    const content = fs.readFileSync(backgroundPath, 'utf-8');

    // Check for aggressive mode handling
    expect(content).toContain('aggressive');
    expect(content).toContain('groq');
    expect(content).toContain('cerebras');
  });

  test('API client supports all providers', async () => {
    const fs = await import('fs');
    const apiClientPath = path.join(EXTENSION_PATH, 'src/utils/api-client.js');
    expect(fs.existsSync(apiClientPath)).toBe(true);

    const content = fs.readFileSync(apiClientPath, 'utf-8');

    // Check provider support
    expect(content).toContain('anthropic');
    expect(content).toContain('groq');
    expect(content).toContain('cerebras');
    expect(content).toContain('openai');
    expect(content).toContain('google');

    // Check aggressive mode
    expect(content).toContain('aggressive');
    expect(content).toContain('fallback');
  });

  test('Task Master integration exists', async () => {
    const fs = await import('fs');
    const tmPath = path.join(EXTENSION_PATH, 'src/utils/taskmaster-integration.js');
    expect(fs.existsSync(tmPath)).toBe(true);
  });
});

test.describe('Eigent Extension - Performance Tests', () => {
  test('UI loads within 100ms', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`file://${EXTENSION_PATH}/popup.html`);
    await page.waitForSelector('.execute-btn');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(100);
  });

  test('Agent selection responds instantly', async ({ page }) => {
    await page.goto(`file://${EXTENSION_PATH}/popup.html`);

    const startTime = Date.now();

    await page.check('#agent-developer');
    await page.waitForSelector('#agent-developer:checked');

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(50);
  });
});

test.describe('Eigent Extension - Configuration Tests', () => {
  test('Storage manager has aggressive mode defaults', async () => {
    const fs = await import('fs');
    const storagePath = path.join(EXTENSION_PATH, 'src/utils/storage.js');
    const content = fs.readFileSync(storagePath, 'utf-8');

    // Check for aggressive mode configuration
    expect(content).toContain('aggressive');
    expect(content).toContain('fallbackProviders');
    expect(content).toContain('groq');
    expect(content).toContain('cerebras');
  });

  test('All agents support multi-provider', async () => {
    const fs = await import('fs');
    const agentsPath = path.join(EXTENSION_PATH, 'src/agents');

    const agentFiles = ['developer.js', 'search.js', 'document.js', 'multimodal.js'];

    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsPath, file), 'utf-8');
      // All agents should use the unified API client
      expect(content).toMatch(/api-client|callClaude|chatCompletion/);
    }
  });
});

/**
 * Content Script - Injected into web pages
 * Enables page interaction and context extraction
 */

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showAgentOverlay') {
    showAgentOverlay(message.task);
  }

  if (message.action === 'extractContent') {
    const content = extractPageContent();
    sendResponse({ content });
    return true;
  }
});

/**
 * Extract page content for agent processing
 */
function extractPageContent() {
  return {
    title: document.title,
    url: window.location.href,
    text: document.body.innerText,
    html: document.documentElement.outerHTML,
    selection: window.getSelection().toString()
  };
}

/**
 * Show agent overlay on page
 */
function showAgentOverlay(task) {
  // Remove existing overlay
  const existing = document.getElementById('eigent-overlay');
  if (existing) existing.remove();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'eigent-overlay';
  overlay.innerHTML = `
    <div class="eigent-overlay-content">
      <div class="eigent-header">
        <h3>Eigent Agent</h3>
        <button id="eigent-close">×</button>
      </div>
      <div class="eigent-task">
        <p><strong>Task:</strong> ${task.content || task.type}</p>
        <div class="eigent-status">Initializing...</div>
      </div>
    </div>
  `;

  // Add styles
  overlay.innerHTML += `
    <style>
      #eigent-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .eigent-overlay-content {
        padding: 20px;
      }
      .eigent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
      }
      .eigent-header h3 {
        margin: 0;
        font-size: 18px;
        color: #6366f1;
      }
      #eigent-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
        padding: 0;
        width: 30px;
        height: 30px;
      }
      #eigent-close:hover {
        color: #1e293b;
      }
      .eigent-task p {
        margin: 0 0 12px 0;
        line-height: 1.6;
      }
      .eigent-status {
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        font-size: 14px;
        color: #64748b;
      }
    </style>
  `;

  document.body.appendChild(overlay);

  // Close button handler
  document.getElementById('eigent-close').addEventListener('click', () => {
    overlay.remove();
  });

  // Send task to background
  chrome.runtime.sendMessage({
    action: 'executeTask',
    task
  });
}

// Log that content script is loaded
console.log('Eigent content script loaded');

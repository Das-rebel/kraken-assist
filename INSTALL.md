# Eigent Chrome Extension - Installation Guide

## Quick Installation (5 minutes)

### Prerequisites
- Chrome or Brave browser
- Anthropic API key (get free at https://console.anthropic.com)

### Installation Steps

#### 1. Open Extension Management Page
- **Chrome**: Type `chrome://extensions` in address bar
- **Brave**: Type `brave://extensions` in address bar

#### 2. Enable Developer Mode
- Look for toggle switch in top-right corner
- Enable "Developer mode"
- You should see additional buttons appear

#### 3. Load the Extension
- Click "Load unpacked" button
- Navigate to folder: `~/eigent-chrome-extension`
  - Or: `/Users/Subho/eigent-chrome-extension`
- Click "Select"

#### 4. Pin the Extension (Optional)
- Click puzzle piece icon in browser toolbar
- Find "Eigent"
- Click pin icon to keep it visible

## First-Time Setup

### 1. Get Your API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### 2. Configure Extension
1. Click Eigent extension icon
2. Click ⚙️ settings icon
3. Paste your Anthropic API key
4. Click "Test Connection"
5. Should see: "Anthropic API connection successful!"
6. Click "Save Settings"

## Icon Setup (If Needed)

If the extension shows a default icon instead of the Eigent logo:

### Option 1: Use Online Tool
1. Open `create_icons.html` in your browser
2. Open browser console (F12 → Console tab)
3. Type: `createAllIcons()`
4. Press Enter
5. Move downloaded PNG files to `icons/` folder
6. Reload extension in chrome://extensions

### Option 2: Manual Icons
The extension will work with default browser icons if needed.

## Verify Installation

1. Click the Eigent icon in toolbar
2. You should see:
   - Logo at top
   - 4 agent cards (Developer, Search, Document, Multi-Modal)
   - Task input box
   - "Execute Task" button
3. If you see "Setup Required", configure your API key

## Test Your First Task

1. In the task box, type:
   ```
   What are three benefits of using AI agents for productivity?
   ```

2. Keep "Multi-Modal" agent checked

3. Click "Execute Task"

4. Wait for the agent to process and respond

## Usage Tips

### Right-Click Context Menu
- Select text on any webpage
- Right-click → Choose an agent action
- Quick processing without opening popup

### Task Examples

**Research Task:**
```
Search for recent developments in quantum computing and summarize key findings
```
→ Use "Search" agent

**Code Task:**
```
Write a Python function to sort a list of dictionaries by a specific key
```
→ Use "Developer" agent

**Document Task:**
```
Create a professional report about the benefits of remote work
```
→ Use "Document" agent

**Analysis Task:**
```
Analyze this webpage and extract the main topics: [paste content]
```
→ Use "Multi-Modal" agent

### Multiple Agents
For complex tasks, select multiple agents:
- Search + Document: Research and create report
- Developer + Multi-Modal: Code with explanations

## Troubleshooting

### "Extension not loading"
- Make sure Developer Mode is ON
- Check path is correct: `/Users/Subho/eigent-chrome-extension`
- Try removing and re-adding extension
- Check browser console (F12) for errors

### "Setup Required" message
- Click "Open Settings"
- Add your Anthropic API key
- Save settings

### "API connection failed"
- Verify API key is correct (starts with `sk-ant-`)
- Check you have credits at console.anthropic.com
- Try "Test Connection" button in settings

### "Task execution failed"
- Check browser console (F12) for error details
- Ensure API key is configured
- Try a simpler task first
- Check that agents are enabled in settings

### Nothing happens when clicking Execute
- Open DevTools (F12) → Console tab
- Look for red error messages
- Try reloading the extension
- Check internet connection

## Advanced Configuration

### Adjust Model Settings
In Settings → Model Settings:
- Model: Use claude-3-5-sonnet-20241022 (recommended)
- Max Tokens: 4096 (good balance)
- Temperature: 0.7 (balanced creativity)

### Performance Tuning
In Settings → Performance:
- Max Concurrent Agents: 3 (default)
- Increase for faster execution (requires more API calls)
- Decrease to save API costs

### Agent Preferences
Enable/disable agents in Settings → Agents
- Turn off unused agents to simplify UI
- Keep all enabled for maximum flexibility

## Security & Privacy

✅ API keys stored locally in browser
✅ No data sent to third-party servers
✅ Only communicates with configured AI APIs
✅ Content scripts inject only on user action
✅ Open source - inspect the code anytime

## Next Steps

1. ✅ Install extension
2. ✅ Configure API key
3. ✅ Test with simple task
4. 📖 Read full README.md
5. 🚀 Explore advanced features

## Support & Documentation

- **Full README**: See README.md in extension folder
- **Original Project**: https://github.com/eigent-ai/eigent
- **API Support**: https://console.anthropic.com

## Uninstallation

To remove the extension:
1. Go to `chrome://extensions`
2. Find "Eigent - Multi-Agent Workforce"
3. Click "Remove"
4. Confirm removal

Your API keys and data will be cleared from browser storage.

---

**Ready to boost your productivity with AI agents?** 🚀

Install now and start automating your workflows!

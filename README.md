# Kraken Assist Chrome Extension

Multi-agent AI assistant for Chrome/Brave browser with aggressive mode and multi-provider support

## Features

🤖 **Multi-Agent System** - Coordinate multiple AI agents for complex tasks
- Developer Agent: Code execution and scripting
- Search Agent: Web research and content extraction
- Document Agent: File creation and management
- Multi-Modal Agent: Image processing and analysis

⚡ **Parallel Execution** - Run multiple agents simultaneously
🔌 **MCP Integration** - Extensible tool system (planned)
✋ **Human-in-the-Loop** - Request human input when needed
🔒 **Privacy First** - Local processing with API keys stored in browser

## Installation

### Chrome/Brave

1. **Clone or download this repository**
   ```bash
   cd ~/kraken-assist
   ```

2. **Open Extension Management**
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `kraken-assist` folder

5. **Configure API Keys**
   - Click the Kraken Assist icon in your browser toolbar
   - Click the settings (⚙️) icon
   - Add your Anthropic API key (get one at https://console.anthropic.com)
   - Click "Test Connection" to verify
   - Click "Save Settings"

## Usage

### Quick Start

1. **Open the Popup**
   - Click the Kraken Assist icon in your browser toolbar

2. **Select Agents**
   - Choose which agents to use for your task
   - Developer: Code-related tasks
   - Search: Web research
   - Document: Creating documents/reports
   - Multi-Modal: Analysis and processing

3. **Enter Your Task**
   - Describe what you want the agents to do
   - Example: "Research the latest AI trends and create a summary document"

4. **Execute**
   - Click "Execute Task"
   - Watch as agents work together
   - View results in the popup

### Context Menu

Right-click on selected text to:
- Execute with Developer Agent
- Research with Search Agent
- Summarize with Multi-Modal Agent

## Configuration

### API Keys

Required:
- **Anthropic API Key** - For Claude models (get at https://console.anthropic.com)

Optional:
- **OpenAI API Key** - For GPT models
- **Google API Key** - For Gemini models

### Model Settings

- **Default Provider**: Choose your preferred AI provider
- **Model**: Specify model (default: claude-3-5-sonnet-20241022)
- **Max Tokens**: Response length (256-8192)
- **Temperature**: Creativity (0.0-1.0)

### Agent Settings

- Enable/disable individual agents
- Set max concurrent agents (1-5)
- Enable/disable human-in-the-loop

## Architecture

```
kraken-assist/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (orchestrator)
├── popup.html/js/css      # Main UI
├── options.html/js/css    # Settings page
├── content.js             # Content script for page interaction
├── src/
│   ├── agents/
│   │   ├── orchestrator.js  # Coordinates multiple agents
│   │   ├── developer.js     # Code execution
│   │   ├── search.js        # Web research
│   │   ├── document.js      # File creation
│   │   └── multimodal.js    # Multi-modal processing
│   └── utils/
│       └── storage.js       # Chrome storage wrapper
└── icons/                  # Extension icons
```

## Agent Workflow

1. **Task Input** - User provides task description
2. **Planning** - Orchestrator analyzes task requirements
3. **Agent Selection** - Determines which agents to use
4. **Execution** - Agents work in parallel or sequence
5. **Synthesis** - Results combined into final output
6. **Delivery** - Results presented to user

## Examples

### Web Research & Report

```
Task: "Research quantum computing developments in 2024 and create a summary report"

Agents: Search + Document
Execution:
1. Search Agent finds relevant information
2. Document Agent creates formatted report
3. Results combined and delivered
```

### Code Analysis

```
Task: "Analyze this code and suggest improvements: <paste code>"

Agents: Developer
Execution:
1. Developer Agent analyzes code
2. Provides suggestions with examples
3. Returns optimized code snippet
```

### Multi-Modal Processing

```
Task: "Summarize this page and extract key insights"

Agents: Multi-Modal
Execution:
1. Extracts page content
2. Analyzes text and structure
3. Returns summary with key points
```

## Development

### Building

```bash
npm install
npm run build
```

### Testing

Load the unpacked extension in developer mode and test features.

## Security

- API keys stored locally in `chrome.storage.local`
- No data sent to external servers except configured AI APIs
- Content scripts only inject on user action
- Follows principle of least privilege

## Roadmap

- [ ] Full MCP tools integration
- [ ] Support for local models (Ollama)
- [ ] Advanced workflow editor
- [ ] Task templates
- [ ] Export/import configuration
- [ ] Task history and analytics
- [ ] Collaborative features

## Troubleshooting

### Extension not loading
- Check browser console for errors
- Ensure Developer Mode is enabled
- Try removing and re-adding the extension

### API errors
- Verify API key is correct
- Check API quota/billing
- Test connection in settings

### Agents not working
- Check that agents are enabled in settings
- Review task history for error messages
- Try simpler tasks first

## License

Based on Eigent Open Source License (Apache 2.0 with additional conditions)

## Credits

Adapted from [eigent-ai/eigent](https://github.com/eigent-ai/eigent)
Built on CAMEL-AI framework

## Support

For issues and feature requests, please visit the original Eigent repository:
https://github.com/eigent-ai/eigent

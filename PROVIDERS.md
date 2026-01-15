# Multi-Provider Support Guide

## Supported AI Providers

Eigent Chrome Extension now supports **5 AI providers** with automatic fallback capabilities:

### 1. Anthropic (Claude) - Best Quality
- **API Key**: Get from https://console.anthropic.com
- **Models**: claude-3-5-sonnet-20241022, claude-3-opus-20240229
- **Best for**: Complex reasoning, code analysis, nuanced tasks
- **Speed**: Medium
- **Cost**: $$$

### 2. Groq - Ultra Fast
- **API Key**: Get from https://console.groq.com
- **Models**: llama-3.3-70b-versatile, mixtral-8x7b-32768
- **Best for**: Fast responses, simple tasks
- **Speed**: Ultra (sub-100ms latency)
- **Cost**: Free tier available!

### 3. Cerebras - Fastest
- **API Key**: Get from https://cloud.cerebras.ai
- **Models**: llama-3.3-70b
- **Best for**: Maximum speed requirements
- **Speed**: Fastest (claimed fastest inference)
- **Cost**: Competitive pricing

### 4. OpenAI (GPT)
- **API Key**: Get from https://platform.openai.com
- **Models**: gpt-4-turbo-preview, gpt-3.5-turbo
- **Best for**: General tasks, broad compatibility
- **Speed**: Fast
- **Cost**: $$

### 5. Google (Gemini)
- **API Key**: Get from https://console.cloud.google.com
- **Models**: gemini-pro, gemini-ultra
- **Best for**: Google ecosystem integration
- **Speed**: Fast
- **Cost**: $ (very affordable)

## Execution Modes

### Standard Mode
- Uses only your selected default provider
- Predictable behavior
- Lower cost (single API call per task)

### Aggressive Mode (NEW!)
- Automatically tries backup providers if primary fails
- Ensures maximum reliability
- May increase cost (multiple API calls on failure)
- **Default fallback**: Groq → Cerebras (both ultra-fast)

**Example in Aggressive Mode:**
```
1. Try Anthropic (primary)
2. If fails → Try Groq (fallback 1)
3. If fails → Try Cerebras (fallback 2)
4. If all fail → Show error
```

## Configuration

### Quick Setup for Speed (Free!)

1. **Get Groq API Key** (Free tier available):
   - Go to https://console.groq.com
   - Sign up and create API key
   - Copy key (starts with `gsk_`)

2. **Configure Extension**:
   - Open extension settings
   - Paste Groq API key
   - Set "Default Provider" to "Groq"
   - Set "Execution Mode" to "Standard"
   - Save settings

3. **Result**: Ultra-fast AI responses (sub-100ms) at no cost!

### Best Quality Setup

1. **Get Anthropic API Key**:
   - Go to https://console.anthropic.com
   - Create API key
   - Add credits ($5 minimum)

2. **Configure Extension**:
   - Paste Anthropic API key
   - Set "Default Provider" to "Anthropic"
   - Enable "Aggressive Mode" for reliability
   - Add Groq/Cerebras keys for fallback (optional)
   - Save settings

3. **Result**: Best quality with automatic fallback!

### Hybrid Setup (Recommended)

**For cost-effective and fast execution:**

1. Add API keys for:
   - Groq (free, ultra-fast)
   - Anthropic (best quality)

2. Configure:
   - Default: Groq
   - Mode: Aggressive
   - Fallback: Anthropic

3. **Result**:
   - Fast responses from Groq
   - Automatic fallback to Anthropic for complex tasks
   - Cost-effective with quality backup

## Performance Comparison

| Provider | Speed | Quality | Cost | Best For |
|----------|-------|---------|------|----------|
| **Groq** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Free | Speed, simple tasks |
| **Cerebras** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $ | Maximum speed |
| **Anthropic** | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ | Complex tasks |
| **OpenAI** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $$ | General use |
| **Google** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | $ | Budget option |

## API Key Setup Guides

### Groq (Free Tier!)
1. Visit https://console.groq.com
2. Sign up (free account)
3. Navigate to API Keys
4. Create new key
5. Paste in extension settings
6. **Done! Start using immediately**

### Cerebras
1. Visit https://cloud.cerebras.ai
2. Create account
3. Generate API key
4. Paste in extension settings
5. Add payment method (competitive pricing)

### Anthropic
1. Visit https://console.anthropic.com
2. Sign up
3. Go to API Keys section
4. Create key
5. Add credits ($5 minimum)
6. Paste in extension settings

### OpenAI
1. Visit https://platform.openai.com
2. Create account
3. Navigate to API keys
4. Create new secret key
5. Add payment method
6. Paste in extension settings

### Google Gemini
1. Visit https://console.cloud.google.com
2. Create new project
3. Enable "Generative Language API"
4. Create API key
5. Paste in extension settings

## Troubleshooting

### "API connection failed"
- Verify API key is correct
- Check you have credits/billing enabled
- Try "Test Connection" button in settings
- Check internet connection

### "All providers failed" (Aggressive mode)
- Ensure at least one provider has valid API key
- Check each provider individually with "Test Connection"
- Try switching to Standard mode
- Check API quota/billing status

### Speed issues
- Switch to Groq or Cerebras for faster responses
- Reduce max_tokens in settings
- Disable aggressive parallelism
- Use Standard mode instead of Aggressive

### Cost concerns
- Use Groq (has generous free tier)
- Reduce max_tokens
- Switch to Standard mode
- Adjust temperature to 0.5 (faster, less tokens)

## Advanced Configuration

### Custom Fallback Chain

Edit extension settings to customize fallback providers:

```javascript
fallbackProviders: ['groq', 'cerebras', 'openai']
```

### Model Selection

Choose specific models per provider:

- **Anthropic**: claude-3-5-sonnet-20241022 (recommended)
- **Groq**: llama-3.3-70b-versatile (fastest)
- **Cerebras**: llama-3.3-70b
- **OpenAI**: gpt-4-turbo-preview
- **Google**: gemini-pro

### Token Management

- **Max Tokens**: Controls response length
  - Small (1024): Faster, cheaper
  - Medium (4096): Balanced (default)
  - Large (8192): Detailed responses

- **Temperature**: Controls creativity
  - 0.0: Deterministic, focused
  - 0.7: Balanced (default)
  - 1.0: Creative, varied

## Use Case Recommendations

### For Web Research
- Provider: Groq (fast enough)
- Mode: Standard
- Max Tokens: 2048

### For Code Generation
- Provider: Anthropic (best quality)
- Mode: Aggressive (with Groq fallback)
- Max Tokens: 4096

### For Document Creation
- Provider: Anthropic or Groq
- Mode: Standard
- Max Tokens: 4096

### For Analysis Tasks
- Provider: Anthropic (most accurate)
- Mode: Aggressive
- Max Tokens: 8192

## Cost Optimization

### Free Option
1. Use Groq (generous free tier)
2. Set as default provider
3. Standard mode
4. Keep max_tokens under 2048

### Budget Option ($1-10/month)
1. Primary: Groq (free tier)
2. Fallback: Google Gemini (very affordable)
3. Aggressive mode
4. Moderate token usage

### Quality Option ($20-50/month)
1. Primary: Anthropic Claude
2. Fallback: Groq (for speed)
3. Aggressive mode
4. Higher token limits when needed

## Next Steps

1. ✅ Choose your primary provider
2. ✅ Get API key(s)
3. ✅ Configure in extension settings
4. ✅ Test connection
5. ✅ Start executing tasks!

**Questions?** Check the main README.md or visit provider documentation.

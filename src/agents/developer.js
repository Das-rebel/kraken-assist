/**
 * Developer Agent - Handles code execution and terminal commands
 */

export class DeveloperAgent {
  constructor(config) {
    this.name = 'Developer Agent';
    this.description = 'Writes and executes code, runs terminal commands';
    this.config = config;
  }

  async execute(task) {
    const { content, context } = task;

    try {
      // Analyze what code needs to be written
      const codePrompt = this.buildCodePrompt(content);

      // Execute via Claude API
      const response = await this.callClaude(codePrompt);

      return {
        status: 'complete',
        output: response.text,
        summary: `Developer agent completed code execution`,
        artifacts: [
          {
            type: 'code',
            content: response.text,
            language: this.detectLanguage(content)
          }
        ]
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  buildCodePrompt(content) {
    return `You are a Developer Agent. Write and execute code for the following request:

${content}

Provide:
1. The code solution
2. Explanation of what it does
3. Any dependencies or setup required`;
  }

  detectLanguage(content) {
    if (/javascript|js|node/i.test(content)) return 'javascript';
    if (/python|py/i.test(content)) return 'python';
    if (/html|css/i.test(content)) return 'html';
    return 'text';
  }

  async callClaude(prompt) {
    const { UnifiedAPIClient } = await import('../utils/api-client.js');
    const client = new UnifiedAPIClient(this.config);

    const response = await client.chatCompletion({
      prompt,
      provider: this.config.defaultProvider || 'anthropic'
    });

    return response;
  }
}

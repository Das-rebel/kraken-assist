/**
 * Document Agent - Creates and manages documents
 */

export class DocumentAgent {
  constructor(config) {
    this.name = 'Document Agent';
    this.description = 'Creates and manages documents and files';
    this.config = config;
  }

  async execute(task) {
    const { content, context } = task;

    try {
      // Generate document content
      const documentContent = await this.generateDocument(content, context);

      // Create downloadable file
      const artifact = {
        type: 'document',
        format: this.detectFormat(content),
        content: documentContent,
        filename: this.generateFilename(content)
      };

      return {
        status: 'complete',
        output: documentContent,
        summary: `Document created: ${artifact.filename}`,
        artifacts: [artifact]
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async generateDocument(content, context) {
    const prompt = `Create a professional document based on this request:\n\n${content}\n\n` +
      `Previous results: ${JSON.stringify(context?.previousResults || [])}`;

    if (this.config.anthropicApiKey) {
      const response = await this.callClaude(prompt);
      return response.content[0]?.text || content;
    }

    return content;
  }

  detectFormat(content) {
    if (/html/i.test(content)) return 'html';
    if (/markdown|md/i.test(content)) return 'md';
    if (/report/i.test(content)) return 'html';
    return 'txt';
  }

  generateFilename(content) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const type = this.detectFormat(content);
    return `eigent_document_${timestamp}.${type}`;
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

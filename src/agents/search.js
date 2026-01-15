/**
 * Search Agent - Web search and content extraction
 */

export class SearchAgent {
  constructor(config) {
    this.name = 'Search Agent';
    this.description = 'Searches the web and extracts content';
    this.config = config;
  }

  async execute(task) {
    const { content, context } = task;

    try {
      // Extract search queries
      const queries = this.extractSearchQueries(content);

      // Perform searches
      const searchResults = [];
      for (const query of queries) {
        const results = await this.performSearch(query);
        searchResults.push(...results);
      }

      // Summarize findings
      const summary = await this.summarizeResults(searchResults, content);

      return {
        status: 'complete',
        output: summary,
        summary: `Found ${searchResults.length} relevant results`,
        artifacts: [
          {
            type: 'search_results',
            results: searchResults,
            count: searchResults.length
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

  extractSearchQueries(content) {
    // Simple query extraction - can be enhanced
    const queries = content.split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 3)
      .slice(0, 3); // Max 3 queries
    return queries.length > 0 ? queries : [content];
  }

  async performSearch(query) {
    // Use browser's search capability or API
    // For now, return mock results structure
    return [
      {
        title: `Search result for: ${query}`,
        url: 'https://example.com',
        snippet: 'Search result content...'
      }
    ];
  }

  async summarizeResults(results, originalQuery) {
    const summaryPrompt = `Summarize these search results for the query: "${originalQuery}"\n\n` +
      results.map(r => `- ${r.title}: ${r.snippet}`).join('\n');

    if (this.config.anthropicApiKey) {
      const response = await this.callClaude(summaryPrompt);
      return response.content[0]?.text || 'Summary unavailable';
    }

    return `Found ${results.length} results for: ${originalQuery}`;
  }

  async callClaude(prompt) {
    const { UnifiedAPIClient } = await import('../utils/api-client.js');
    const client = new UnifiedAPIClient(this.config);

    const response = await client.chatCompletion({
      prompt,
      provider: this.config.defaultProvider || 'anthropic',
      maxTokens: 2048
    });

    return response;
  }
}

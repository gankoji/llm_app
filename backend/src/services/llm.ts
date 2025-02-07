import { Anthropic } from '@anthropic-ai/sdk';
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import { ModelConfig, ModelConfigSchema, PromptRequest } from './llm.types';

const chromaClient = new ChromaClient({ path: process.env.CHROMA_URL });
const NUM_RESULTS = 3
export class LLMService {
  private anthropic: Anthropic;
  private defaultConfig: ModelConfig;
  private embeddingFunction: DefaultEmbeddingFunction;

  constructor(config: ModelConfig) {
    this.defaultConfig = ModelConfigSchema.parse(config);
    this.embeddingFunction = new DefaultEmbeddingFunction();
    this.anthropic = new Anthropic({
      apiKey: this.defaultConfig.apiKey,
    });
  }

  async generateResponse(promptRequest: PromptRequest) {
    const config = {
      ...this.defaultConfig,
      ...promptRequest.config,
    };

    try {
      const collection = await chromaClient.getCollection({
        name: 'default',
        embeddingFunction: this.embeddingFunction,
      });
      const results = await collection.query({
        queryTexts: [promptRequest.messages[0].content],
        nResults: NUM_RESULTS,
      });

      const context = results.documents[0].map((doc, index) => `Result ${index + 1}:\n${doc}\n`).join('');

      const modifiedPrompt = `Context:${context}\nUserPrompt: ${promptRequest.messages[0].content}`;

      const response = await this.anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [{ role: 'user', content: modifiedPrompt}],
      });

      return {
        response: response.content[0].text,
        usage: {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async generateTitle(messages: Array<{role: string, content: string}>): Promise<string> {
    try {
      const context = messages
        .slice(0, 2)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const response = await this.anthropic.messages.create({
        model: this.defaultConfig.model,
        max_tokens: 50,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `Based on this conversation, generate a concise title (max 6 words):\n${context}`
        }],
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Conversation';
    }
  }
}

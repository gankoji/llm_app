import { Anthropic } from '@anthropic-ai/sdk';
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import { ModelConfig, ModelConfigSchema, PromptRequest } from './llm.types';

const chromaClient = new ChromaClient({ path: process.env.CHROMA_URL }); // Chroma client
const NUM_RESULTS = 3 // Number of results to retrieve from ChromaDB

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
        queryTexts: [promptRequest.messages[0].content], // Use the user's prompt as the query
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
}
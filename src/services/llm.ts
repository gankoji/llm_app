import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';

// Configuration schema
export const ModelConfigSchema = z.object({
  provider: z.enum(['anthropic']).default('anthropic'),
  model: z.string().default('claude-3-sonnet-20240229'),
  apiKey: z.string(),
  maxTokens: z.number().optional().default(1024),
  temperature: z.number().optional().default(0.7),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

// Prompt schema
export const PromptSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  config: ModelConfigSchema.partial().optional(),
});

export type PromptRequest = z.infer<typeof PromptSchema>;

export class LLMService {
  private anthropic: Anthropic;
  private defaultConfig: ModelConfig;

  constructor(config: ModelConfig) {
    this.defaultConfig = ModelConfigSchema.parse(config);
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
      const response = await this.anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: promptRequest.messages,
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
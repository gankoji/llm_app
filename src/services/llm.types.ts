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

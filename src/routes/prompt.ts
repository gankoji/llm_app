import express from 'express';
import { ChromaClient } from 'chromadb';
import { LLMService } from '../services/llm';
import { PromptSchema } from '../services/llm.types';

const router = express.Router();
const chromaClient = new ChromaClient({ path: process.env.CHROMA_URL });

// Initialize LLM service with environment variables
const llmService = new LLMService({
  provider: 'anthropic',
  model: process.env.MODEL_NAME || 'claude-3-sonnet-20240229',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 1024,
  temperature: 0.7
});

router.post('/', async (req, res) => {
  try {
    // Validate request body against schema
    const promptRequest = PromptSchema.parse(req.body);

    // Generate response using LLM service
    const response = await llmService.generateResponse(promptRequest);

    res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing prompt:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Invalid request format',
          details: JSON.stringify(error),
        });
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

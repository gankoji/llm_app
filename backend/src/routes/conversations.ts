import express from 'express';
import { Pool } from 'pg';
import { LLMService } from '../services/llm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const router = express.Router();
const llmService = new LLMService(/* config */);

// Get all conversations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             json_agg(json_build_object('role', m.role, 'content', m.content) 
                     ORDER BY m.created_at) as messages
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new conversation
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert initial conversation with temporary title
    const convResult = await client.query(
      'INSERT INTO conversations (title) VALUES ($1) RETURNING id',
      ['New Conversation']
    );
    const conversationId = convResult.rows[0].id;

    // Insert initial message
    const { messages } = req.body;
    for (const msg of messages) {
      await client.query(
        'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
        [conversationId, msg.role, msg.content]
      );
    }

    // Generate and update title after first response
    if (messages.length >= 2) {
      const title = await llmService.generateTitle(messages.slice(0, 2));
      await client.query(
        'UPDATE conversations SET title = $1 WHERE id = $2',
        [title, conversationId]
      );
    }

    await client.query('COMMIT');
    
    const result = await client.query(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Add message to conversation
router.post('/:id/messages', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { role, content } = req.body;

    await client.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [id, role, content]
    );

    // Update conversation timestamp
    await client.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    // Fetch updated conversation
    const result = await client.query(`
      SELECT c.*, 
             json_agg(json_build_object('role', m.role, 'content', m.content) 
                     ORDER BY m.created_at) as messages
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;

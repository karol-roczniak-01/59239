import { Hono } from 'hono';
import { z } from 'zod';
import { 
  demandIdSchema, 
  userIdSchema, 
  createDemandSchema,
  searchQuerySchema,
  type Demand 
} from '../schemas/demand';
import type { Env } from '..';
import type { Ai } from '@cloudflare/workers-types';

const demand = new Hono<{ Bindings: Env }>();

// ============================================================================
// HELPER: Handle Zod Errors
// ============================================================================
const handleZodError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return {
      error: error.issues[0].message,
      status: 400 as const
    };
  }
  return null;
};

// ============================================================================
// HELPER: Generate Schema from Content using AI
// ============================================================================
const generateSchemaFromContent = async (content: string, ai: Ai): Promise<string> => {
  const prompt = `Extract key information from this text as JSON. Be creative and extract whatever seems relevant.

Text: "${content}"

Return only JSON, no explanation.`;

  try {
    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'Extract information as JSON. Return only valid JSON, no markdown.' },
        { role: 'user', content: prompt }
      ]
    });

    let jsonStr = response.response?.trim() || '{}';
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    JSON.parse(jsonStr); // Validate
    return jsonStr;
  } catch {
    return JSON.stringify({ content });
  }
};

// ============================================================================
// HELPER: Generate Vector Embedding
// ============================================================================
const generateEmbedding = async (text: string, ai: Ai): Promise<number[]> => {
  const response = await ai.run('@cf/baai/bge-base-en-v1.5', {
    text: [text]
  }) as { data: number[][] };

  return response.data[0];
};

// ============================================================================
// CREATE DEMAND (Authenticated - you'll need to add auth middleware)
// ============================================================================
demand.post('/api/demand', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input (now includes userId, email, phone - phone is optional)
    const validatedInput = createDemandSchema.parse(body);

    // Generate schema using AI
    const schemaJson = await generateSchemaFromContent(
      validatedInput.content, 
      c.env.AI
    );

    // Generate embedding for semantic search
    const embedding = await generateEmbedding(validatedInput.content, c.env.AI);

    // Insert into D1 - use empty string if phone is not provided
    const createdAt = Math.floor(Date.now() / 1000);
    const result = await c.env.DB
      .prepare('INSERT INTO demand (userId, content, schema, email, phone, createdAt) VALUES (?, ?, ?, ?, ?, ?) RETURNING *')
      .bind(validatedInput.userId, validatedInput.content, schemaJson, validatedInput.email, validatedInput.phone || '', createdAt)
      .first<Demand>();

    if (!result) {
      throw new Error('Failed to create demand');
    }

    // Insert into Vectorize
    await c.env.VECTORIZE.insert([
      {
        id: result.id.toString(),
        values: embedding,
        metadata: {
          userId: result.userId,
          content: result.content,
          createdAt: result.createdAt
        }
      }
    ]);

    return c.json({ demand: result }, 201);
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Create Demand] Error:', error);
    return c.json({ error: 'Failed to create demand' }, 500);
  }
});

// ============================================================================
// SEARCH DEMANDS (Semantic Search)
// ============================================================================
demand.get('/api/demand/search', async (c) => {
  try {
    const query = c.req.query('q');
    
    // Validate search query
    const validatedQuery = searchQuerySchema.parse(query);

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(validatedQuery, c.env.AI);

    // Search in Vectorize
    const results = await c.env.VECTORIZE.query(queryEmbedding, {
      topK: 10,
      returnMetadata: 'all'
    });

    // Fetch full demand details from D1
    const demandIds = results.matches.map(match => match.id);
    
    if (demandIds.length === 0) {
      return c.json({ demand: [], matches: [] });
    }

    const placeholders = demandIds.map(() => '?').join(',');
    const demandResult = await c.env.DB
      .prepare(`SELECT * FROM demand WHERE id IN (${placeholders})`)
      .bind(...demandIds)
      .all();

    // Combine with similarity scores and filter out null demands
    const demandWithScores = results.matches
      .map(match => {
        const demand = demandResult.results.find(d => (d as Demand).id.toString() === match.id);
        return {
          demand,
          score: match.score
        };
      })
      .filter(item => item.demand != null);

    return c.json({ 
      demand: demandWithScores,
      count: demandWithScores.length
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Search Demand] Error:', error);
    return c.json({ error: 'Failed to search demand' }, 500);
  }
});

// ============================================================================
// GET DEMAND BY ID
// ============================================================================
demand.get('/api/demand/:demandId', async (c) => {
  try {
    const demandId = c.req.param('demandId');
    const requestingUserId = c.req.query('userId'); // Pass userId as query param

    // Validate demand ID
    const validatedDemandId = demandIdSchema.parse(demandId);

    // Query demand by ID
    const demand = await c.env.DB
      .prepare('SELECT * FROM demand WHERE id = ?')
      .bind(validatedDemandId)
      .first<Demand>();

    if (!demand) {
      return c.json({ error: 'Demand not found' }, 404);
    }

    // Check if requesting user has applied to this demand
    let hasApplied = false;
    if (requestingUserId) {
      const validatedUserId = userIdSchema.parse(requestingUserId);
      const supply = await c.env.DB
        .prepare('SELECT id FROM supply WHERE demandId = ? AND userId = ?')
        .bind(validatedDemandId, validatedUserId)
        .first();
      
      hasApplied = !!supply;
    }

    // If user hasn't applied, remove email and phone
    const responseDemand = hasApplied ? demand : {
      ...demand,
      email: undefined,
      phone: undefined
    };

    return c.json({ demand: responseDemand, hasApplied });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get Demand By ID] Error:', error);
    return c.json({ error: 'Failed to retrieve demand' }, 500);
  }
});

// ============================================================================
// GET DEMANDS BY USER ID
// ============================================================================
demand.get('/api/demand/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // Validate user ID
    const validatedUserId = userIdSchema.parse(userId);

    // Query demand by user ID
    const result = await c.env.DB
      .prepare('SELECT * FROM demand WHERE userId = ? ORDER BY createdAt DESC')
      .bind(validatedUserId)
      .all();

    return c.json({ 
      demand: result.results as Demand[],
      count: result.results.length
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get Demand By User ID] Error:', error);
    return c.json({ error: 'Failed to retrieve demand' }, 500);
  }
});

export default demand;
import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  demandIdSchema, 
  userIdSchema, 
  createDemandSchema,
  searchQuerySchema,
  type Demand 
} from '../schemas/demandSchema';
import type { Env } from '..';
import type { Ai, KVNamespace } from '@cloudflare/workers-types';

const demand = new Hono<{ Bindings: Env }>();

// ============================================================================
// RATE LIMIT CONFIG
// ============================================================================
const RATE_LIMIT = {
  MAX_SEARCHES_PER_DAY: 10,
  KEY_PREFIX: 'search_limit:'
};

// ============================================================================
// HELPER: Get Rate Limit Key
// ============================================================================
const getRateLimitKey = (userId: string): string => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${RATE_LIMIT.KEY_PREFIX}${userId}:${date}`;
};

// ============================================================================
// HELPER: Get Reset Timestamp (next midnight UTC)
// ============================================================================
const getResetTimestamp = (): string => {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.toISOString();
};

// ============================================================================
// HELPER: Check and Increment Rate Limit
// ============================================================================
const checkAndIncrementRateLimit = async (
  userId: string, 
  kv: KVNamespace
): Promise<{ allowed: boolean; remaining: number; total: number; resetAt: string }> => {
  const key = getRateLimitKey(userId);
  const resetAt = getResetTimestamp();
  
  // Get current count
  const currentCount = await kv.get(key);
  const count = currentCount ? parseInt(currentCount, 10) : 0;
  
  // Check if limit exceeded
  if (count >= RATE_LIMIT.MAX_SEARCHES_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      total: RATE_LIMIT.MAX_SEARCHES_PER_DAY,
      resetAt
    };
  }
  
  // Increment count
  const newCount = count + 1;
  const secondsUntilMidnight = Math.floor((new Date(resetAt).getTime() - Date.now()) / 1000);
  await kv.put(key, newCount.toString(), { expirationTtl: secondsUntilMidnight });
  
  return {
    allowed: true,
    remaining: RATE_LIMIT.MAX_SEARCHES_PER_DAY - newCount,
    total: RATE_LIMIT.MAX_SEARCHES_PER_DAY,
    resetAt
  };
};

// ============================================================================
// HELPER: Get Rate Limit Status (without incrementing)
// ============================================================================
const getRateLimitStatus = async (
  userId: string, 
  kv: KVNamespace
): Promise<{ remaining: number; total: number; resetAt: string }> => {
  const key = getRateLimitKey(userId);
  const resetAt = getResetTimestamp();
  
  const currentCount = await kv.get(key);
  const count = currentCount ? parseInt(currentCount, 10) : 0;
  
  return {
    remaining: Math.max(0, RATE_LIMIT.MAX_SEARCHES_PER_DAY - count),
    total: RATE_LIMIT.MAX_SEARCHES_PER_DAY,
    resetAt
  };
};

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
    
    // Validate input (now includes days for duration)
    const validatedInput = createDemandSchema.parse(body);

    // Generate UUID for the demand
    const id = uuidv4();

    // Generate schema using AI
    const schemaJson = await generateSchemaFromContent(
      validatedInput.content, 
      c.env.AI
    );

    // Generate embedding for semantic search
    const embedding = await generateEmbedding(validatedInput.content, c.env.AI);

    // Calculate timestamps
    const createdAt = Math.floor(Date.now() / 1000);
    const endingAt = createdAt + (validatedInput.days * 86400); // days * seconds per day

    // Insert into D1 - use empty string if phone is not provided
    const result = await c.env.DB
      .prepare('INSERT INTO demand (id, userId, content, schema, email, phone, createdAt, endingAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *')
      .bind(id, validatedInput.userId, validatedInput.content, schemaJson, validatedInput.email, validatedInput.phone || '', createdAt, endingAt)
      .first<Demand>();

    if (!result) {
      throw new Error('Failed to create demand');
    }

    // Insert into Vectorize
    await c.env.VECTORIZE.insert([
      {
        id: result.id,
        values: embedding,
        metadata: {
          userId: result.userId,
          content: result.content,
          createdAt: result.createdAt,
          endingAt: result.endingAt
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
// GET RATE LIMIT STATUS (doesn't consume a search)
// ============================================================================
demand.get('/api/demand/search/limit', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }

    // Validate user ID
    const validatedUserId = userIdSchema.parse(userId);

    // Get rate limit status
    const status = await getRateLimitStatus(validatedUserId, c.env.RATE_LIMIT);

    return c.json(status);
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Rate Limit Status] Error:', error);
    return c.json({ error: 'Failed to get rate limit status' }, 500);
  }
});

// ============================================================================
// SEARCH DEMANDS (Semantic Search - Filter out expired)
// ============================================================================
demand.get('/api/demand/search', async (c) => {
  try {
    const query = c.req.query('q');
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId query parameter is required' }, 400);
    }

    // Validate user ID
    const validatedUserId = userIdSchema.parse(userId);
    
    // Validate search query
    const validatedQuery = searchQuerySchema.parse(query);

    // Check and increment rate limit
    const rateLimit = await checkAndIncrementRateLimit(validatedUserId, c.env.RATE_LIMIT);
    
    if (!rateLimit.allowed) {
      return c.json({ 
        error: 'Daily search limit reached. Try again tomorrow.',
        rateLimit: {
          remaining: rateLimit.remaining,
          total: rateLimit.total,
          resetAt: rateLimit.resetAt
        }
      }, 429);
    }

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
      return c.json({ 
        demand: [], 
        matches: [],
        rateLimit: {
          remaining: rateLimit.remaining,
          total: rateLimit.total,
          resetAt: rateLimit.resetAt
        }
      });
    }

    const placeholders = demandIds.map(() => '?').join(',');
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Filter out expired demands
    const demandResult = await c.env.DB
      .prepare(`SELECT * FROM demand WHERE id IN (${placeholders}) AND endingAt > ?`)
      .bind(...demandIds, currentTime)
      .all();

    // Combine with similarity scores and filter out null demands
    const demandWithScores = results.matches
      .map(match => {
        const demand = demandResult.results.find(d => (d as Demand).id === match.id);
        return {
          demand,
          score: match.score
        };
      })
      .filter(item => item.demand != null);

    return c.json({ 
      demand: demandWithScores,
      count: demandWithScores.length,
      rateLimit: {
        remaining: rateLimit.remaining,
        total: rateLimit.total,
        resetAt: rateLimit.resetAt
      }
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
// GET DEMAND BY ID (No filtering - allow viewing expired demands)
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

    // Check if demand is expired
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime > demand.endingAt;

    // If user hasn't applied, remove email and phone
    const responseDemand = hasApplied ? demand : {
      ...demand,
      email: undefined,
      phone: undefined
    };

    return c.json({ demand: responseDemand, hasApplied, isExpired });
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

    // Query demand by user ID (include expired demands for user's own view)
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
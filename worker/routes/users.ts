import { Hono } from 'hono';
import { z } from 'zod';
import { searchQuerySchema, userNameSchema, userIdSchema, type ApiUser, type DbUser } from '../schemas/users';
import type { Env } from '..';

const users = new Hono<{ Bindings: Env }>();

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
// HELPER: Map DB User to API User
// ============================================================================
const mapUserToApi = (user: DbUser): ApiUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  type: user.type,
  verified: user.verified
});

// ============================================================================
// GET USER BY USERNAME (Public)
// ============================================================================
users.get('/api/me/user/:userName', async (c) => {
  try {
    const userName = c.req.param('userName');

    // Validate and sanitize username with Zod
    const validatedUserName = userNameSchema.parse(userName);

    // Query user by name
    const user = await c.env.DB
      .prepare('SELECT id, name, email, type, verified FROM users WHERE name = ?')
      .bind(validatedUserName)
      .first<DbUser>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: mapUserToApi(user) });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get User By Username] Error:', error);
    return c.json({ error: 'Failed to retrieve user' }, 500);
  }
});

// ============================================================================
// SEARCH HUMANS BY NAME
// ============================================================================
users.get('/api/users/humans/search', async (c) => {
  try {
    const name = c.req.query('name');
    
    // Validate and sanitize search query
    const validatedName = searchQuerySchema.parse(name || '');

    // Return empty array if search query is empty
    if (validatedName.length === 0) {
      return c.json({ users: [] });
    }
    
    const result = await c.env.DB
      .prepare('SELECT id, name, email, type, verified FROM users WHERE name LIKE ? AND type = ? ORDER BY name LIMIT 10')
      .bind(`${validatedName}%`, 'human')
      .all();

    return c.json({ 
      users: result.results.map((user) => mapUserToApi(user as DbUser))
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Search Humans] Error:', error);
    return c.json({ error: 'Failed to search users' }, 500);
  }
});

// ============================================================================
// SEARCH ORGANIZATIONS BY NAME
// ============================================================================
users.get('/api/users/organizations/search', async (c) => {
  try {
    const name = c.req.query('name');
    
    // Validate and sanitize search query
    const validatedName = searchQuerySchema.parse(name || '');

    // Return empty array if search query is empty
    if (validatedName.length === 0) {
      return c.json({ users: [] });
    }
    
    const result = await c.env.DB
      .prepare('SELECT id, name, email, type, verified FROM users WHERE name LIKE ? AND type = ? ORDER BY name LIMIT 10')
      .bind(`${validatedName}%`, 'organization')
      .all();

    return c.json({ 
      users: result.results.map((user) => mapUserToApi(user as DbUser))
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Search Organizations] Error:', error);
    return c.json({ error: 'Failed to search users' }, 500);
  }
});

// ============================================================================
// GET USER BY ID (Public)
// ============================================================================
users.get('/api/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // Validate UUID with Zod
    const validatedUserId = userIdSchema.parse(userId);

    // Query user by ID
    const user = await c.env.DB
      .prepare('SELECT id, name, email, type, verified FROM users WHERE id = ?')
      .bind(validatedUserId)
      .first<DbUser>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: mapUserToApi(user) });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get User By ID] Error:', error);
    return c.json({ error: 'Failed to retrieve user' }, 500);
  }
});

export default users;
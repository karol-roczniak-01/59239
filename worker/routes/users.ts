import { Hono } from 'hono'
import { z } from 'zod'
import {
  
  
  searchQuerySchema,
  userIdSchema,
  usernameSchema
} from '../schemas/usersSchema'
import type {ApiUser, DbUser} from '../schemas/usersSchema';
import type { Env } from '..'

const users = new Hono<{ Bindings: Env }>()

// ============================================================================
// HELPER: Handle Zod Errors
// ============================================================================
const handleZodError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return {
      error: error.issues[0].message,
      status: 400 as const,
    }
  }
  return null
}

// ============================================================================
// HELPER: Map MOTHER_DB User to API User
// ============================================================================
const mapUserToApi = (user: DbUser): ApiUser => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  verified: user.verified,
})

// ============================================================================
// GET USER BY USERNAME (Public)
// ============================================================================
users.get('/api/me/user/:username', async (c) => {
  try {
    const username = c.req.param('username')

    // Validate and sanitize username with Zod
    const validatedUsername = usernameSchema.parse(username)

    // Query user by username
    const user = await c.env.MOTHER_DB.prepare(
      'SELECT id, username, fullName, email, verified FROM users WHERE username = ?',
    )
      .bind(validatedUsername)
      .first<DbUser>()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user: mapUserToApi(user) })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status)
    }

    console.error('[Get User By Username] Error:', error)
    return c.json({ error: 'Failed to retrieve user' }, 500)
  }
})

// ============================================================================
// SEARCH USERS BY USERNAME
// ============================================================================
users.get('/api/users/search', async (c) => {
  try {
    const username = c.req.query('username')

    // Validate and sanitize search query
    const validatedUsername = searchQuerySchema.parse(username || '')

    // Return empty array if search query is empty
    if (validatedUsername.length === 0) {
      return c.json({ users: [] })
    }

    const result = await c.env.MOTHER_DB.prepare(
      'SELECT id, username, fullName, email, verified FROM users WHERE username LIKE ? ORDER BY username LIMIT 10',
    )
      .bind(`${validatedUsername}%`)
      .all()

    return c.json({
      users: result.results.map((user) => mapUserToApi(user as DbUser)),
    })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status)
    }

    console.error('[Search Users] Error:', error)
    return c.json({ error: 'Failed to search users' }, 500)
  }
})

// ============================================================================
// GET USER BY ID (Public)
// ============================================================================
users.get('/api/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')

    // Validate UUID with Zod
    const validatedUserId = userIdSchema.parse(userId)

    // Query user by ID
    const user = await c.env.MOTHER_DB.prepare(
      'SELECT id, username, fullName, email, verified FROM users WHERE id = ?',
    )
      .bind(validatedUserId)
      .first<DbUser>()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user: mapUserToApi(user) })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status)
    }

    console.error('[Get User By ID] Error:', error)
    return c.json({ error: 'Failed to retrieve user' }, 500)
  }
})

export default users

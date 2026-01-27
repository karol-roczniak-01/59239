import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import { type Env, type Variables } from '../index';
import {
  signupSchema,
  loginSchema,
  jwtPayloadSchema,
  type DbAuthUser,
  type ApiAuthUser,
  type JwtPayload
} from '../schemas/auth';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Constants
const JWT_EXPIRATION = '7d';
const BCRYPT_ROUNDS = 10;
const COOKIE_NAME = 'auth_token';

// ============================================================================
// HELPER: Set Secure Cookie
// ============================================================================
const setAuthCookie = (c: any, token: string) => {
  c.header(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
};

// ============================================================================
// HELPER: Clear Cookie
// ============================================================================
const clearAuthCookie = (c: any) => {
  c.header(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
};

// ============================================================================
// HELPER: Parse Cookies
// ============================================================================
const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
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
// HELPER: Map DB User to API User
// ============================================================================
const mapAuthUserToApi = (user: DbAuthUser): ApiAuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  type: user.type,
  verified: user.verified === 1
});

// ============================================================================
// MIDDLEWARE - Verify JWT from Cookie
// ============================================================================
export const verifyAuth = async (c: any, next: any) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    
    const cookies = parseCookies(cookieHeader);
    
    const token = cookies[COOKIE_NAME];
    
    if (!token) {
      console.log('[verifyAuth] No token - returning 401'); // ADD THIS
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, jwtSecret);
    
    const validatedPayload = jwtPayloadSchema.parse(payload);
    c.set('user', validatedPayload);
    
    await next();
  } catch (error) {
    console.error('[verifyAuth] Error:', error); // ADD THIS
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// ============================================================================
// CHECK USERNAME AVAILABILITY (Public)
// ============================================================================
auth.get('/api/users/check-username/:username', async (c) => {
  try {
    const username = c.req.param('username');
    
    // Validate username format (same rules as signup)
    if (!username || username.length < 3) {
      return c.json({ available: false, reason: 'Username must be at least 3 characters' });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return c.json({ 
        available: false, 
        reason: 'Username can only contain letters, numbers, underscores, and hyphens' 
      });
    }
    
    // Check if username exists
    const existing = await c.env.DB
      .prepare('SELECT id FROM users WHERE name = ?')
      .bind(username)
      .first();
    
    return c.json({ 
      available: !existing,
      ...(existing && { reason: 'Username already taken' })
    });
  } catch (error) {
    console.error('[Check Username] Error:', error);
    return c.json({ error: 'Failed to check username availability' }, 500);
  }
});

// ============================================================================
// SIGN UP
// ============================================================================
auth.post('/api/users/signup', async (c) => {
  try {
    const body = await c.req.json();

    // Validate and sanitize with Zod
    const validatedData = signupSchema.parse(body);
    const { name, email, password, type: userType = 'human' } = validatedData;

    // Check for existing user
    const existing = await c.env.DB
      .prepare('SELECT id FROM users WHERE email = ? OR name = ?')
      .bind(email, name)
      .first();

    if (existing) {
      return c.json({ error: 'Email or username already taken' }, 409);
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert new user
    const result = await c.env.DB
      .prepare('INSERT INTO users (name, email, type, passwordHash, verified) VALUES (?, ?, ?, ?, ?)')
      .bind(name, email, userType, passwordHash, 0)
      .run();

    const userId = result.meta.last_row_id as number;

    // Create JWT token
    const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET_KEY);
    const token = await new SignJWT({ userId, email, type: userType })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(jwtSecret);

    // Set httpOnly cookie
    setAuthCookie(c, token);

    return c.json({
      message: 'Account created successfully',
      user: { id: userId, name, email, type: userType, verified: false }
    }, 201);
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Signup] Error:', error);
    
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Email or username already taken' }, 409);
    }
    
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// ============================================================================
// LOGIN
// ============================================================================
auth.post('/api/users/login', async (c) => {
  try {
    const body = await c.req.json();

    // Validate with Zod
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Get user from database
    const user = await c.env.DB
      .prepare('SELECT id, name, email, type, passwordHash, verified FROM users WHERE email = ?')
      .bind(email)
      .first<DbAuthUser>();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Create JWT token
    const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET_KEY);
    const token = await new SignJWT({ userId: user.id, email: user.email, type: user.type })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(jwtSecret);

    // Set httpOnly cookie
    setAuthCookie(c, token);

    return c.json({
      message: 'Login successful',
      user: mapAuthUserToApi(user)
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Login] Error:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

// ============================================================================
// SIGN OUT
// ============================================================================
auth.post('/api/users/signout', async (c) => {
  try {
    // Clear the httpOnly cookie
    clearAuthCookie(c);
    return c.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('[Signout] Error:', error);
    return c.json({ error: 'Failed to sign out' }, 500);
  }
});

// ============================================================================
// GET CURRENT USER (Protected)
// ============================================================================
auth.get('/api/users/me', verifyAuth, async (c) => {
  try {
    const userPayload = c.get('user') as JwtPayload;
    
    const user = await c.env.DB
      .prepare('SELECT id, name, email, type, verified FROM users WHERE id = ?')
      .bind(userPayload.userId)
      .first<Omit<DbAuthUser, 'passwordHash'>>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        verified: user.verified === 1
      }
    });
  } catch (error) {
    console.error('[Get Current User] Error:', error);
    return c.json({ error: 'Failed to retrieve user' }, 500);
  }
});

export default auth;
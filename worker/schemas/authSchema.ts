import { z } from 'zod'

// ============================================================================
// SANITIZATION HELPER
// ============================================================================
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Username schema - validates and sanitizes
export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .max(100, 'Username is too long')
  .trim()
  .transform(sanitizeInput)
  .refine((val) => /^[a-zA-Z0-9_-]+$/.test(val), {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })

// Full name schema - validates and sanitizes
export const fullNameSchema = z
  .string()
  .min(1, 'Full name is required')
  .max(200, 'Full name is too long')
  .trim()
  .transform(sanitizeInput)

// Email schema
export const emailSchema = z
  .string()
  z.email('Invalid email format')
  .min(1, 'Email is required')
  .trim()
  .transform((val) => val.toLowerCase())

// Password schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one number',
  })

export const idSchema = z.string().uuid('Invalid user ID')

// ============================================================================
// REQUEST BODY SCHEMAS
// ============================================================================

// Login request schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// ============================================================================
// DATABASE SCHEMAS
// ============================================================================

// Database user schema (includes passwordHash)
export const dbAuthUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  fullName: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  verified: z.number(),
})

// API user schema (excludes passwordHash)
export const apiAuthUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  fullName: z.string(),
  email: z.string(),
  verified: z.boolean(),
})

// JWT payload schema
export const jwtPayloadSchema = z.object({
  userId: z.uuid(),
  email: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
})

// ============================================================================
// TYPES
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>
export type DbAuthUser = z.infer<typeof dbAuthUserSchema>
export type ApiAuthUser = z.infer<typeof apiAuthUserSchema>
export type JwtPayload = z.infer<typeof jwtPayloadSchema>

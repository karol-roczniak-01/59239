import { z } from 'zod';

// ============================================================================
// SANITIZATION HELPER
// ============================================================================
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Name schema - validates and sanitizes
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .trim()
  .transform(sanitizeInput)
  .refine(
    (val) => /^[a-zA-Z0-9_-]+$/.test(val),
    { message: 'Name can only contain letters, numbers, underscores, and hyphens' }
  );

// Email schema
export const emailSchema = z.email()
  .min(1, 'Email is required')
  .trim()
  .transform((val) => val.toLowerCase());

// Password schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine(
    (val) => /[A-Z]/.test(val),
    { message: 'Password must contain at least one uppercase letter' }
  )
  .refine(
    (val) => /[a-z]/.test(val),
    { message: 'Password must contain at least one lowercase letter' }
  )
  .refine(
    (val) => /[0-9]/.test(val),
    { message: 'Password must contain at least one number' }
  );

// User type schema
export const userTypeSchema = z.enum(['human', 'organization', 'admin'])
  .default('human');

// ============================================================================
// REQUEST BODY SCHEMAS
// ============================================================================

// Signup request schema
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  type: userTypeSchema.optional()
});

// Login request schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// ============================================================================
// DATABASE SCHEMAS
// ============================================================================

// Database user schema (includes passwordHash)
export const dbAuthUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  type: z.string(),
  passwordHash: z.string(),
  verified: z.number()
});

// API user schema (excludes passwordHash)
export const apiAuthUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  type: z.string(),
  verified: z.boolean()
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
  userId: z.number(),
  email: z.string(),
  type: z.string()
});

// ============================================================================
// TYPES
// ============================================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DbAuthUser = z.infer<typeof dbAuthUserSchema>;
export type ApiAuthUser = z.infer<typeof apiAuthUserSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
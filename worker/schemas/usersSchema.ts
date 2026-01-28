import { z } from 'zod';

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const userNameSchema = z.string()
  .min(1, 'Username is required')
  .max(100, 'Username is too long')
  .trim()
  .transform(sanitizeInput)
  .refine(
    (val) => /^[a-zA-Z0-9_-]+$/.test(val),
    { message: 'Username can only contain letters, numbers, underscores, and hyphens' }
  );

export const userIdSchema = z.uuid('Invalid user ID')

export const searchQuerySchema = z.string()
  .max(100, 'Search query is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .default('');

export const userTypeSchema = z.enum(['human', 'organization']);

export const dbUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  type: z.string(),
  verified: z.number()
});

export const apiUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  type: z.string(),
  verified: z.number()
});

export type DbUser = z.infer<typeof dbUserSchema>;
export type ApiUser = z.infer<typeof apiUserSchema>;
// This file should be placed at: schemas/demand.ts
import { z } from 'zod';

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const demandContentSchema = z.string()
  .min(50, 'Demand description must be at least 50 characters')
  .max(1000, 'Demand description is too long')
  .trim()
  .transform(sanitizeInput);

export const emailSchema = z.email()
  .trim()
  .toLowerCase();

export const phoneSchema = z.string()
  .min(5, 'Phone number must be at least 5 characters')
  .max(20, 'Phone number is too long')
  .trim()
  .transform(sanitizeInput);

export const demandIdSchema = z.coerce.number().int().positive('Invalid demand ID');

export const userIdSchema = z.coerce.number().int().positive('Invalid user ID');

export const searchQuerySchema = z.string()
  .min(30, 'Search query must be at least 30 characters')
  .max(500, 'Search query is too long')
  .trim()
  .transform(sanitizeInput);

export const demandSchema = z.object({
  id: z.number(),
  userId: z.number(),
  content: z.string(),
  schema: z.string(), // JSON string stored as TEXT in SQLite
  email: z.string(),
  phone: z.string(),
  createdAt: z.number()
});

export const createDemandSchema = z.object({
  content: demandContentSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  userId: userIdSchema
});

export type Demand = z.infer<typeof demandSchema>;
export type CreateDemandInput = z.infer<typeof createDemandSchema>;
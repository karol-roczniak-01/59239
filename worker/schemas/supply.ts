import { z } from 'zod';

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const supplyIdSchema = z.coerce.number().int().positive('Invalid supply ID');

export const demandIdSchema = z.coerce.number().int().positive('Invalid demand ID');

export const userIdSchema = z.coerce.number().int().positive('Invalid user ID');

export const supplyContentSchema = z.string()
  .min(30, 'Supply description must be at least 30 characters')
  .max(1000, 'Supply description is too long')
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

export const paymentIntentIdSchema = z.string()
  .min(1, 'Payment Intent ID is required');

export const supplySchema = z.object({
  id: z.number(),
  demandId: z.number(),
  userId: z.number(),
  content: z.string(),
  email: z.string(),
  phone: z.string(),
  paymentIntentId: z.string(),
  createdAt: z.number()
});

export const createSupplySchema = z.object({
  demandId: demandIdSchema,
  content: supplyContentSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  userId: userIdSchema,
  paymentIntentId: paymentIntentIdSchema
});

export type Supply = z.infer<typeof supplySchema>;
export type CreateSupplyInput = z.infer<typeof createSupplySchema>;
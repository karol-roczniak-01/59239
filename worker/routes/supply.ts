import { Hono } from 'hono';
import { z } from 'zod';
import { 
  supplyIdSchema, 
  demandIdSchema,
  userIdSchema,
  createSupplySchema,
  type Supply 
} from '../schemas/supply';
import type { Env } from '..';

const supply = new Hono<{ Bindings: Env }>();

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
// CREATE SUPPLY (Authenticated + Payment Required)
// ============================================================================
const createSupplyWithPaymentSchema = createSupplySchema.extend({
  paymentIntentId: z.string().min(1, 'Payment Intent ID is required')
});

supply.post('/api/supply', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input (now includes paymentIntentId, phone is optional)
    const validatedInput = createSupplyWithPaymentSchema.parse(body);

    // Verify payment with Stripe
    const paymentResponse = await fetch(
      `https://api.stripe.com/v1/payment_intents/${validatedInput.paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      return c.json({ error: 'Payment verification failed' }, 400);
    }

    const paymentIntent = await paymentResponse.json();

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return c.json({ error: 'Payment not completed' }, 400);
    }

    // Verify payment matches the demand
    if (paymentIntent.metadata.demandId !== validatedInput.demandId.toString()) {
      return c.json({ error: 'Payment does not match demand' }, 400);
    }

    // Check if this payment was already used
    const existingSupply = await c.env.DB
      .prepare('SELECT id FROM supply WHERE paymentIntentId = ?')
      .bind(validatedInput.paymentIntentId)
      .first();

    if (existingSupply) {
      return c.json({ error: 'Payment already used' }, 409);
    }

    // Check if demand exists
    const demand = await c.env.DB
      .prepare('SELECT id FROM demand WHERE id = ?')
      .bind(validatedInput.demandId)
      .first();

    if (!demand) {
      return c.json({ error: 'Demand not found' }, 404);
    }

    // Insert into D1 with paymentIntentId - use empty string if phone not provided
    const createdAt = Math.floor(Date.now() / 1000);
    const result = await c.env.DB
      .prepare(`
        INSERT INTO supply 
        (demandId, userId, content, email, phone, paymentIntentId, createdAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?) 
        RETURNING *
      `)
      .bind(
        validatedInput.demandId, 
        validatedInput.userId, 
        validatedInput.content, 
        validatedInput.email, 
        validatedInput.phone || '',
        validatedInput.paymentIntentId,
        createdAt
      )
      .first<Supply>();

    if (!result) {
      throw new Error('Failed to create supply');
    }

    return c.json({ supply: result }, 201);
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
      return c.json({ error: 'You have already supplied to this demand' }, 409);
    }
    
    console.error('[Create Supply] Error:', error);
    return c.json({ error: 'Failed to create supply' }, 500);
  }
});

// ============================================================================
// GET SUPPLIES BY DEMAND ID
// ============================================================================
supply.get('/api/supply/demand/:demandId', async (c) => {
  try {
    const demandId = c.req.param('demandId');

    // Validate demand ID
    const validatedDemandId = demandIdSchema.parse(demandId);

    // Query supplies by demand ID
    const result = await c.env.DB
      .prepare('SELECT * FROM supply WHERE demandId = ? ORDER BY createdAt DESC')
      .bind(validatedDemandId)
      .all();

    return c.json({ 
      supply: result.results as Supply[],
      count: result.results.length
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get Supplies By Demand ID] Error:', error);
    return c.json({ error: 'Failed to retrieve supplies' }, 500);
  }
});

// ============================================================================
// GET SUPPLIES BY USER ID
// ============================================================================
supply.get('/api/supply/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // Validate user ID
    const validatedUserId = userIdSchema.parse(userId);

    // Query supplies by user ID
    const result = await c.env.DB
      .prepare('SELECT * FROM supply WHERE userId = ? ORDER BY createdAt DESC')
      .bind(validatedUserId)
      .all();

    return c.json({ 
      supply: result.results as Supply[],
      count: result.results.length
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get Supplies By User ID] Error:', error);
    return c.json({ error: 'Failed to retrieve supplies' }, 500);
  }
});

// ============================================================================
// GET SUPPLY BY ID
// ============================================================================
supply.get('/api/supply/:supplyId', async (c) => {
  try {
    const supplyId = c.req.param('supplyId');

    // Validate supply ID
    const validatedSupplyId = supplyIdSchema.parse(supplyId);

    // Query supply by ID
    const result = await c.env.DB
      .prepare('SELECT * FROM supply WHERE id = ?')
      .bind(validatedSupplyId)
      .first<Supply>();

    if (!result) {
      return c.json({ error: 'Supply not found' }, 404);
    }

    return c.json({ supply: result });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Get Supply By ID] Error:', error);
    return c.json({ error: 'Failed to retrieve supply' }, 500);
  }
});

// ============================================================================
// DELETE SUPPLY (Authenticated - user can only delete their own)
// ============================================================================
supply.delete('/api/supply/:supplyId', async (c) => {
  try {
    // TODO: Get userId from authenticated session
    const userId = 1; // Replace with actual auth

    const supplyId = c.req.param('supplyId');

    // Validate supply ID
    const validatedSupplyId = supplyIdSchema.parse(supplyId);

    // Check if supply exists and belongs to user
    const existing = await c.env.DB
      .prepare('SELECT * FROM supply WHERE id = ?')
      .bind(validatedSupplyId)
      .first<Supply>();

    if (!existing) {
      return c.json({ error: 'Supply not found' }, 404);
    }

    if (existing.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Delete supply
    await c.env.DB
      .prepare('DELETE FROM supply WHERE id = ?')
      .bind(validatedSupplyId)
      .run();

    return c.json({ success: true });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }
    
    console.error('[Delete Supply] Error:', error);
    return c.json({ error: 'Failed to delete supply' }, 500);
  }
});

export default supply;
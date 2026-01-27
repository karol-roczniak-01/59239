import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '..';

const payment = new Hono<{ Bindings: Env }>();

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
// CREATE PAYMENT INTENT
// ============================================================================
const createPaymentIntentSchema = z.object({
  demandId: z.number().int().positive(),
  userId: z.number().int().positive()
});

payment.post('/api/payment/create-intent', async (c) => {
  try {
    const body = await c.req.json();
    const validated = createPaymentIntentSchema.parse(body);

    // Verify demand exists
    const demand = await c.env.DB
      .prepare('SELECT id FROM demand WHERE id = ?')
      .bind(validated.demandId)
      .first();

    if (!demand) {
      return c.json({ error: 'Demand not found' }, 404);
    }

    // Create Stripe PaymentIntent
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: '1000', // $10.00 in cents
        currency: 'usd',
        'metadata[demandId]': validated.demandId.toString(),
        'metadata[userId]': validated.userId.toString(),
        'automatic_payment_methods[enabled]': 'true',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Payment Intent] Stripe error:', error);
      throw new Error('Failed to create payment intent');
    }

    const paymentIntent = await response.json();

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Create Payment Intent] Error:', error);
    return c.json({ error: 'Failed to create payment intent' }, 500);
  }
});

// ============================================================================
// VERIFY PAYMENT STATUS
// ============================================================================
const verifyPaymentSchema = z.object({
  paymentIntentId: z.string().min(1)
});

payment.post('/api/payment/verify', async (c) => {
  try {
    const body = await c.req.json();
    const validated = verifyPaymentSchema.parse(body);

    // Retrieve PaymentIntent from Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${validated.paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const paymentIntent = await response.json();

    return c.json({
      status: paymentIntent.status,
      demandId: paymentIntent.metadata.demandId,
      userId: paymentIntent.metadata.userId,
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Verify Payment] Error:', error);
    return c.json({ error: 'Failed to verify payment' }, 500);
  }
});

export default payment;
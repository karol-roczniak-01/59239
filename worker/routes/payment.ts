import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '..'

const payment = new Hono<{ Bindings: Env }>()

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
// CREATE CHECKOUT SESSION
// ============================================================================
const createCheckoutSessionSchema = z.object({
  demandId: z.string(),
  userId: z.string(),
})

payment.post('/api/payment/create-checkout', async (c) => {
  try {
    const body = await c.req.json()
    const validated = createCheckoutSessionSchema.parse(body)

    // Verify demand exists
    const demand = await c.env.DB.prepare('SELECT id FROM demand WHERE id = ?')
      .bind(validated.demandId)
      .first()

    if (!demand) {
      return c.json({ error: 'Demand not found' }, 404)
    }

    // Create Stripe Checkout Session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': '14900',
        'line_items[0][price_data][tax_behavior]': 'inclusive',
        'line_items[0][price_data][product_data][name]': 'Qualified Lead Access',
        'line_items[0][price_data][product_data][tax_code]': 'txcd_10701400',
        'automatic_tax[enabled]': 'true',
        'tax_id_collection[enabled]': 'true',
        'metadata[demandId]': validated.demandId,
        'metadata[userId]': validated.userId,
        // 👇 these two lines copy metadata onto the PaymentIntent too
        'payment_intent_data[metadata][demandId]': validated.demandId,
        'payment_intent_data[metadata][userId]': validated.userId,
        success_url: `${c.env.APP_URL}/demand/${validated.demandId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${c.env.APP_URL}/demand/${validated.demandId}?cancelled=true`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Checkout Session] Stripe error:', error)
      throw new Error('Failed to create checkout session')
    }

    const session = await response.json()

    return c.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status)
    }

    console.error('[Create Checkout Session] Error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

// ============================================================================
// VERIFY PAYMENT STATUS
// ============================================================================
const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1),
})

payment.post('/api/payment/verify', async (c) => {
  try {
    const body = await c.req.json()
    const validated = verifyPaymentSchema.parse(body)

    // Retrieve Checkout Session from Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${validated.sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error('Failed to verify payment')
    }

    const session = await response.json()

    // Only return success if actually paid
    if (session.payment_status !== 'paid') {
      return c.json({ error: 'Payment not completed' }, 402)
    }

    return c.json({
      status: session.payment_status,         // 'paid' | 'unpaid' | 'no_payment_required'
      paymentIntentId: session.payment_intent, // still available for your records
      demandId: session.metadata.demandId,
      userId: session.metadata.userId,
      amountSubtotal: session.amount_subtotal, // your $149 in cents
      amountTotal: session.amount_total,       // $149 + tax in cents
    })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status)
    }

    console.error('[Verify Payment] Error:', error)
    return c.json({ error: 'Failed to verify payment' }, 500)
  }
})

export default payment
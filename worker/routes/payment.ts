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
// PRICING MAP
// Fixed rates — update periodically to stay roughly ~$149 equivalent
// ============================================================================
const PRICING: Record<string, { currency: string; amount: number; locale: string }> = {
  PL: { currency: 'pln', amount: 49900, locale: 'pl-PL' }, // ~499 PLN
  GB: { currency: 'gbp', amount: 11900, locale: 'en-GB' }, // ~£119
  DE: { currency: 'eur', amount: 13900, locale: 'de-DE' }, // ~€139
  FR: { currency: 'eur', amount: 13900, locale: 'fr-FR' }, // ~€139
}

const DEFAULT_PRICE = { currency: 'usd', amount: 14900 }

const getPrice = (country: string) => PRICING[country] ?? null

type CfRequest = Request & { cf?: { country?: string } }

// ============================================================================
// PRICE DISPLAY
// ============================================================================
payment.get('/api/payment/price', (c) => {
  const cf = (c.req.raw as CfRequest).cf
  const country = cf?.country ?? 'US'

  const price = getPrice(country)
  if (!price) return c.json({ display: '$149', note: '', country })

  const display = new Intl.NumberFormat(price.locale, {
    style: 'currency',
    currency: price.currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(price.amount / 100)

  return c.json({ display, note: '~$149', country })
})

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

    const cf = (c.req.raw as CfRequest).cf
    const country = cf?.country ?? 'US'
    const price = getPrice(country) ?? DEFAULT_PRICE

    // Verify demand exists
    const demand = await c.env.DB.prepare('SELECT id FROM demand WHERE id = ?')
      .bind(validated.demandId)
      .first()

    if (!demand) {
      return c.json({ error: 'Demand not found' }, 404)
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': price.currency,
        'line_items[0][price_data][unit_amount]': price.amount.toString(),
        'line_items[0][price_data][tax_behavior]': 'inclusive',
        'line_items[0][price_data][product_data][name]': 'Qualified Lead Access',
        'line_items[0][price_data][product_data][tax_code]': 'txcd_10701400',
        'automatic_tax[enabled]': 'true',
        'tax_id_collection[enabled]': 'true',
        'billing_address_collection': 'required',
        'customer_creation': 'always',
        // Session-level metadata (readable directly from session object)
        'metadata[demandId]': validated.demandId,
        'metadata[userId]': validated.userId,
        'metadata[type]': '5-92-39-lead-access',
        // Invoice creation
        'invoice_creation[enabled]': 'true',
        'invoice_creation[invoice_data][metadata][demandId]': validated.demandId,
        'invoice_creation[invoice_data][metadata][userId]': validated.userId,
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

    return c.json({ checkoutUrl: session.url, sessionId: session.id })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) return c.json({ error: zodError.error }, zodError.status)

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

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${validated.sessionId}`,
      { headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` } },
    )

    if (!response.ok) throw new Error('Failed to verify payment')

    const session = await response.json()

    if (session.payment_status !== 'paid') {
      return c.json({ error: 'Payment not completed' }, 402)
    }

    return c.json({
      status: session.payment_status,
      paymentIntentId: session.payment_intent,
      // Now correctly reading from session.metadata (not payment_intent metadata)
      demandId: session.metadata.demandId,
      userId: session.metadata.userId,
      amountSubtotal: session.amount_subtotal,
      amountTotal: session.amount_total,
    })
  } catch (error) {
    const zodError = handleZodError(error)
    if (zodError) return c.json({ error: zodError.error }, zodError.status)

    console.error('[Verify Payment] Error:', error)
    return c.json({ error: 'Failed to verify payment' }, 500)
  }
})

export default payment
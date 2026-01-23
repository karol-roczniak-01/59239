import { Hono } from 'hono';
import { z } from 'zod';
import {
  propertyDemandIdSchema,
  userIdSchema,
  createPropertyDemandSchema,
  updatePropertyDemandSchema,
  type ApiPropertyDemand,
  type DbPropertyDemand
} from '../schemas/propertiesDemand';
import type { Env } from '..';

const propertiesDemand = new Hono<{ Bindings: Env }>();

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
// HELPER: Map DB PropertyDemand to API PropertyDemand
// ============================================================================
const mapPropertyDemandToApi = (demand: DbPropertyDemand): ApiPropertyDemand => ({
  id: demand.id,
  userId: demand.userId,
  propertyType: demand.propertyType,
  propertySubType: demand.propertySubType,
  propertyCategory: demand.propertyCategory,
  locationLat: demand.locationLat,
  locationLng: demand.locationLng,
  locationRadius: demand.locationRadius,
  locationLabel: demand.locationLabel,
  conditions: demand.conditions,
  mustHave: demand.mustHave,
  niceToHave: demand.niceToHave,
  paymentType: demand.paymentType,
  currency: demand.currency,
  minPrice: demand.minPrice,
  maxPrice: demand.maxPrice,
});

// ============================================================================
// GET ALL PROPERTY DEMANDS FOR A USER
// ============================================================================
propertiesDemand.get('/api/users/:userId/properties-demand', async (c) => {
  try {
    const userId = c.req.param('userId');
    const validatedUserId = userIdSchema.parse(userId);

    const result = await c.env.DB
      .prepare('SELECT id, userId, propertyType, propertySubType, propertyCategory, locationLat, locationLng, locationRadius, locationLabel, conditions, mustHave, niceToHave, paymentType, currency, minPrice, maxPrice, FROM PropertiesDemand WHERE userId = ?')
      .bind(validatedUserId)
      .all();

    return c.json({
      propertiesDemand: result.results.map((demand) => mapPropertyDemandToApi(demand as DbPropertyDemand))
    });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Get Properties Demand] Error:', error);
    return c.json({ error: 'Failed to retrieve properties demand' }, 500);
  }
});

// ============================================================================
// GET PROPERTY DEMAND BY ID
// ============================================================================
propertiesDemand.get('/api/properties-demand/:demandId', async (c) => {
  try {
    const demandId = c.req.param('demandId');
    const validatedDemandId = propertyDemandIdSchema.parse(demandId);

    const demand = await c.env.DB
      .prepare('SELECT id, userId, propertyType, propertySubType, propertyCategory, locationLat, locationLng, locationRadius, locationLabel, conditions, mustHave, niceToHave, paymentType, currency, minPrice, maxPrice, FROM PropertiesDemand WHERE id = ?')
      .bind(validatedDemandId)
      .first<DbPropertyDemand>();

    if (!demand) {
      return c.json({ error: 'Property demand not found' }, 404);
    }

    return c.json({ propertyDemand: mapPropertyDemandToApi(demand) });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Get Property Demand By ID] Error:', error);
    return c.json({ error: 'Failed to retrieve property demand' }, 500);
  }
});

// ============================================================================
// CREATE PROPERTY DEMAND
// ============================================================================
propertiesDemand.post('/api/properties-demand', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createPropertyDemandSchema.parse(body);

    const result = await c.env.DB
      .prepare('INSERT INTO PropertiesDemand (userId, propertyType, propertySubType, propertyCategory, locationLat, locationLng, locationRadius, locationLabel, conditions, mustHave, niceToHave, paymentType, currency, minPrice, maxPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, userId, propertyType, propertySubType, propertyCategory, locationLat, locationLng, locationRadius, locationLabel, paymentType, conditions, currency, minPrice, maxPrice, mustHave, niceToHave')
      .bind(
        validatedData.userId,
        validatedData.propertyType,
        validatedData.propertySubType ?? null,
        validatedData.propertyCategory ?? null,
        validatedData.locationLat ?? null,
        validatedData.locationLng ?? null,
        validatedData.locationRadius ?? null,
        validatedData.locationLabel ?? null,
        validatedData.conditions ?? null,
        validatedData.mustHave ?? null,
        validatedData.niceToHave ?? null,
        validatedData.paymentType ?? null,
        validatedData.currency ?? 'usd',
        validatedData.minPrice ?? null,
        validatedData.maxPrice ?? null,
      )
      .first<DbPropertyDemand>();

    if (!result) {
      return c.json({ error: 'Failed to create property demand' }, 500);
    }

    return c.json({ propertyDemand: mapPropertyDemandToApi(result) }, 201);
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Create Property Demand] Error:', error);
    return c.json({ error: 'Failed to create property demand' }, 500);
  }
});

// ============================================================================
// UPDATE PROPERTY DEMAND
// ============================================================================
propertiesDemand.patch('/api/properties-demand/:demandId', async (c) => {
  try {
    const demandId = c.req.param('demandId');
    const body = await c.req.json();

    const validatedDemandId = propertyDemandIdSchema.parse(demandId);
    const validatedData = updatePropertyDemandSchema.parse(body);

    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.propertyType !== undefined) {
      updates.push('propertyType = ?');
      values.push(validatedData.propertyType);
    }
    if (validatedData.propertySubType !== undefined) {
      updates.push('propertySubType = ?');
      values.push(validatedData.propertySubType ?? null);
    }
    if (validatedData.propertyCategory !== undefined) {
      updates.push('propertyCategory = ?');
      values.push(validatedData.propertyCategory ?? null);
    }
    if (validatedData.locationLat !== undefined) {
      updates.push('locationLat = ?');
      values.push(validatedData.locationLat ?? null);
    }
    if (validatedData.locationLng !== undefined) {
      updates.push('locationLng = ?');
      values.push(validatedData.locationLng ?? null);
    }
    if (validatedData.locationRadius !== undefined) {
      updates.push('locationRadius = ?');
      values.push(validatedData.locationRadius ?? null);
    }
    if (validatedData.locationLabel !== undefined) {
      updates.push('locationLabel = ?');
      values.push(validatedData.locationLabel ?? null);
    }
    if (validatedData.conditions !== undefined) {
      updates.push('conditions = ?');
      values.push(validatedData.conditions ?? null);
    }
    if (validatedData.mustHave !== undefined) {
      updates.push('mustHave = ?');
      values.push(validatedData.mustHave ?? null);
    }
    if (validatedData.niceToHave !== undefined) {
      updates.push('niceToHave = ?');
      values.push(validatedData.niceToHave ?? null);
    }
    if (validatedData.paymentType !== undefined) {
      updates.push('paymentType = ?');
      values.push(validatedData.paymentType ?? null);
    }
    if (validatedData.currency !== undefined) {
      updates.push('currency = ?');
      values.push(validatedData.currency ?? null);
    }
    if (validatedData.minPrice !== undefined) {
      updates.push('minPrice = ?');
      values.push(validatedData.minPrice ?? null);
    }
    if (validatedData.maxPrice !== undefined) {
      updates.push('maxPrice = ?');
      values.push(validatedData.maxPrice ?? null);
    }
    values.push(validatedDemandId);

    const result = await c.env.DB
      .prepare(`UPDATE PropertiesDemand SET ${updates.join(', ')} WHERE id = ? RETURNING id, userId, propertyType, propertySubType, propertyCategory, locationLat, locationLng, locationRadius, locationLabel, paymentType, conditions, currency, minPrice, maxPrice, mustHave, niceToHave`)
      .bind(...values)
      .first<DbPropertyDemand>();

    if (!result) {
      return c.json({ error: 'Property demand not found' }, 404);
    }

    return c.json({ propertyDemand: mapPropertyDemandToApi(result) });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Update Property Demand] Error:', error);
    return c.json({ error: 'Failed to update property demand' }, 500);
  }
});

// ============================================================================
// DELETE PROPERTY DEMAND
// ============================================================================
propertiesDemand.delete('/api/properties-demand/:demandId', async (c) => {
  try {
    const demandId = c.req.param('demandId');
    const validatedDemandId = propertyDemandIdSchema.parse(demandId);

    const result = await c.env.DB
      .prepare('DELETE FROM PropertiesDemand WHERE id = ? RETURNING id')
      .bind(validatedDemandId)
      .first();

    if (!result) {
      return c.json({ error: 'Property demand not found' }, 404);
    }

    return c.json({ message: 'Property demand deleted successfully' });
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) {
      return c.json({ error: zodError.error }, zodError.status);
    }

    console.error('[Delete Property Demand] Error:', error);
    return c.json({ error: 'Failed to delete property demand' }, 500);
  }
});

export default propertiesDemand;
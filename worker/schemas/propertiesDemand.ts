import { z } from 'zod';

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const propertyDemandIdSchema = z.coerce.number()
  .int()
  .positive('Invalid property demand ID');

export const userIdSchema = z.coerce.number()
  .int()
  .positive('Invalid user ID');

export const propertyTypeSchema = z.string()
  .min(1, 'Property type is required')
  .max(50, 'Property type is too long')
  .trim()
  .transform(sanitizeInput);

export const propertySubTypeSchema = z.string()
  .max(50, 'Property subtype is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const propertyCategorySchema = z.string()
  .max(50, 'Property category is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const locationLatSchema = z.number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90')
  .optional()
  .nullable();

export const locationLngSchema = z.number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180')
  .optional()
  .nullable();

export const locationRadiusSchema = z.number()
  .int()
  .min(5, 'Radius must be at least 5km')
  .max(500, 'Radius must be at most 500km')
  .optional()
  .nullable();

export const locationLabelSchema = z.string()
  .max(200, 'Location label is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const conditionsSchema = z.string()
  .max(50, 'Conditions is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const mustHaveSchema = z.string()
  .max(500, 'Must have is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const niceToHaveSchema = z.string()
  .max(500, 'Nice to have is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const paymentTypeSchema = z.string()
  .max(50, 'Payment type is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const currencySchema = z.string()
  .max(10, 'Currency is too long')
  .trim()
  .transform(sanitizeInput)
  .optional()
  .nullable();

export const minPriceSchema = z.number()
  .min(0, 'Minimum price must be at least 0')
  .optional()
  .nullable();

export const maxPriceSchema = z.number()
  .min(0, 'Maximum price must be at least 0')
  .optional()
  .nullable();

export const createPropertyDemandSchema = z.object({
  userId: userIdSchema,
  propertyType: propertyTypeSchema,
  propertySubType: propertySubTypeSchema,
  propertyCategory: propertyCategorySchema,
  locationLat: locationLatSchema,
  locationLng: locationLngSchema,
  locationRadius: locationRadiusSchema,
  locationLabel: locationLabelSchema,
  conditions: conditionsSchema,
  mustHave: mustHaveSchema,
  niceToHave: niceToHaveSchema,
  paymentType: paymentTypeSchema,
  currency: currencySchema,
  minPrice: minPriceSchema,
  maxPrice: maxPriceSchema,
}).refine(
  (data) => {
    if (data.minPrice !== null && data.minPrice !== undefined && 
        data.maxPrice !== null && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: 'Minimum price must be less than or equal to maximum price' }
);


export const updatePropertyDemandSchema = z.object({
  propertyType: propertyTypeSchema.optional(),
  propertySubType: propertySubTypeSchema,
  propertyCategory: propertyCategorySchema,
  locationLat: locationLatSchema,
  locationLng: locationLngSchema,
  locationRadius: locationRadiusSchema,
  locationLabel: locationLabelSchema,
  paymentType: paymentTypeSchema,
  conditions: conditionsSchema,
  mustHave: mustHaveSchema,
  niceToHave: niceToHaveSchema,
  currency: currencySchema,
  minPrice: minPriceSchema,
  maxPrice: maxPriceSchema,
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
).refine(
  (data) => {
    if (data.minPrice !== null && data.minPrice !== undefined && 
        data.maxPrice !== null && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: 'Minimum price must be less than or equal to maximum price' }
);

export const dbPropertyDemandSchema = z.object({
  id: z.number(),
  userId: z.number(),
  propertyType: z.string(),
  propertySubType: z.string().nullable(),
  propertyCategory: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  locationRadius: z.number().nullable(),
  locationLabel: z.string().nullable(),
  conditions: z.string().nullable(),
  mustHave: z.string().nullable(),
  niceToHave: z.string().nullable(),
  paymentType: z.string().nullable(),
  currency: z.string().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
});

export const apiPropertyDemandSchema = z.object({
  id: z.number(),
  userId: z.number(),
  propertyType: z.string(),
  propertySubType: z.string().nullable(),
  propertyCategory: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  locationRadius: z.number().nullable(),
  locationLabel: z.string().nullable(),
  conditions: z.string().nullable(),
  mustHave: z.string().nullable(),
  niceToHave: z.string().nullable(),
  paymentType: z.string().nullable(),
  currency: z.string().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
});

export type DbPropertyDemand = z.infer<typeof dbPropertyDemandSchema>;
export type ApiPropertyDemand = z.infer<typeof apiPropertyDemandSchema>;
export type CreatePropertyDemand = z.infer<typeof createPropertyDemandSchema>;
export type UpdatePropertyDemand = z.infer<typeof updatePropertyDemandSchema>;
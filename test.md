export const propertyCategories = {
  transactionTypes: [
    { id: 'sale', label: 'Sale' },
    { id: 'lease-rent', label: 'Lease/Rent' },
    { id: 'joint-venture', label: 'Joint Venture/Partnership' },
    { id: 'development-rights', label: 'Development Rights' }
  ],

  PROPERTY_TYPES: [
    {
      id: 'residential',
      label: 'Residential',
      subtypes: [
        { id: 'single-family', label: 'Single-family home' },
        { id: 'multi-family', label: 'Multi-family (2-4 units)' },
        { id: 'apartment-condo', label: 'Apartment/Condo' },
        { id: 'townhouse', label: 'Townhouse' },
        { id: 'luxury-estate', label: 'Luxury/Estate' },
        { id: 'mobile-manufactured', label: 'Mobile/Manufactured home' },
        { id: 'residential-lot', label: 'Residential land/lot' }
      ]
    },
    {
      id: 'commercial',
      label: 'Commercial',
      subtypes: [
        {
          id: 'office',
          label: 'Office',
          categories: [
            { id: 'office-class-abc', label: 'Class A/B/C' },
            { id: 'medical-office', label: 'Medical office' },
            { id: 'coworking', label: 'Co-working space' }
          ]
        },
        {
          id: 'retail',
          label: 'Retail',
          categories: [
            { id: 'shopping-center', label: 'Shopping center/mall' },
            { id: 'strip-mall', label: 'Strip mall' },
            { id: 'standalone-retail', label: 'Standalone retail' },
            { id: 'restaurant', label: 'Restaurant/food service' }
          ]
        },
        {
          id: 'industrial',
          label: 'Industrial',
          categories: [
            { id: 'warehouse', label: 'Warehouse/distribution' },
            { id: 'manufacturing', label: 'Manufacturing facility' },
            { id: 'flex-space', label: 'Flex space' },
            { id: 'cold-storage', label: 'Cold storage' }
          ]
        },
        {
          id: 'mixed-use',
          label: 'Mixed-use',
          categories: []
        }
      ]
    },
    {
      id: 'hospitality',
      label: 'Hospitality',
      subtypes: [
        { id: 'hotel', label: 'Hotel' },
        { id: 'motel', label: 'Motel' },
        { id: 'resort', label: 'Resort' },
        { id: 'bed-breakfast', label: 'Bed & breakfast' },
        { id: 'short-term-rental', label: 'Short-term rental property' }
      ]
    },
    {
      id: 'special-purpose',
      label: 'Special Purpose',
      subtypes: [
        { id: 'healthcare-facility', label: 'Healthcare facility' },
        { id: 'educational-facility', label: 'Educational facility' },
        { id: 'religious-facility', label: 'Religious facility' },
        { id: 'entertainment-recreation', label: 'Entertainment/recreation' },
        { id: 'gas-station', label: 'Gas station/car wash' },
        { id: 'self-storage', label: 'Self-storage' },
        { id: 'parking-facility', label: 'Parking facility' }
      ]
    },
    {
      id: 'land',
      label: 'Land',
      subtypes: [
        { id: 'residential-development', label: 'Residential development land' },
        { id: 'commercial-development', label: 'Commercial development land' },
        { id: 'agricultural-land', label: 'Agricultural/farm land' },
        { id: 'industrial-land', label: 'Industrial land' },
        { id: 'raw-undeveloped', label: 'Raw/undeveloped land' }
      ]
    },
    {
      id: 'agricultural',
      label: 'Agricultural',
      subtypes: [
        { id: 'crop-land', label: 'Crop land' },
        { id: 'ranch-livestock', label: 'Ranch/livestock' },
        { id: 'orchard-vineyard', label: 'Orchard/vineyard' },
        { id: 'timber-land', label: 'Timber land' },
        { id: 'farm-buildings', label: 'Farm with buildings' }
      ]
    }
  ],

  sizeUnits: [
    { id: 'sqft', label: 'Square feet' },
    { id: 'sqm', label: 'Square meters' },
    { id: 'acres', label: 'Acres' },
    { id: 'units', label: 'Units' }
  ],

  condition: [
    { id: 'new-construction', label: 'New construction' },
    { id: 'renovated', label: 'Renovated/updated' },
    { id: 'move-in-ready', label: 'Move-in ready' },
    { id: 'needs-renovation', label: 'Needs renovation' },
    { id: 'teardown', label: 'Teardown/redevelopment opportunity' },
    { id: 'under-construction', label: 'Under construction' }
  ],

  currencies: [
    { id: 'USD', label: 'USD ($)', symbol: '$' },
    { id: 'EUR', label: 'EUR (€)', symbol: '€' },
    { id: 'GBP', label: 'GBP (£)', symbol: '£' },
    { id: 'PLN', label: 'PLN (zł)', symbol: 'zł' }
  ]
};

// Type definitions
export type TransactionType = 'sale' | 'lease-rent' | 'joint-venture' | 'development-rights';

export type PropertyType = 
  | 'residential'
  | 'commercial'
  | 'hospitality'
  | 'special-purpose'
  | 'land'
  | 'agricultural';

export interface PropertyDemand {
  id?: number;
  propertyType: string;
  size?: number;
  sizeUnit?: string;
  condition?: string;
  location?: string;
  transactionType?: string;
  currency?: string;
  priceMin?: number;
  priceMax?: number;
}

// Helper functions
export const getSubtypes = (propertyTypeId: string) => {
  const propertyType = propertyCategories.PROPERTY_TYPES.find(pt => pt.id === propertyTypeId);
  return propertyType?.subtypes || [];
};

export const getCategories = (propertyTypeId: string, subtypeId: string) => {
  const propertyType = propertyCategories.PROPERTY_TYPES.find(pt => pt.id === propertyTypeId);
  const subtype = propertyType?.subtypes?.find((st: any) => st.id === subtypeId);
  return (subtype as any)?.categories || [];
};
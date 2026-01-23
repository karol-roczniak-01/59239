export const PROPERTY_TYPES = [
  {
    value: 'residential',
    label: 'Residential',
    subtypes: [
      { value: 'single-family', label: 'Single-family home' },
      { value: 'multi-family', label: 'Multi-family (2-4 units)' },
      { value: 'apartment-condo', label: 'Apartment/Condo' },
      { value: 'townhouse', label: 'Townhouse' },
      { value: 'luxury-estate', label: 'Luxury/Estate' },
      { value: 'mobile-manufactured', label: 'Mobile/Manufactured home' },
      { value: 'residential-lot', label: 'Residential land/lot' }
    ]
  },
  {
    value: 'commercial',
    label: 'Commercial',
    subtypes: [
      {
        value: 'office',
        label: 'Office',
        categories: [
          { value: 'office-class-abc', label: 'Class A/B/C' },
          { value: 'medical-office', label: 'Medical office' },
          { value: 'coworking', label: 'Co-working space' }
        ]
      },
        {
          value: 'retail',
          label: 'Retail',
          categories: [
            { value: 'shopping-center', label: 'Shopping center/mall' },
            { value: 'strip-mall', label: 'Strip mall' },
            { value: 'standalone-retail', label: 'Standalone retail' },
            { value: 'restaurant', label: 'Restaurant/food service' }
          ]
        },
        {
          value: 'industrial',
          label: 'Industrial',
          categories: [
            { value: 'warehouse', label: 'Warehouse/distribution' },
            { value: 'manufacturing', label: 'Manufacturing facility' },
            { value: 'flex-space', label: 'Flex space' },
            { value: 'cold-storage', label: 'Cold storage' }
          ]
        },
        {
          value: 'mixed-use',
          label: 'Mixed-use',
          categories: []
        }
      ]
  },
  {
    value: 'hospitality',
    label: 'Hospitality',
    subtypes: [
      { value: 'hotel', label: 'Hotel' },
      { value: 'motel', label: 'Motel' },
      { value: 'resort', label: 'Resort' },
      { value: 'bed-breakfast', label: 'Bed & breakfast' },
      { value: 'short-term-rental', label: 'Short-term rental property' }
    ]
  },
  {
    value: 'special-purpose',
    label: 'Special Purpose',
    subtypes: [
      { value: 'healthcare-facility', label: 'Healthcare facility' },
      { value: 'educational-facility', label: 'Educational facility' },
      { value: 'religious-facility', label: 'Religious facility' },
      { value: 'entertainment-recreation', label: 'Entertainment/recreation' },
      { value: 'gas-station', label: 'Gas station/car wash' },
      { value: 'self-storage', label: 'Self-storage' },
      { value: 'parking-facility', label: 'Parking facility' }
    ]
  },
  {
    value: 'land',
    label: 'Land',
    subtypes: [
      { value: 'residential-development', label: 'Residential development land' },
      { value: 'commercial-development', label: 'Commercial development land' },
      { value: 'agricultural-land', label: 'Agricultural/farm land' },
      { value: 'industrial-land', label: 'Industrial land' },
      { value: 'raw-undeveloped', label: 'Raw/undeveloped land' }
    ]
  },
  {
    value: 'agricultural',
    label: 'Agricultural',
    subtypes: [
      { value: 'crop-land', label: 'Crop land' },
      { value: 'ranch-livestock', label: 'Ranch/livestock' },
      { value: 'orchard-vineyard', label: 'Orchard/vineyard' },
      { value: 'timber-land', label: 'Timber land' },
      { value: 'farm-buildings', label: 'Farm with buildings' }
    ]
  }
]
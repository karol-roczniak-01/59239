import { Button } from '@/components/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import DeepSelect from '@/components/DeepSelect'
import LocationSelect from '@/components/LocationSelect'
import { useForm } from '@tanstack/react-form'
import { ChevronRight, ChevronLeft, Loader as LoaderIcon, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/Input'
import { useAuth } from '@/routes/-auth'
import { PROPERTY_TYPES } from '@/utils/options/properties.ts/propertyTypes'
import SimpleSelect from '@/components/SimpleSelect'
import { PAYMENT_TYPES } from '@/utils/options/properties.ts/paymentTypes'
import { CONDITIONS } from '@/utils/options/properties.ts/conditions'
import RangeSlider from '@/components/RangeSlider'

export const Route = createFileRoute('/_authenticated/demand/properties')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const form = useForm({
    defaultValues: {
      property: {},
      location: { lat: 0, lng: 0, radius: 0, label: '' },
      conditions: '',
      mustHave: '',
      niceToHave: '',
      paymentType: '',
      priceRange: { min: 0, max: 10000 },      
    },
    onSubmit: async ({ value }) => {
      try {
        // Extract nested property values
        const propertyPath = extractPathValues(value.property);
        
        const response = await fetch('/api/properties-demand', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            propertyType: propertyPath[0] || null,
            propertySubType: propertyPath[1] || null,
            propertyCategory: propertyPath[2] || null,
            locationLat: value.location.lat || null,
            locationLng: value.location.lng || null,
            locationRadius: value.location.radius || null,
            locationLabel: value.location.label || null,
            conditions: value.conditions || null,
            mustHave: value.mustHave || null,
            niceToHave: value.niceToHave || null,
            paymentType: value.paymentType || null,
            currency: 'usd',
            minPrice: value.priceRange.min || null,
            maxPrice: value.priceRange.max || null,
          }),
        });

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100));
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create property demand');
        }
        
        alert('Property demand created successfully!\n\n' + JSON.stringify(data.propertyDemand, null, 2));
        navigate({ to: '/' });
      } catch (err) {
        console.error('Failed to create property demand:', err);
        alert('Error: ' + (err instanceof Error ? err.message : 'Failed to create property demand'));
      }
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const extractPathValues = (obj: any): string[] => {
    const pathValues: string[] = [];
    let current = obj;
    
    while (current && typeof current === 'object') {
      const keys = Object.keys(current);
      if (keys.length === 0) break;
      pathValues.push(keys[0]);
      current = current[keys[0]];
    }
    
    return pathValues;
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <Layout>
      {/* Step 1: Property Type */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <Card className='h-full'>
            <CardHeader>
              <p>What property are you looking for?</p>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <form.Field
                name="property"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || Object.keys(value).length === 0) {
                      return 'Please select a property type';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <DeepSelect 
                    data={PROPERTY_TYPES}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    placeholder='Search property types...'
                  />
                )}
              </form.Field>
            </CardContent>
            <CardFooter>
              <form.Subscribe
                selector={(state) => ({
                  propertyError: state.fieldMeta.property?.errors?.length ?? 0,
                })}
              >
                {({ propertyError }) => (
                  <Button
                    type="submit"
                    disabled={propertyError > 0}
                    className='w-full'
                  >
                    <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                  </Button>
                )}
              </form.Subscribe>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <Card className='h-full'>
            <CardHeader>
              <p>Where are you looking?</p>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <form.Field
                name="location"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || !value.label) {
                      return 'Please select a location';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <LocationSelect 
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                  />
                )}
              </form.Field>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button
                type="button"
                onClick={handleBack}
                className='w-full'
              >
                <ChevronLeft className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  locationError: state.fieldMeta.location?.errors?.length ?? 0,
                })}
              >
                {({ locationError }) => (
                  <Button
                    type="submit"
                    disabled={locationError > 0}
                    className='w-full'
                  >
                    <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                  </Button>
                )}
              </form.Subscribe>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 3: Conditions */}
      {step === 3 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <Card className='h-full'>
            <CardHeader>
              <p>What condition do you prefer?</p>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <form.Field
                name="conditions"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return 'Please select a condition';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <SimpleSelect 
                    data={CONDITIONS}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    placeholder='Select condition...'
                  />
                )}
              </form.Field>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button
                type="button"
                onClick={handleBack}
                className='w-full'
              >
                <ChevronLeft className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  conditionsError: state.fieldMeta.conditions?.errors?.length ?? 0,
                })}
              >
                {({ conditionsError }) => (
                  <Button
                    type="submit"
                    disabled={conditionsError > 0}
                    className='w-full'
                  >
                    <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                  </Button>
                )}
              </form.Subscribe>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 4: Must Have */}
      {step === 4 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <Card className='h-full'>
            <CardHeader>
              <p>What are your must-have requirements?</p>
            </CardHeader>
            <CardContent className='flex flex-col relative'>
              <form.Field
                name="mustHave"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value.length > 500) {
                      return 'Must have must be less than 500 characters';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoFocus
                      placeholder="e.g., Minimum 50 sqm, Ground floor access..."
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="mustHave" mode="array">
                {(field) => (
                  <>
                    {field.state.meta.errors.length > 0 && (
                      <div className='absolute flex top-18 text-sm items-center gap-2 opacity-70 mt-2'>
                        <AlertTriangle className='shrink-0' size={15}/>
                        <p>{field.state.meta.errors[0]}</p>
                      </div>
                    )}
                  </>
                )}
              </form.Field>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button
                type="button"
                onClick={handleBack}
                className='w-full'
              >
                <ChevronLeft className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
              <Button
                type="submit"
                className='w-full'
              >
                <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 5: Nice to Have */}
      {step === 5 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>  {/* ← Change this */}
          <Card className='h-full'>
            <CardHeader>
              <p>Any additional preferences? (Optional)</p>
            </CardHeader>
            <CardContent className='flex flex-col relative'>
              <form.Field
                name="niceToHave"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value.length > 500) {
                      return 'Nice to have must be less than 500 characters';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoFocus
                      placeholder="e.g., Near public transport, parking available..."
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="niceToHave" mode="array">
                {(field) => (
                  <>
                    {field.state.meta.errors.length > 0 && (
                      <div className='absolute flex top-18 text-sm items-center gap-2 opacity-70 mt-2'>
                        <AlertTriangle className='shrink-0' size={15}/>
                        <p>{field.state.meta.errors[0]}</p>
                      </div>
                    )}
                  </>
                )}
              </form.Field>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button
                type="button"
                onClick={handleBack}
                className='w-full'
              >
                <ChevronLeft className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
              <Button
                type="submit"
                className='w-full'
              >
                <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 6: Payment Type */}
      {step === 6 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <Card className='h-full'>
            <CardHeader>
              <p>What payment type do you prefer?</p>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <form.Field
                name="paymentType"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return 'Please select a payment type';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <SimpleSelect 
                    data={PAYMENT_TYPES}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    placeholder='Select payment type...'
                  />
                )}
              </form.Field>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button
                type="button"
                onClick={handleBack}
                className='w-full'
              >
                <ChevronLeft className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  paymentTypeError: state.fieldMeta.paymentType?.errors?.length ?? 0,
                })}
              >
                {({ paymentTypeError }) => (
                  <Button
                    type="submit"
                    disabled={paymentTypeError > 0}
                    className='w-full'
                  >
                    <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                  </Button>
                )}
              </form.Subscribe>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 7: Price Range */}
      {step === 7 && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();  {/* ← Submit on the last step */}
          }}
        >
          <Card className='h-full'>
            <CardHeader>
              <p>What's your budget?</p>
            </CardHeader>
            <CardContent className='overflow-hidden'>
              <form.Field
                name="priceRange"
                validators={{
                  onChange: ({ value }) => {
                    if (value.min > value.max) {
                      return 'Minimum price must be less than maximum price';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <RangeSlider
                    min={0}
                    max={100000}
                    step={100}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    formatValue={formatCurrency}
                    label="Price Range (USD)"
                  />
                )}
              </form.Field>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button
                type="button"
                onClick={handleBack}
                className='w-full'
              >
                <ChevronLeft className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className='w-full'
                  >
                    {isSubmitting 
                      ? <LoaderIcon className='shrink-0 animate-spin' strokeWidth={1.5} size={18}/>
                      : <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                    }
                  </Button>
                )}
              </form.Subscribe>
            </CardFooter>
          </Card>
        </form>
      )}
    </Layout>
  )
}
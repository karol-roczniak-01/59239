import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/Button'
import { useCreateDemand } from '@/hooks/useDemand'
import Page from '@/components/Page'
import { useState } from 'react'
import FormInput from '@/components/FormInput'

export const Route = createFileRoute('/_authenticated/new-demand')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()
  const { mutate: createDemand, isPending } = useCreateDemand()
  const [apiError, setApiError] = useState<string>('')

  const form = useForm({
    defaultValues: {
      content: '',
      email: '',
      phone: '',
      days: '30',
    },
    onSubmit: async ({ value }) => {
      const daysNum = parseInt(value.days) || 0
      setApiError('')
      createDemand(
        {
          content: value.content.trim(),
          email: value.email.trim(),
          phone: value.phone.trim() || undefined,
          userId: auth.user!.id,
          days: daysNum,
        },
        {
          onSuccess: () => navigate({ to: '/my-demands' }),
          onError: (err) =>
            setApiError(err instanceof Error ? err.message : 'Failed to create demand'),
        },
      )
    },
  })

  return (
    <Page header="Describe the product or service you're looking for — be specific so suppliers can find you.">
      {apiError && <p>{apiError}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
        className="flex flex-col gap-2"
      >
        {/* Content */}
        <form.Field
          name="content"
          validators={{
            onSubmit: ({ value }) => {
              const trimmed = value.trim()
              if (!trimmed) return 'Description is required'
              if (trimmed.length < 50) return 'Minimum 50 characters'
              if (trimmed.length > 1000) return 'Maximum 1000 characters'
              return undefined
            },
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label="Description"
              textarea
              rows={5}
              counter={1000}
              hint="min 50"
              placeholder="I’m building a family home 40 km from Warsaw and need a framing crew for a 180m² single-story house. Work to start in April, budget around 40 000 PLN."
              disabled={isPending}
            />
          )}
        </form.Field>

        {/* Email */}
        <form.Field
          name="email"
          validators={{
            onSubmit: ({ value }) => {
              if (!value) return 'Email is required'
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
              return undefined
            },
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              disabled={isPending}
            />
          )}
        </form.Field>

        {/* Phone */}
        <form.Field 
          name="phone"
        >
          {(field) => (
            <FormInput
              field={field}
              label="Phone"
              type="tel"
              placeholder="+48 123 456 789 (optional)"
              disabled={isPending}
            />
          )}
        </form.Field>

        {/* Days */}
        <form.Field
          name="days"
          validators={{
            onSubmit: ({ value }) => {
              const n = parseInt(value)
              if (isNaN(n) || n < 7 || n > 180) return 'Enter between 7 and 180 days'
              return undefined
            },
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label="Days"
              type="number"
              placeholder="30"
              hint="max 180"
              suffix="days"
              min="7"
              max="180"
              className="w-10"
              disabled={isPending}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting || isPending || apiError === 'Active demand limit reached (50)'} className="w-full">
              {isSubmitting || isPending
                ? 'Creating...'
                : apiError === 'Active demand limit reached (50)'
                  ? 'Limit of 50 demands reached'
                  : 'Create'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Page>
  )
}
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/Button'
import { useCreateDemand } from '@/hooks/useDemand'
import Page from '@/components/Page'
import { useState } from 'react'
import FormInput from '@/components/FormInput'
import { useLanguage } from '@/providers/language-provider'

export const Route = createFileRoute('/_authenticated/new-demand')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLanguage()
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()
  const { mutate: createDemand, isPending } = useCreateDemand()
  const [apiError, setApiError] = useState<string>('')

  const form = useForm({
    defaultValues: {
      content: '',
      email: '',
      phone: '',
      days: '',
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
    <Page header={t('newDemandWelcome')}>
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
              if (!trimmed) return t('demandContentRequired')
              if (trimmed.length < 50) return t('demandContentMin')
              if (trimmed.length > 1000) return t('demandContentMax')
              return undefined
            },
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label={t('demandContentLabel')}
              textarea
              rows={5}
              counter={1000}
              hint="min 50"
              placeholder={t('demandContentPlaceholder')}
              disabled={isPending}
            />
          )}
        </form.Field>

        {/* Email */}
        <form.Field
          name="email"
          validators={{
            onSubmit: ({ value }) => {
              if (!value) return t('emailRequired')
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('emailValidation')
              return undefined
            },
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label={t('emailLabel')}
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
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
              label={t('phoneLabel')}
              type="tel"
              placeholder={t('phonePlaceholder')}
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
              if (isNaN(n) || n < 7 || n > 180) return t('daysValidation')
              return undefined
            },
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label={t('days')}
              type="number"
              placeholder="30"
              hint="max 180"
              suffix=""
              min="7"
              max="180"
              className="w-10"
              disabled={isPending}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting || isPending || apiError === t('activeDemandLimitReached')} className="w-full">
              {isSubmitting || isPending
                ? 'Creating...'
                : apiError === t('activeDemandLimitReached')
                  ? 'Limit of 50 demands reached'
                  : t('create')}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Page>
  )
}
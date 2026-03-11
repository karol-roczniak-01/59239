import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useAuth } from './-auth'
import { Button } from '@/components/Button'
import Loader from '@/components/Loader'
import useMobile from '@/hooks/useMobile'
import Page from '@/components/Page'
import FormInput from '@/components/FormInput'
import { useLanguage } from '@/providers/language-provider'

export const Route = createFileRoute('/login')({
  pendingComponent: () => <Loader />,
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const isMobile = useMobile()
  const [apiError, setApiError] = useState<string>('')

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setApiError('')
        await login(value.email, value.password)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Login failed')
      }
    },
  })

  return (
    <Page header={t('loginWelcome')}>
      {apiError && <p>{apiError}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-2"
      >
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
              autoFocus={!isMobile}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onSubmit: ({ value }) => (!value ? t('passwordRequired') : undefined),
          }}
        >
          {(field) => (
            <FormInput
              field={field}
              label={t('passwordLabel')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          )}
        </form.Field>

        <div className="flex pt-2">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t('loggingIn') : t('logIn')}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Page>
  )
}
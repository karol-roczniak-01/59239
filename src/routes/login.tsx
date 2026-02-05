import Loader from '@/components/Loader'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from './-auth'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Loader as AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import useMobile from '@/hooks/useMobile'

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
  const { login } = useAuth();
  const isMobile = useMobile();
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
    <Layout>
      <Card 
        className='h-80'
        asForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit()
        }}  
      >
        <CardHeader>
          <p>Login to your account</p>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          {/* API Error Message */}
          {apiError && (
            <div className='flex items-center gap-2 p-2 border text-sm'>
              <AlertCircle size={16} className='shrink-0' />
              <p>{apiError}</p>
            </div>
          )}

          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => {
                if (!value) return 'Email is required'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return 'Invalid email format'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div className='space-y-1'>
                <label htmlFor={field.name} className='block text-sm'>
                  Email
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="email@example.com"
                  autoFocus={!isMobile}
                />
                {field.state.meta.errors.length > 0 && (
                  <div className='flex items-center gap-1 text-sm text-primary/70'>
                    <AlertCircle size={14} className='shrink-0' />
                    <p>{field.state.meta.errors[0]}</p>
                  </div>
                )}
              </div>
            )}
          </form.Field>

          {/* Password */}
          <form.Field
            name="password"
            validators={{
              onSubmit: ({ value }) => {
                if (!value) return 'Password is required'
                return undefined
              },
            }}
          >
            {(field) => (
              <div className='space-y-1'>
                <label htmlFor={field.name} className='block text-sm'>
                  Password
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="*********"
                />
                {field.state.meta.errors.length > 0 && (
                  <div className='flex items-center gap-1 text-sm text-primary/70'>
                    <AlertCircle size={14} className='shrink-0' />
                    <p>{field.state.meta.errors[0]}</p>
                  </div>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
        
        <CardFooter>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
          >
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting}
                className='w-full'
              >
                {isSubmitting ? (
                  'Logging in...'
                ) : (
                  'Login'
                )}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </Layout>
  )
}
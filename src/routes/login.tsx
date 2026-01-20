import Loader from '@/components/Loader'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from './-auth'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { ChevronRight, Loader as LoaderIcon, AlertTriangle } from 'lucide-react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'

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
  const { login } = useAuth()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value.email, value.password)
      } catch (err) {
        console.error('Signin failed:', err);
      }
    },
  })
  
  return (
    <Layout>
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <Card className='h-64'>
          <CardHeader>
            <p>Enter your credentials to login</p>
          </CardHeader>
          <CardContent className='relative flex flex-col'>
            {/* Email */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Email is required'
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Invalid email format'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className='border-b-0'
                    placeholder="email@example.com"
                    autoFocus
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <div className='absolute flex top-18 text-sm items-center gap-1 opacity-70 mt-2'>
                      <AlertTriangle size={15}/>
                      <p>{field.state.meta.errors.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Password is required'
                  if (value.length < 8) return 'Password must be at least 8 characters'
                  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
                  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter'
                  if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••••"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <div className='absolute flex top-24 text-sm items-center gap-1 opacity-70 mt-2'>
                      <AlertTriangle size={15}/>
                      <p>{field.state.meta.errors.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter>
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
    </Layout>
  )
}
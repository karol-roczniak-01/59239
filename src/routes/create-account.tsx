import Loader from '@/components/Loader'
import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useAuth } from './-auth'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { AlertCircle, CircleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'

// UUID generation helper for browser
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const Route = createFileRoute('/create-account')({
  pendingComponent: () => <Loader />,
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>('');

  const form = useForm({
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    },
    onSubmit: async ({ value }) => {
      try {
        setApiError('');
        const id = generateUUID();
        await signup(id, value.username, value.fullName, value.email, value.password);
        navigate({ to: '/' });
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Signup failed');
      }
    },
  });

  return (
    <Layout>
      <Card 
        className='h-full'
        asForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardHeader>
          <p>Create your account</p>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          {/* API Error Message */}
          {apiError && (
            <div className='flex items-center gap-2 p-2 border text-sm'>
              <AlertCircle size={16} className='shrink-0' />
              <p>{apiError}</p>
            </div>
          )}

          {/* Username */}
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Username is required';
                if (value.length < 3) return 'Username must be at least 3 characters';
                if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                  return 'Username can only contain letters, numbers, underscores, and hyphens';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className='space-y-1'>
                <label htmlFor={field.name} className='block text-sm'>
                  Username (unique)
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="johndoe1"
                />
                {field.state.meta.errors.length > 0 && (
                  <div className='flex items-center gap-1 text-sm text-primary/70'>
                    <CircleAlertIcon size={14} className='shrink-0' />
                    <p>{field.state.meta.errors[0]}</p>
                  </div>
                )}
              </div>
            )}
          </form.Field>

          {/* Full Name */}
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Full name is required';
                if (value.length < 2) return 'Full name must be at least 2 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className='space-y-1'>
                <label htmlFor={field.name} className='block text-sm'>
                  Full Name
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="John Doe"
                />
                {field.state.meta.errors.length > 0 && (
                  <div className='flex items-center gap-1 text-sm text-primary/70'>
                    <CircleAlertIcon size={14} className='shrink-0' />
                    <p>{field.state.meta.errors[0]}</p>
                  </div>
                )}
              </div>
            )}
          </form.Field>

          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return 'Invalid email format';
                }
                return undefined;
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
              onChange: ({ value }) => {
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
                if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
                if (!/[0-9]/.test(value)) return 'Must contain at least one number';
                return undefined;
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
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
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

          {/* Confirm Password */}
          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                if (!value) return 'Please confirm your password';
                const password = fieldApi.form.getFieldValue('password');
                if (value !== password) return 'Passwords do not match';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className='space-y-1'>
                <label htmlFor={field.name} className='block text-sm'>
                  Confirm Password
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
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

          {/* Accept Terms */}
          <form.Field
            name="acceptTerms"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'You must accept the Terms of Service';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className='space-y-1 pt-2'>
                <div className='flex items-start gap-2'>
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className='mt-1'
                  />
                  <label htmlFor={field.name} className='text-sm'>
                    I agree to the{' '}
                    <Link to="/docs/terms" className="underline">
                      Terms of Service
                    </Link>
                  </label>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <div className='flex items-center gap-1 text-sm text-primary/70 ml-6'>
                    <CircleAlertIcon size={14} className='shrink-0' />
                    <p>{field.state.meta.errors[0]}</p>
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
                {isSubmitting ? (
                  'Creating account...'
                ) : (
                  'Create Account'
                )}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </Layout>
  )
}
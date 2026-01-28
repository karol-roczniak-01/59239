import Loader from '@/components/Loader'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from './-auth'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Loader as LoaderIcon, AlertCircleIcon, AlertCircle } from 'lucide-react'
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
      type: 'human',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    onSubmit: async ({ value }) => {
      try {
        setApiError('');
        const id = generateUUID();
        await signup(id, value.name, value.email, value.password, value.type);
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

          {/* Account Type */}
          <div>
            <label className='block text-sm font-medium mb-2'>Account Type</label>
            <form.Field name="type">
              {(field) => (
                <div className='flex gap-2'>
                  <label className='flex gap-2 items-center cursor-pointer'>
                    <input
                      type="radio"
                      name={field.name}
                      value="human"
                      checked={field.state.value === 'human'}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-4 w-4 appearance-none border border-primary rounded-full checked:bg-primary hover:checked:bg-primary checked:border-primary hover:border-primary outline-none"
                    />
                    <span>Human</span>
                  </label>
                  <label className='flex gap-2 items-center cursor-pointer'>
                    <input
                      type="radio"
                      name={field.name}
                      value="organization"
                      checked={field.state.value === 'organization'}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-4 w-4 appearance-none border border-primary rounded-full checked:bg-primary hover:checked:bg-primary checked:border-primary hover:border-primary outline-none"
                    />
                    <span>Organization</span>
                  </label>
                </div>
              )}
            </form.Field>
          </div>

          {/* Username */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Name is required';
                if (value.length < 3) return 'Name must be at least 3 characters';
                if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                  return 'Name can only contain letters, numbers, underscores, and hyphens';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className='space-y-1'>
                <label htmlFor={field.name} className='block text-sm'>
                  Username
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="username"
                />
                {field.state.meta.errors.length > 0 && (
                  <div className='flex items-center gap-1 text-sm text-primary/70'>
                    <AlertCircleIcon size={14} className='shrink-0' />
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
                  <>
                    <LoaderIcon className='shrink-0 animate-spin mr-2' strokeWidth={1.5} size={18}/>
                    Creating account...
                  </>
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
import Loader from '@/components/Loader'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from './-auth'
import { useForm } from '@tanstack/react-form'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { ChevronRight, ChevronLeft, Loader as LoaderIcon, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'

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
  const [step, setStep] = useState(1);

  const form = useForm({
    defaultValues: {
      type: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    onSubmit: async ({ value }) => {
      try {
        await signup(value.name, value.email, value.password, value.type);
        navigate({ to: '/' });
      } catch (err) {
        console.error('Signup failed:', err);
      }
    },
  });

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleNextStep2 = async () => {
    const nameValue = form.getFieldValue('name');
    
    try {
      // Check username availability before proceeding
      const response = await fetch(`/api/users/check-username/${nameValue}`);
      const data = await response.json();
      
      if (!data.available) {
        form.setFieldMeta('name', (prev) => ({
          ...prev,
          errors: [data.reason || 'Username already taken']
        }));
        return;
      }
      
      // Username is available, proceed to next step
      setStep(prev => prev + 1);
    } catch (err) {
      console.error('Failed to check username:', err);
      form.setFieldMeta('name', (prev) => ({
        ...prev,
        errors: ['Failed to verify username availability']
      }));
    }
  };

  return (
    <Layout>
      {/* Step 1: Account Type */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <Card className='h-64'>
            <CardHeader>
              <p>Who are you?</p>
            </CardHeader>
            <CardContent className='flex flex-col gap-1'>
              <form.Field name="type">
                {(field) => (
                  <>
                    <label className='flex gap-2 items-center cursor-pointer'>
                      <input
                        type="radio"
                        name={field.name}
                        value="human"
                        checked={field.state.value === 'human'}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-4 w-4 appearance-none border border-orange-400 rounded-full checked:bg-primary hover:checked:bg-primary checked:border-primary hover:border-primary outline-none"
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
                        className="h-4 w-4 appearance-none border border-orange-400 rounded-full checked:bg-primary hover:checked:bg-primary checked:border-primary hover:border-primary outline-none"
                      />
                      <span>Organization</span>
                    </label>
                  </>
                )}
              </form.Field>
            </CardContent>
            <CardFooter>
              <form.Subscribe
                selector={(state) => state.values.type}
              >
                {(typeValue) => (
                  <Button 
                    type="submit"
                    disabled={!typeValue}
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

      {/* Step 2: Name and Email */}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <Card className='h-64'>
            <CardHeader>
              <p>Enter unique name, and email we&apos;ll use to contact you</p>
            </CardHeader>
            <CardContent className='flex flex-col relative'>
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
                  <div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoFocus
                      placeholder="name"
                      className='border-b-0'
                    />
                  </div>
                )}
              </form.Field>

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
                  <div>
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
                  </div>
                )}
              </form.Field>

              <form.Field name="name" mode="array">
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

              <form.Field name="email" mode="array">
                {(field) => (
                  <>
                    {field.state.meta.errors.length > 0 && (
                      <div className='absolute flex top-24 text-sm items-center gap-2 opacity-70 mt-1'>
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
              <form.Subscribe
                selector={(state) => ({
                  nameError: state.fieldMeta.name?.errors?.length ?? 0,
                  emailError: state.fieldMeta.email?.errors?.length ?? 0,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ nameError, emailError, isSubmitting }) => (
                  <Button
                    type="button"
                    onClick={handleNextStep2}
                    disabled={nameError > 0 || emailError > 0 || isSubmitting}
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

      {/* Step 3: Passwords */}
      {step === 3 && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Card className='h-64'>
            <CardHeader>
              <p>Enter strong password and confirm. You&apos;ll use it everytime you login</p>
            </CardHeader>
            <CardContent className='flex flex-col relative'>
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Password is required';
                    if (value.length < 8) return 'Password must be at least 8 characters';
                    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
                    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
                    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoFocus
                      placeholder="••••••••"
                      className='border-b-0'
                    />
                  </div>
                )}
              </form.Field>

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
                  <div>
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
                  </div>
                )}
              </form.Field>

              <form.Field name="password" mode="array">
                {(field) => (
                  <>
                    {field.state.meta.errors.length > 0 && (
                      <div className='absolute flex top-18 text-sm items-center gap-2 opacity-70 mt-2'>
                        <AlertTriangle size={15}/>
                        <p>{field.state.meta.errors[0]}</p>
                      </div>
                    )}
                  </>
                )}
              </form.Field>

              <form.Field name="confirmPassword" mode="array">
                {(field) => (
                  <>
                    {field.state.meta.errors.length > 0 && (
                      <div className='absolute flex top-24 text-sm items-center gap-2 opacity-70 mt-2'>
                        <AlertTriangle size={15}/>
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
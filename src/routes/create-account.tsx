import Loader from '@/components/Loader'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from './-auth'
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
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateName = (value: string) => {
    if (!value) return 'Name is required';
    if (value.length < 3) return 'Name must be at least 3 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Name can only contain letters, numbers, underscores, and hyphens';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== formData.password) return 'Passwords do not match';
    return '';
  };

  const canProceedStep1 = () => {
    return formData.type !== '';
  };

  const canProceedStep2 = () => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    return !nameError && !emailError;
  };

  const canProceedStep3 = () => {
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    return !passwordError && !confirmPasswordError;
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleNextStep2 = async () => {
    setIsSubmitting(true);
    try {
      // Check username availability before proceeding
      const response = await fetch(`/api/users/check-username/${formData.name}`);
      const data = await response.json();
      
      if (!data.available) {
        setErrors(prev => ({ 
          ...prev, 
          name: data.reason || 'Username already taken' 
        }));
        setIsSubmitting(false);
        return;
      }
      
      // Username is available, proceed to next step
      setStep(prev => prev + 1);
    } catch (err) {
      console.error('Failed to check username:', err);
      setErrors(prev => ({ 
        ...prev, 
        name: 'Failed to verify username availability' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await signup(formData.name, formData.email, formData.password, formData.type);
      navigate({ to: '/' });
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setIsSubmitting(false);
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
              <label className='flex gap-2 items-center cursor-pointer'>
                <input
                  type="radio"
                  name="type"
                  value="human"
                  checked={formData.type === 'human'}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, type: e.target.value }));
                  }}
                  className="h-4 w-4 appearance-none border border-orange-400 rounded-full checked:bg-primary hover:checked:bg-primary checked:border-primary hover:border-primary outline-none"
                />
                <span>Human</span>
              </label>
              <label className='flex gap-2 items-center cursor-pointer'>
                <input
                  type="radio"
                  name="type"
                  value="organization"
                  checked={formData.type === 'organization'}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, type: e.target.value }));
                  }}
                  className="h-4 w-4 appearance-none border border-orange-400 rounded-full checked:bg-primary hover:checked:bg-primary checked:border-primary hover:border-primary outline-none"
                />
                <span>Organization</span>
              </label>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                disabled={!canProceedStep1()}
                className='w-full'
              >
                <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 2: Name and Email */}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep2(); }}>
          <Card className='h-64'>
            <CardHeader>
              <p>Enter unique name, and email we&apos;ll use to contact you</p>
            </CardHeader>
            <CardContent className='flex flex-col'>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, name: value }));
                  const error = validateName(value);
                  setErrors(prev => ({ ...prev, name: error }));
                }}
                autoFocus
                placeholder="name"
                className='border-b-0'
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, email: value }));
                  const error = validateEmail(value);
                  setErrors(prev => ({ ...prev, email: error }));
                }}
                placeholder="email@example.com"
              />
              {errors.name && (
                <div className='flex text-sm items-center gap-2 opacity-70 mt-2'>
                  <AlertTriangle className='shrink-0' size={15}/>
                  <p>{errors.name}</p>
                </div>
              )}
              {errors.email && (
                <div className='flex text-sm items-center gap-2 opacity-70 mt-1'>
                  <AlertTriangle className='shrink-0' size={15}/>
                  <p>{errors.email}</p>
                </div>
              )}
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
                disabled={!canProceedStep2() || isSubmitting}
                className='w-full'
              >
                {isSubmitting 
                  ? <LoaderIcon className='shrink-0 animate-spin' strokeWidth={1.5} size={18}/>
                  : <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                }
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Step 3: Passwords */}
      {step === 3 && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Card className='h-64'>
            <CardHeader>
              <p>Enter strong password and confirm. You&apos;ll use it everytime you login</p>
            </CardHeader>
            <CardContent className='flex flex-col'>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, password: value }));
                  const error = validatePassword(value);
                  setErrors(prev => ({ ...prev, password: error }));
                  if (formData.confirmPassword) {
                    const confirmError = value !== formData.confirmPassword ? 'Passwords do not match' : '';
                    setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
                  }
                }}
                autoFocus
                placeholder="••••••••"
                className='border-b-0'
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, confirmPassword: value }));
                  const error = validateConfirmPassword(value);
                  setErrors(prev => ({ ...prev, confirmPassword: error }));
                }}
                placeholder="••••••••"
              />
              {errors.password && (
                <div className='flex text-sm items-center gap-2 opacity-70 mt-2'>
                  <AlertTriangle size={15}/>
                  <p>{errors.password}</p>
                </div>            
              )}
              {errors.confirmPassword && (
                <div className='flex text-sm items-center gap-2 opacity-70 mt-2'>
                  <AlertTriangle size={15}/>
                  <p>{errors.confirmPassword}</p>
                </div>            
              )}
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
                disabled={!canProceedStep3() || isSubmitting}
                className='w-full'
              >
                {isSubmitting 
                  ? <LoaderIcon className='shrink-0 animate-spin' strokeWidth={1.5} size={18}/>
                  : <ChevronRight className='shrink-0' strokeWidth={1.5} size={18}/>
                }
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </Layout>
  )
}
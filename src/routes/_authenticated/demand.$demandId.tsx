import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { supplyByDemandIdQueryOptions } from '@/hooks/useSupply'
import { useCreateSupply } from '@/hooks/useSupply'
import Layout from '@/components/Layout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import Loader from '@/components/Loader'
import { useState } from 'react'
import { demandByIdQueryOptions } from '@/hooks/useDemand'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { PaymentForm } from '@/components/PaymentForm'
import Dialog from '@/components/Dialog'
import { Mail, Phone } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const Route = createFileRoute('/_authenticated/demand/$demandId')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient, auth }, params: { demandId } }) => {
    return Promise.all([
      queryClient.ensureQueryData(demandByIdQueryOptions(demandId, auth.user?.id)),
      queryClient.ensureQueryData(supplyByDemandIdQueryOptions(demandId))
    ]);
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const { demandId } = Route.useParams()
  const { data: demandData } = useSuspenseQuery(demandByIdQueryOptions(demandId, auth.user?.id))
  const { data: supply } = useSuspenseQuery(supplyByDemandIdQueryOptions(demandId))
  
  const demand = demandData.demand;
  const hasApplied = demandData.hasApplied;
  
  // Calculate if expired on frontend
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = currentTime > demand.endingAt;
  
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [_paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [view, setView] = useState<'details' | 'supply'>('details')
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  
  const { mutate: createSupply, isPending, error } = useCreateSupply()

  // Calculate days left
  const secondsLeft = demand.endingAt - currentTime;
  const daysLeft = Math.ceil(secondsLeft / 86400);

  const handleInitiatePayment = async () => {
    if (!content.trim() || !email.trim() || content.trim().length < 30 || !auth.user?.id) return

    setIsCreatingIntent(true)
    setPaymentError(null)

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demandId: demandId,
          userId: auth.user.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setShowPayment(true)
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to initiate payment')
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentIntentId(paymentId)
    
    // Submit supply with payment
    createSupply(
      {
        demandId: demandId,
        content: content.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        userId: auth.user!.id,
        paymentIntentId: paymentId
      },
      {
        onSuccess: () => {
          setContent('')
          setEmail('')
          setPhone('')
          setShowPayment(false)
          setClientSecret(null)
          setPaymentIntentId(null)
          setView('details')
          setShowApplyDialog(false)
        },
      }
    )
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  const schema = JSON.parse(demand.schema)

  console.log('applied', hasApplied)

  return (
    <Layout>
      <Card className='h-full'>
        <CardHeader className='justify-between flex items-center w-full'>
          <span>
            #{demand.id.slice(0, 8)}
          </span> 
          <div className='flex items-center gap-2'>
            <span>
              {new Date(demand.createdAt * 1000).toLocaleDateString()},
            </span>
            {isExpired ? (
              <span className='text-primary/70'>Expired</span>
            ) : (
              <span className=''>
                {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Expires today'}
              </span>
            )}
            
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {view === 'details' ? (
            <div>
              <p className='p-2'>{demand.content}</p>
              <table className='w-full border-y border-primary text-sm'>
                <tbody>
                  {Object.entries(schema).map(([key, value]) => (
                    <tr key={key} className='border-b border-primary'>
                      <td className='font-medium p-2 border-r border-primary'>{key}:</td>
                      <td className='p-2'>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Show contact info only if user has applied */}
              {hasApplied && (
                <div className='p-2 border-primary border-b space-y-1'>
                  <p className='text-sm'>Contact Information (visible because you applied)</p>
                  <div className='flex gap-2 items-center text-sm'>
                    <Mail size={14} />
                    <a href={`mailto:${demand.email}`} className='hover:underline'>
                      {demand.email}
                    </a>
                  </div>
                  <div className='flex gap-2 items-center text-sm'>
                    <Phone size={14} />
                    <a href={`tel:${demand.phone}`} className='hover:underline'>
                      {demand.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-2 p-2'>
              {supply && supply.length > 0 ? (
                supply.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border border-primary p-2 space-y-2 ${
                      item.userId === auth.user?.id ? 'border' : ''
                    }`}
                  >
                    <div className='w-full flex justify-between text-sm'>
                      <p>#{item.id.slice(0, 8)}</p>
                      <p>{new Date(item.createdAt * 1000).toLocaleDateString()}</p>
                    </div>
                    <p>{item.content}</p>
                    <div className={`text-sm flex gap-2 flex-wrap ${
                      item.userId === auth.user?.id ? 'opacity-90' : 'text-muted-foreground'
                    }`}>
                      <div className='flex gap-1 items-center'>
                        <Mail size={14} />
                        {item.email}
                      </div>
                      {item.phone && (
                        <div className='flex gap-1 items-center'>
                          <Phone size={14} />
                          {item.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-primary/70'>
                  No supply offers yet
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className='gap-2 flex flex-col'>
          <div className='w-full flex gap-2 items-center'>
            <Button 
              className='w-full'
              onClick={() => setView('details')}
              disabled={view === 'details'}
            >
              Details
            </Button>
            <Button 
              className='w-full'
              onClick={() => setView('supply')}
              disabled={view === 'supply'}
            >
              Supply ({supply?.length || 0})
            </Button>
          </div>
          <Button 
            className='w-full'
            onClick={() => setShowApplyDialog(true)}
            disabled={hasApplied || isExpired}
          >
            {hasApplied ? 'Already Applied' : isExpired ? 'Expired' : 'Apply'}
          </Button>
        </CardFooter>
      </Card>

      {/* Apply to Demand Dialog */}
      <Dialog 
        isOpen={showApplyDialog} 
        onClose={() => {
          setShowApplyDialog(false)
          setShowPayment(false)
          setClientSecret(null)
          setPaymentError(null)
        }}
      >
        {!showPayment ? (
          <Card className='bg-background md:w-md w-full'>
            <CardHeader>
              Apply for: $50.00
            </CardHeader>
            <CardContent className=''>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="We have a beautiful 3-bedroom home in Warsaw..."
                className='resize-none'
                rows={4}
                disabled={isPending || isCreatingIntent}
              />
              <p className='text-xs text-muted-foreground'>
                {content.trim().length}/30 characters minimum
              </p>
              <div className='flex gap-2 mt-2'>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isPending || isCreatingIntent}
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 123 456 789 (optional)"
                  disabled={isPending || isCreatingIntent}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleInitiatePayment}
                disabled={
                  isPending || 
                  isCreatingIntent || 
                  !content.trim() || 
                  !email.trim() || 
                  content.trim().length < 30 ||
                  !auth.user?.id
                }
                className='w-full'
              >
                {isCreatingIntent ? 'Preparing...' : 'Continue to Payment'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            {clientSecret && (
              <Card className='bg-background md:w-md'>
                <CardContent>
                  <Elements
                    stripe={stripePromise}
                    options={{clientSecret}}
                  >
                    <PaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={isPending}
                    />
                  </Elements>
                  {paymentError && (
                    <p className="text-primary/70 text-sm">
                      {paymentError}
                    </p>
                  )}

                  {error && (
                    <p className="text-primary/70 text-sm">
                      {error instanceof Error ? error.message : 'Failed to submit supply'}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => {
                      setShowPayment(false)
                      setClientSecret(null)
                      setPaymentError(null)
                    }}
                    disabled={isPending}
                    className='w-full'
                  >
                    Back
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </Dialog>
    </Layout>
  )
}
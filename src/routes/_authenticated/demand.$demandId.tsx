import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { supplyByDemandIdQueryOptions, useCreateSupply } from '@/hooks/useSupply'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import Loader from '@/components/Loader'
import { demandByIdQueryOptions } from '@/hooks/useDemand'
import { PaymentForm } from '@/components/PaymentForm'
import Page from '@/components/Page'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const Route = createFileRoute('/_authenticated/demand/$demandId')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient, auth }, params: { demandId } }) => {
    return Promise.all([
      queryClient.ensureQueryData(demandByIdQueryOptions(demandId, auth.user?.id)),
      queryClient.ensureQueryData(supplyByDemandIdQueryOptions(demandId)),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const { auth } = Route.useRouteContext()
  const { demandId } = Route.useParams()
  const { data: demandData } = useSuspenseQuery(demandByIdQueryOptions(demandId, auth.user?.id))
  const { data: supply } = useSuspenseQuery(supplyByDemandIdQueryOptions(demandId))

  const demand = demandData.demand
  const hasApplied = demandData.hasApplied

  const currentTime = Math.floor(Date.now() / 1000)
  const isExpired = currentTime > demand.endingAt
  const secondsLeft = demand.endingAt - currentTime
  const daysLeft = Math.ceil(secondsLeft / 86400)

  const [view, setView] = useState<'details' | 'supply' | 'apply' | 'payment'>('details')
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const trimmedContent = content.trim()
  const trimmedEmail = email.trim()
  const isValidContent = trimmedContent.length >= 30 && trimmedContent.length <= 300

  const { mutate: createSupply, isPending, error } = useCreateSupply()

  const handleInitiatePayment = async () => {
    if (!trimmedContent || !trimmedEmail || !isValidContent || !auth.user?.id) return

    setIsCreatingIntent(true)
    setPaymentError(null)

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandId, userId: auth.user.id }),
      })

      if (!response.ok) throw new Error('Failed to initiate payment')

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setView('payment')
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to initiate payment')
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = (paymentId: string) => {
    createSupply(
      {
        demandId,
        content: trimmedContent,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        userId: auth.user!.id,
        paymentIntentId: paymentId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['demand', 'by-id', demandId, auth.user?.id] })
          queryClient.invalidateQueries({ queryKey: ['supply', 'by-demand', demandId] })
          setContent('')
          setEmail('')
          setPhone('')
          setClientSecret(null)
          setView('details')
        },
      },
    )
  }

  return (
    <Page header={`Demand #${demand.id}`}>
      {view === 'details' && (
        <div className="flex flex-col gap-2">
          <div className="flex">
            <span>
              [{new Date(demand.createdAt * 1000).toLocaleDateString('en-GB')}]
            </span>
            <span>
              {isExpired ? '[expired]' : `[${daysLeft} day${daysLeft !== 1 ? 's' : ''} left]`}
            </span>
          </div>
          <p className="opacity-70 wrap-break-word">
            {demand.content}
          </p>
          {hasApplied && (
            <>
              {demand.email && (
                <div className="flex flex-wrap items-center gap-2">
                  <span>[Email]</span>
                  <p className="opacity-70 wrap-break-word min-w-0">{demand.email}</p>
                </div>
              )}
              {demand.phone && (
                <div className="flex flex-wrap items-center gap-2">
                  <span>[Phone]</span>
                  <p className="opacity-70 wrap-break-word min-w-0">{demand.phone}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === 'supply' && (
        <div className="space-y-4">
          {supply && supply.length > 0 ? (
            supply.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center">
                  <span>[{index + 1}]</span>
                  <span className="opacity-70">
                    [{new Date(item.createdAt * 1000).toLocaleDateString('en-GB')}]
                  </span>
                  <div className="flex gap-2 opacity-70">
                    <span>[{item.email}]</span>
                    {item.phone && <span>[{item.phone}]</span>}
                  </div>
                  {item.userId === auth.user?.id && <span className='opacity-70'>[you]</span>}
                </div>
                <p className="wrap-break-word min-w-0">
                  {item.content}
                </p>
              </div>
            ))
          ) : (
            <p className="opacity-70">No Supply Offers Yet...</p>
          )}
        </div>
      )}

      {view === 'apply' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span>[Apply]</span>
            <span>$149.00</span>
          </div>

          {/* Note */}
          <div className="flex flex-col">
            <div className="grid grid-cols-6 gap-2 items-start">
              <div className="col-span-2 flex flex-col">
                <label className="truncate">[Note]</label>
                <span className="opacity-70">{trimmedContent.length}/300</span>
                <span className="opacity-70">min 30</span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="how you'd fulfill this demand, or leave a note..."
                rows={6}
                maxLength={300}
                className="col-span-4"
                disabled={isPending || isCreatingIntent}
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-6 gap-2 items-center">
            <label className="col-span-2 truncate">[Email]</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="col-span-4"
              disabled={isPending || isCreatingIntent}
            />
          </div>

          {/* Phone */}
          <div className="grid grid-cols-6 gap-2 items-center">
            <label className="col-span-2 truncate">[Phone]</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+48 123 456 789 (optional)"
              className="col-span-4"
              disabled={isPending || isCreatingIntent}
            />
          </div>

          {paymentError && <p className="text-sm opacity-70">! {paymentError}</p>}

          <Button
            className="px-2"
            onClick={handleInitiatePayment}
            disabled={isPending || isCreatingIntent || !trimmedContent || !trimmedEmail || !isValidContent}
          >
            {isCreatingIntent ? '[Preparing...]' : 'Continue to Payment'}
          </Button>
        </div>
      )}

      {view === 'payment' && clientSecret && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span>[payment]</span>
            <span className="opacity-70">$149.00</span>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={(err) => setPaymentError(err)}
              disabled={isPending}
            />
          </Elements>
          {paymentError && <p className="text-sm opacity-70">! {paymentError}</p>}
          {error && (
            <p className="text-sm opacity-70">
              {error instanceof Error ? error.message : 'failed to submit supply'}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center flex-wrap">
        <Button
          className={`px-2 ${view === 'details' ? 'bg-primary text-background' : ''}`}
          onClick={() => setView('details')}
        >
          Details
        </Button>
        <Button
          className={`px-2 ${view === 'supply' ? 'bg-primary text-background' : ''}`}
          onClick={() => setView('supply')}
        >
          Suppliers ({supply?.length || 0})
        </Button>
        {!hasApplied && !isExpired && (
          <Button
            className={`px-2 ${(view === 'apply' || view === 'payment') ? 'bg-primary text-background' : ''}`}
            onClick={() => setView('apply')}
          >
            Apply
          </Button>
        )}
        {hasApplied && <span className="px-2 opacity-50">Applied</span>}
        {isExpired && <span className="px-2 opacity-50">Expired</span>}
      </div>
    </Page>
  )
}
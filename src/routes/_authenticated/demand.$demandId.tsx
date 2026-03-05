import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { supplyByDemandIdQueryOptions, useCreateSupply } from '@/hooks/useSupply'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import Loader from '@/components/Loader'
import { demandByIdQueryOptions } from '@/hooks/useDemand'
import Page from '@/components/Page'
import FormInput from '@/components/FormInput'

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

  const [view, setView] = useState<'details' | 'supply' | 'apply'>('details')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const { mutate: createSupply } = useCreateSupply()

  const form = useForm({
    defaultValues: {
      content: '',
      email: '',
      phone: '',
    },
    onSubmit: async ({ value }) => {
      if (!auth.user?.id) return

      setIsRedirecting(true)
      setPaymentError(null)

      try {
        sessionStorage.setItem(
          'pendingSupply',
          JSON.stringify({
            content: value.content.trim(),
            email: value.email.trim(),
            phone: value.phone.trim() || undefined,
          }),
        )

        const response = await fetch('/api/payment/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demandId, userId: auth.user.id }),
        })

        if (!response.ok) throw new Error('Failed to initiate payment')

        const { checkoutUrl } = await response.json()
        window.location.href = checkoutUrl
      } catch (err) {
        setPaymentError(err instanceof Error ? err.message : 'Failed to initiate payment')
        setIsRedirecting(false)
      }
    },
  })

  // Handle Stripe redirect back to this page with ?session_id=cs_xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) return

    // Clean URL immediately so refresh doesn't re-trigger this
    window.history.replaceState({}, '', `/demand/${demandId}`)

    const raw = sessionStorage.getItem('pendingSupply')
    if (!raw) {
      setPaymentError('Payment succeeded but supply data was lost. Please contact support.')
      return
    }

    const pending = JSON.parse(raw)
    setIsProcessing(true)

    const verify = async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!res.ok) throw new Error('Payment verification failed')

        const { paymentIntentId, demandId: verifiedDemandId, userId } = await res.json()

        createSupply(
          {
            demandId: verifiedDemandId,
            content: pending.content,
            email: pending.email,
            phone: pending.phone,
            userId,
            paymentIntentId,
          },
          {
            onSuccess: () => {
              sessionStorage.removeItem('pendingSupply')
              setIsProcessing(false)
              queryClient.invalidateQueries({ queryKey: ['demand', 'by-id', demandId, auth.user?.id] })
              queryClient.invalidateQueries({ queryKey: ['supply', 'by-demand', demandId] })
              setView('details')
            },
            onError: () => {
              setIsProcessing(false)
              setPaymentError(
                'Payment succeeded but failed to submit your application. Please contact support with session ID: ' + sessionId
              )
            },
          },
        )
      } catch (err) {
        setIsProcessing(false)
        setPaymentError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    verify()
  }, [])

  if (isProcessing) {
    return (
      <Page header={`Demand #${demand.id}`}>
        <p className="opacity-70">Submitting your application...</p>
      </Page>
    )
  }

  return (
    <Page header={`Demand #${demand.id}`}>

      {view === 'details' && (
        <div className="flex flex-col gap-2">
          <div className="flex">
            <span>[{new Date(demand.createdAt * 1000).toLocaleDateString('en-GB')}]</span>
            <span>
              {isExpired ? '[expired]' : `[${daysLeft} day${daysLeft !== 1 ? 's' : ''} left]`}
            </span>
          </div>
          <p className="opacity-70 wrap-break-word">{demand.content}</p>
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
                  {item.userId === auth.user?.id && <span className="opacity-70">[you]</span>}
                </div>
                <p className="wrap-break-word min-w-0">{item.content}</p>
              </div>
            ))
          ) : (
            <p className="opacity-70">No supply offers yet...</p>
          )}
        </div>
      )}

      {view === 'apply' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
            <span>[Apply]</span>
            <span>$149.00</span>
          </div>

          <form.Field
            name="content"
            validators={{
              onSubmit: ({ value }) => {
                const trimmed = value.trim()
                if (trimmed.length < 30) return 'Minimum 30 characters'
                if (trimmed.length > 300) return 'Maximum 300 characters'
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="grid grid-cols-6 gap-2 items-start">
                <div className="col-span-2 flex flex-col">
                  <label className="truncate">[Note]</label>
                  <span className="opacity-70">{field.state.value.trim().length}/300</span>
                  <span className="opacity-70">min 30</span>
                  {field.state.meta.errors.length > 0 && (
                    <span className="opacity-70 text-sm">! {field.state.meta.errors[0]}</span>
                  )}
                </div>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="how you'd fulfill this demand, or leave a note..."
                  rows={6}
                  maxLength={300}
                  className="col-span-4"
                  disabled={isRedirecting}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => {
                if (!value.trim()) return 'Email is required'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email'
                return undefined
              },
            }}
          >
            {(field) => (
              <FormInput
                field={field}
                label="Email"
                type="email"
                placeholder="your@email.com"
                disabled={isRedirecting}
              />
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <FormInput
                field={field}
                label="Phone"
                type="tel"
                placeholder="+48 123 456 789 (optional)"
                disabled={isRedirecting}
              />
            )}
          </form.Field>

          {paymentError && <p className="text-sm opacity-70">! {paymentError}</p>}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting || isRedirecting}
                className="px-2"
              >
                {isSubmitting || isRedirecting ? 'Redirecting to Payment...' : 'Continue to Payment'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      )}

      {paymentError && view !== 'apply' && (
        <p className="text-sm opacity-70">! {paymentError}</p>
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
            className={`px-2 ${view === 'apply' ? 'bg-primary text-background' : ''}`}
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
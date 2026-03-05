import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { demandsUserAppliedToQueryOptions } from '@/hooks/useSupply'
import Loader from '@/components/Loader'
import Page from '@/components/Page'

export const Route = createFileRoute('/_authenticated/applied')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient, auth } }) => {
    if (!auth.user?.id) throw new Error('User not authenticated')
    return queryClient.ensureQueryData(
      demandsUserAppliedToQueryOptions(auth.user.id),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()

  const { data: appliedDemands } = useSuspenseQuery(
    demandsUserAppliedToQueryOptions(auth.user!.id),
  )

  return (
    <Page header={`Your applications (${appliedDemands.length}). Open any to view contact details and move forward.`}>
      <div className="space-y-4">
        {appliedDemands.length === 0 ? (
          <p className="opacity-70">No applications yet...</p>
        ) : (
          appliedDemands.map((item, index) => {
            const isExpired = Date.now() / 1000 > item.endingAt

            return (
              <div
                key={item.supplyId}
                className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/demand/$demandId',
                      params: { demandId: item.id.toString() },
                    })
                  }
              >
                <div className="flex items-center">
                  <span>[{index + 1}]</span>
                  <span className="opacity-70">
                    [{new Date(item.appliedAt * 1000).toLocaleDateString()}]
                  </span>
                  {isExpired && <span className="opacity-70">[expired]</span>}
                </div>
                
                <div className='grid grid-cols-2 gap-8'>
                  <p className="opacity-70 wrap-break-word min-w-0">
                    {item.content.length > 128
                      ? `${item.content.slice(0, 128)}…`
                      : item.content
                    }
                  </p>
                  <p className="wrap-break-word min-w-0">
                    {item.supplyContent.length > 128
                      ? `${item.supplyContent.slice(0, 128)}…`
                      : item.supplyContent
                    }
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Page>
  )
}
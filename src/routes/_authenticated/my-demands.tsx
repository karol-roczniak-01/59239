import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { demandByUserIdQueryOptions } from '@/hooks/useDemand'
import Loader from '@/components/Loader'
import Page from '@/components/Page'
import { useLanguage } from '@/providers/language-provider'

export const Route = createFileRoute('/_authenticated/my-demands')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient, auth } }) => {
    if (!auth.user?.id) throw new Error('User not authenticated')
    return queryClient.ensureQueryData(demandByUserIdQueryOptions(auth.user.id))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLanguage()
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()

  const { data: demands } = useSuspenseQuery(
    demandByUserIdQueryOptions(auth.user!.id),
  )

  return (
    <Page header={`${t('myDemandsWelcome')} (${demands.length}). ${t('myDemandsWelcomeSub')}`}>
      <div className="space-y-4">
        {demands.length === 0 ? (
          <p className="opacity-70">{t('noDemandsYet')}</p>
        ) : (
          demands.map((demand, index) => (
            <div
              key={demand.id}
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  to: '/demand/$demandId',
                  params: { demandId: demand.id.toString() },
                })
              }
            >
              <div className="flex items-center">
                <span>[{index + 1}]</span>
                <span className="opacity-70">
                  [{new Date(demand.createdAt * 1000).toLocaleDateString('en-GB')}]
                </span>
              </div>
              <p className="wrap-break-word min-w-0">
                {demand.content.length > 256
                  ? `${demand.content.slice(0, 256)}…`
                  : demand.content}
              </p>            
            </div>
          ))
        )}
      </div>
    </Page>
  )
}
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { demandsUserAppliedToQueryOptions } from '@/hooks/useSupply'
import Loader from '@/components/Loader'
import { Button } from '@/components/Button'

export const Route = createFileRoute('/_authenticated/supply/')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient, auth } }) => {
    if (!auth.user?.id) throw new Error('User not authenticated');
    return queryClient.ensureQueryData(demandsUserAppliedToQueryOptions(auth.user.id));
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const navigate = useNavigate();
  
  const { data: appliedDemands } = useSuspenseQuery(
    demandsUserAppliedToQueryOptions(auth.user!.id)
  );

  return (
    <Layout>
      <Card className='h-full'>
        <CardHeader>
          My Applications ({appliedDemands.length})
        </CardHeader>
        <CardContent>
          {appliedDemands.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>
              You haven't applied to any demands yet
            </p>
          ) : (
            <div className='space-y-2'>
              {appliedDemands.map((item) => {
                const isExpired = Date.now() / 1000 > item.endingAt;
                
                return (
                  <div
                    key={item.supplyId}
                    className='p-2 border border-primary cursor-pointer space-y-2'
                    onClick={() => navigate({ 
                      to: '/demand/$demandId', 
                      params: { demandId: item.id.toString() } 
                    })}
                  >
                    <div className='flex justify-between items-start text-sm'>
                      <p>#{item.id.slice(0, 8)}</p>
                      <div className='text-right'>
                        <p>Applied: {new Date(item.appliedAt * 1000).toLocaleDateString()}</p>
                        {isExpired && (
                          <p className='text-primary/70 text-xs'>Expired</p>
                        )}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <p className='opacity-70'>- {item.content}</p>
                      <p>- {item.supplyContent}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => navigate({ to: "/supply/new" })}
            className='w-full'
          >
            New
          </Button>
        </CardFooter>
      </Card>
    </Layout>
  )
}
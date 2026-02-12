import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { demandByUserIdQueryOptions } from '@/hooks/useDemand'
import Loader from '@/components/Loader'
import { Button } from '@/components/Button'

export const Route = createFileRoute('/_authenticated/demand/')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient, auth } }) => {
    if (!auth.user?.id) throw new Error('User not authenticated');
    return queryClient.ensureQueryData(demandByUserIdQueryOptions(auth.user.id));
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const navigate = useNavigate();
  
  const { data: demands } = useSuspenseQuery(
    demandByUserIdQueryOptions(auth.user!.id)
  );

  return (
    <Layout>
      <Card className='h-full md:w-lg'>
        <CardHeader>
          My Demand ({demands.length})
        </CardHeader>
        <CardContent>
          {demands.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>
              You haven't posted any demands yet
            </p>
          ) : (
            <div className='space-y-2'>
              {demands.map((demand) => {
                return (
                  <div
                    key={demand.id}
                    className='p-2 border border-primary cursor-pointer space-y-2'
                    onClick={() => navigate({ 
                      to: '/demand/$demandId', 
                      params: { demandId: demand.id.toString() } 
                    })}
                  >
                    <div className='flex justify-between items-start text-sm'>
                      <p>#{demand.id.slice(0, 8)}</p>
                      <p>
                        {new Date(demand.createdAt * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <p>{demand.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => navigate({ to: "/demand/new" })}
            className='w-full'
          >
            New
          </Button>
        </CardFooter>
      </Card>
    </Layout>
  )
}
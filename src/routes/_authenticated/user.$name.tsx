import { Card, CardContent } from '@/components/Card'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import { createFileRoute } from '@tanstack/react-router'
import { userByNameQueryOptions } from '@/hooks/useUsers'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authenticated/user/$name')({
  pendingComponent: () => <Loader />,
  loader: ({ context: { queryClient }, params: { name } }) => 
    queryClient.ensureQueryData(userByNameQueryOptions(name)),
  component: RouteComponent,
})

function RouteComponent() {
  const { name } = Route.useParams()
  const { data: user } = useSuspenseQuery(userByNameQueryOptions(name))

  return (
    <Layout>
      <Card>
        <CardContent>
          <h1>{user.name}</h1>
          <p>Email: {user.email}</p>
          <p>Type: {user.type}</p>
          <p>Verified: {user.verified ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>
    </Layout>
  )
}
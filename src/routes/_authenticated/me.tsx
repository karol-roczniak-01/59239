import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/Card'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
// import { useTheme } from '@/hooks/useTheme'

export const Route = createFileRoute('/_authenticated/me')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  // const { isDark, toggleTheme } = useTheme()

  return (
    <Layout>
      <Card className="md:w-xs">
        <CardContent>
          You are logged in as <u>{auth.user?.username}</u> (
          {auth.user?.fullName}), and we will contact you at{' '}
          <u>{auth.user?.email}</u>. If you need to reach us, please write to:{' '}
          <u>help@19188103.com</u>.
        </CardContent>
      </Card>
    </Layout>
  )
}

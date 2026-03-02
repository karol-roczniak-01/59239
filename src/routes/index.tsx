import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Menu from '@/components/Menu'
import Loader from '@/components/Loader'
import Page from '@/components/Page'

export const Route = createFileRoute('/')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.logout()
    navigate({ to: '/' })
  }

  const handleJoin = () => {
    window.location.href = 'https://5395.19188103.com/join'
  }

  const authorizedOptions = [
    { label: 'New Demand', onSelect: () => navigate({ to: '/new-demand' }) },
    { label: 'My Demands', onSelect: () => navigate({ to: '/my-demands' }) },
    { label: 'Find Opportunity', onSelect: () => navigate({ to: '/find-opportunity' }) },
    { label: 'Applied', onSelect: () => navigate({ to: '/applied' }) },
    { label: 'Log Out', onSelect: handleLogout },
  ]

  const unauthorizedOptions = [
    { label: 'Log In', onSelect: () => navigate({ to: '/login' })},
    { label: 'Join', onSelect: handleJoin },
  ]

  if (auth.isLoading) {
    return <Loader />
  }

  if (auth.user) {
    return (
      <Page header='Welcome to 5-92-39! — AI-powered tender platform connecting suppliers with buyers.'>
        <Menu options={authorizedOptions}/>
      </Page>
    )
  }

  return (
    <Page header='Welcome to 5-92-39! — AI-powered tender platform connecting suppliers with buyers.'>
      <Menu options={unauthorizedOptions}/>
    </Page>
  )
}

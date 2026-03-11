import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Menu from '@/components/Menu'
import Loader from '@/components/Loader'
import Page from '@/components/Page'
import { useLanguage } from '@/providers/language-provider'

export const Route = createFileRoute('/')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLanguage()
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.logout()
    navigate({ to: '/' })
  }

  const handleJoin = () => {
    window.location.href = 'https://5395.19188103.com/create-account'
  }

  const authorizedOptions = [
    { label: t('newDemand'), onSelect: () => navigate({ to: '/new-demand' }) },
    { label: t('myDemands'), onSelect: () => navigate({ to: '/my-demands' }) },
    { label: t('findMatch'), onSelect: () => navigate({ to: '/find-match' }) },
    { label: t('applied'), onSelect: () => navigate({ to: '/applied' }) },
    { label: t('logOut'), onSelect: handleLogout },
  ]

  const unauthorizedOptions = [
    { label: t('logIn'), onSelect: () => navigate({ to: '/login' })},
    { label: t('createAccount'), onSelect: handleJoin },
  ]

  if (auth.isLoading) {
    return <Loader />
  }

  if (auth.user) {
    return (
      <Page header={t('indexWelcome')}>
        <Menu options={authorizedOptions}/>
      </Page>
    )
  }

  return (
    <Page header={t('indexWelcome')}>
      <Menu options={unauthorizedOptions}/>
    </Page>
  )
}

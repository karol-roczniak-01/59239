import Loader from '@/components/Loader'
import Menu from '@/components/Menu'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { User, Settings, LogOut, Users, Book, Pen, ShoppingCart, UserPlus } from 'lucide-react'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/Card'

export const Route = createFileRoute('/')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const navigate = useNavigate();
  const [_lastSelected, setLastSelected] = useState<string>('');

  const handleLogout = () => {
    auth.logout();
    navigate({ to: '/' })
  };

  const authorizedOptions = [
    { label: 'Me', path: '/me', icon: Settings },
    { label: 'Demand', path: '/demand', icon: ShoppingCart },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Logout', icon: LogOut, onSelect: handleLogout }
  ];

  const unauthorizedOptions = [
    { label: 'Create Account', path: '/create-account', icon: UserPlus },
    { label: 'Log In', path: '/login', icon: User },
  ];

  if (auth.isLoading) {
    return <Loader />
  }

  if (auth.user) {
    return (
      <Layout>
        <Card>
          <CardContent>
            <Menu 
              options={authorizedOptions}
              onSelect={(option, index) => {
                setLastSelected(`${option.label} (${index})`);
                if (option.path) {
                  navigate({ to: option.path })
                }
              }}
            />
          </CardContent>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <Card className='md:w-xs'>
        <CardContent>
          <Menu 
            options={unauthorizedOptions}
            onSelect={(option, index) => {
              setLastSelected(`${option.label} (${index})`);
              if (option.path) {
                navigate({ to: option.path })
              }
            }}
          />
        </CardContent>
      </Card>
    </Layout>
  )
}
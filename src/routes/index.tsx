import Loader from '@/components/Loader'
import Menu from '@/components/Menu'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { User, LogOut, UserPlus, Factory, BadgeDollarSign, FileText } from 'lucide-react'
import Layout from '@/components/Layout'

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
    { label: 'Demand', path: '/demand', icon: BadgeDollarSign },
    { label: 'Supply', path: '/supply', icon: Factory },
    { label: 'Me', path: '/me', icon: User },
    { label: 'Docs', path: '/docs', icon: FileText },
    { label: 'Logout', icon: LogOut, onSelect: handleLogout }
  ];

  const unauthorizedOptions = [
    { label: 'Create Account', path: '/create-account', icon: UserPlus },
    { label: 'Log In', path: '/login', icon: User },
    { label: 'Docs', path: '/docs', icon: FileText },
  ];

  if (auth.isLoading) {
    return <Loader />
  }

  if (auth.user) {
    return (
      <Layout>
        <Menu 
          options={authorizedOptions}
          onSelect={(option, index) => {
          setLastSelected(`${option.label} (${index})`);
            if (option.path) {
              navigate({ to: option.path })
            }
          }}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Menu 
        options={unauthorizedOptions}
        onSelect={(option, index) => {
        setLastSelected(`${option.label} (${index})`);
          if (option.path) {
            navigate({ to: option.path })
          }
        }}
      />
    </Layout>
  )
}
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  BadgeDollarSign,
  Factory,
  FileText,
  LogOut,
  User,
  UserPlus,
} from 'lucide-react'
import Menu from '@/components/Menu'
import Loader from '@/components/Loader'
import Layout from '@/components/Layout'

export const Route = createFileRoute('/')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()
  const [_lastSelected, setLastSelected] = useState<string>('')

  const handleLogout = () => {
    auth.logout()
    navigate({ to: '/' })
  }

  const handleCreateAccount = () => {
    window.location.href = 'https://5395.19188103.com/create-account'
  }

  const authorizedOptions = [
    { label: 'Demand', path: '/demand', icon: BadgeDollarSign },
    { label: 'Supply', path: '/supply', icon: Factory },
    { label: 'Docs', path: '/docs', icon: FileText },
    { label: 'Log Out', icon: LogOut, onSelect: handleLogout },
  ]

  const unauthorizedOptions = [
    { label: 'Log In', path: '/login', icon: User },
    { label: 'Create Account', onSelect: handleCreateAccount, icon: UserPlus },
    { label: 'Docs', path: '/docs', icon: FileText },
  ]

  if (auth.isLoading) {
    return <Loader />
  }

  if (auth.user) {
    return (
      <Layout>
        <Menu
          options={authorizedOptions}
          onSelect={(option, index) => {
            setLastSelected(`${option.label} (${index})`)
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
          setLastSelected(`${option.label} (${index})`)
          if (option.path) {
            navigate({ to: option.path })
          }
        }}
      />
    </Layout>
  )
}

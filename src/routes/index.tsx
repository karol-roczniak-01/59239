import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  BadgeDollarSign,
  Factory,
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

  const handleJoin = () => {
    window.location.href = 'https://5395.19188103.com/join'
  }

  const authorizedOptions = [
    { label: 'Demand', path: '/demand', icon: BadgeDollarSign },
    { label: 'Supply', path: '/supply', icon: Factory },
    { label: 'Log Out', icon: LogOut, onSelect: handleLogout },
  ]

  const unauthorizedOptions = [
    { label: 'Log In', path: '/login', icon: User },
    { label: 'Join', onSelect: handleJoin, icon: UserPlus },
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
        title='5-92-39'
        description='The AI-powered private tender platform connecting businesses with the right suppliers — and suppliers with the right opportunities.'
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

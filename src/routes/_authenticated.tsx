import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import Loader from '@/components/Loader'

export const Route = createFileRoute('/_authenticated')({
  pendingComponent: () => <Loader />,
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />,
})

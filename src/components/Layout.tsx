import { ChevronLeft, ChevronRight, Grid2X2, Home } from 'lucide-react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from './Button'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const router = useRouter()

  const handleBack = (
    e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Only trigger if clicking directly on the container, not on children
    if (e.target !== e.currentTarget) return

    // Check if we're not at the root path
    if (router.state.location.pathname !== '/') {
      router.history.back()
    }
  }

  const handleForward = () => {
    router.history.forward()
  }

  const handleHome = () => {
    navigate({ to: '/' })
  }

  const handleHub = () => {
    window.location.href = 'https://19188103.com'
  }

  return (
    <div className="h-dvh relative w-full flex flex-col gap-4 items-center justify-center p-2 overflow-hidden">
      <div
        className="h-full w-full flex items-center justify-center overflow-hidden"
        onClick={handleBack}
      >
        {children}
      </div>
      <div className="md:hidden grid grid-cols-4 w-full">
        <Button
          onClick={handleBack}
          className="border-none"
          aria-label="Go back"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          onClick={handleHub}
          className="border-none"
          aria-label="Go to hub"
        >
          <Grid2X2 size={16} />
        </Button>
        <Button
          onClick={handleHome}
          className="border-none"
          aria-label="Go home"
        >
          <Home size={16} />
        </Button>
        <Button
          onClick={handleForward}
          className="border-none"
          aria-label="Go forward"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

export default Layout

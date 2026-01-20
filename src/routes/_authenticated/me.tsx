import { Button } from '@/components/Button'
import { useTheme } from '@/hooks/useTheme'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/me')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <div>
      <Button 
        onClick={toggleTheme}
      >
        Switch to {!isDark ? 'Light' : 'Dark'} Mode
      </Button>
    </div>
  )
}
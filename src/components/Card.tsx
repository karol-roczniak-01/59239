import { twMerge } from 'tailwind-merge'
import type { FormEvent, ReactNode } from 'react'

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

interface CardProps {
  children: ReactNode
  className?: string
  asForm?: boolean
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

const Card = ({ children, className, asForm = false, onSubmit }: CardProps) => {
  const baseClassName = twMerge(
    'md:w-sm w-full h-fit max-h-full flex flex-col border-primary border',
    className,
  )

  if (asForm) {
    return (
      <form className={baseClassName} onSubmit={onSubmit}>
        {children}
      </form>
    )
  }

  return <div className={baseClassName}>{children}</div>
}

const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={twMerge('shrink-0 p-2 border-b border-primary', className)}>
      {children}
    </div>
  )
}

const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={twMerge('overflow-auto flex-1 min-h-0 p-2', className)}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div className={twMerge('shrink-0 p-2 border-t border-primary', className)}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter }

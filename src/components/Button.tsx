import * as React from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends React.ComponentProps<'button'> {
  className?: string
}

function Button({ className = '', onClick, disabled, ...props }: ButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      className={twMerge(
        'h-8 px-2 flex gap-2 border border-primary items-center justify-center cursor-pointer outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:bg-primary hover:text-background hover:border-primary',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    />
  )
}

export { Button }

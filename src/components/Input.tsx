import * as React from 'react'
import { twMerge } from 'tailwind-merge'
import type {LucideIcon} from 'lucide-react';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: LucideIcon
}

function Input({ className, type, icon: Icon, ...props }: InputProps) {
  if (Icon) {
    return (
      <div className="relative w-full">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={16} className="text-primary" />
        </div>
        <input
          type={type}
          data-slot="input"
          className={twMerge(
            'h-8 border border-primary w-full pl-7 pr-2 outline-none',
            className,
          )}
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={twMerge(
        'h-8 border border-primary w-full px-2 outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

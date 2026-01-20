import * as React from "react"
import { twMerge } from "tailwind-merge"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={twMerge(
        "h-8 border border-primary w-full px-2 outline-none", 
        className
      )}
      {...props}
    />
  )
}

export { Input }

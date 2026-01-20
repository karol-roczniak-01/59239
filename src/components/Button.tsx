import * as React from "react"
import { twMerge } from "tailwind-merge"
import { useHotkeys } from "react-hotkeys-hook"

interface ButtonProps extends React.ComponentProps<"button"> {
  className?: string
  hotkey?: string
}

function Button({ className = "", hotkey, onClick, disabled, ...props }: ButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  
  useHotkeys(hotkey || "", () => ref.current?.click(), {
    enabled: !!hotkey && !disabled
  })

  return (
    <button
      ref={ref}
      className={twMerge(
        "h-8 px-2 flex gap-2 border border-primary items-center justify-center cursor-pointer outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:bg-primary hover:text-background hover:border-primary",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    />
  )
}

export { Button }
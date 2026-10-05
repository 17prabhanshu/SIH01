import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, iconLeft, iconRight, ...props }, ref) => {
    const id = React.useId()
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconLeft}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive focus-visible:ring-destructive" : "border-input",
              iconLeft && "pl-9",
              iconRight && "pr-9",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-[0.8rem] font-medium text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-[0.8rem] text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

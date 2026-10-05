import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingState({ message = "Loading...", className }: { message?: string, className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

export function LoadingSkeleton({ lines = 3, className }: { lines?: number, className?: string }) {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
      <div className="flex flex-col space-y-4">
        <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
        <LoadingSkeleton lines={2} />
      </div>
    </div>
  )
}

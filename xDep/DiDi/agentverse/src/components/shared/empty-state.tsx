"use client";
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50", className)}>
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant="outline">{action.label}</Button>
          </a>
        ) : (
          <Button variant="outline" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}

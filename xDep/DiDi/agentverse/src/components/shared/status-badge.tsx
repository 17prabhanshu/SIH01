import * as React from "react"
import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" = "default"
  
  const lowerStatus = status.toLowerCase()
  if (["active", "published", "success", "completed"].includes(lowerStatus)) variant = "success"
  else if (["pending", "draft", "warning", "in-progress"].includes(lowerStatus)) variant = "warning"
  else if (["inactive", "error", "failed", "cancelled"].includes(lowerStatus)) variant = "destructive"
  else if (["archived", "info"].includes(lowerStatus)) variant = "info"

  return <Badge variant={variant}>{status}</Badge>
}

export function SeverityBadge({ severity }: { severity: string }) {
  let variant: "default" | "destructive" | "warning" | "info" | "success" = "default"
  
  const lowerSeverity = severity.toLowerCase()
  if (lowerSeverity === "critical" || lowerSeverity === "high") variant = "destructive"
  else if (lowerSeverity === "medium") variant = "warning"
  else if (lowerSeverity === "low") variant = "info"
  else if (lowerSeverity === "none") variant = "success"

  return <Badge variant={variant}>{severity}</Badge>
}

export function ContentTypeBadge({ type }: { type: string }) {
  return <Badge variant="outline" className="uppercase text-[10px]">{type}</Badge>
}

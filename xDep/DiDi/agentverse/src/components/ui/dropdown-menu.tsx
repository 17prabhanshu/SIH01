"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        setOpen(!open)
        if ((children.props as any).onClick) (children.props as any).onClick(e)
      },
    })
  }
  return <button onClick={() => setOpen(!open)}>{children}</button>
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode
  className?: string
  align?: "start" | "end" | "center"
}) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute top-full z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }) {
  const { setOpen } = React.useContext(DropdownMenuContext)
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={() => {
        onSelect?.()
        setOpen(false)
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect?.()
          setOpen(false)
        }
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  )
}

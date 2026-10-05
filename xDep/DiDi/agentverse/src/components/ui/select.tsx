"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const SelectContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
}>({ open: false, setOpen: () => {}, value: "", setValue: () => {} })

export function Select({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || "")

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  const handleValueChange = (val: string) => {
    setInternalValue(val)
    onValueChange?.(val)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ open, setOpen, value: internalValue, setValue: handleValueChange }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronRight className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-90")} />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

export function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen } = React.useContext(SelectContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={cn(
            "absolute top-full z-50 mt-1 max-h-96 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
            className
          )}
        >
          <div className="w-full p-1">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SelectItem({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string
  className?: string
}) {
  const { value: selectedValue, setValue } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      onClick={() => setValue(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground font-medium",
        className
      )}
    >
      {children}
    </div>
  )
}

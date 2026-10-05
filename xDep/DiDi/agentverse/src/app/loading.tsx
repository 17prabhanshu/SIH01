import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-emerald-500">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-sm font-medium text-gray-400 animate-pulse">Loading Agentverse...</p>
      </div>
    </div>
  )
}

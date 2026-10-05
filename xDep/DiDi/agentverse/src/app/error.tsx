'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-6">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Something went wrong!
      </h2>
      
      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        {error.message || "An unexpected error occurred while processing your request."}
      </p>
      
      {error.digest && (
        <p className="mt-2 text-sm font-mono text-gray-500 bg-zinc-900 px-3 py-1 rounded-md">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </button>
        <Link 
          href="/" 
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
        >
          <Home className="h-4 w-4" />
          Go back home
        </Link>
      </div>
    </div>
  )
}

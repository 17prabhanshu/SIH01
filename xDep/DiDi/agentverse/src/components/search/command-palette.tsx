'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bot, Wrench, Box, FileText, BookOpen, Bookmark, Settings, Moon, LogIn, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'

type SearchResult = {
  id: string
  title: string
  description?: string
  type: 'agent' | 'tool' | 'model' | 'article' | 'guide' | 'glossary'
  url: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      setIsLoading(true)
      try {
        // Mocking API call for now. In real app, fetch from /api/search?q=query
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        } else {
          // fallback mock data
          setResults([
            { id: '1', title: 'AutoGPT', type: 'agent', url: '/agents/autogpt', description: 'Autonomous agent' },
            { id: '2', title: 'LangChain', type: 'tool', url: '/tools/langchain', description: 'Framework for LLMs' }
          ])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
        setSelectedIndex(0)
      }
    }
    
    const timeout = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    router.push(result.url)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'agent': return <Bot className="h-4 w-4" />
      case 'tool': return <Wrench className="h-4 w-4" />
      case 'model': return <Box className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      case 'guide': return <BookOpen className="h-4 w-4" />
      case 'glossary': return <Bookmark className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none"
          >
            <div 
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center px-4 py-3 border-b border-zinc-800">
                <Search className="h-5 w-5 text-gray-500 mr-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents, tools, articles..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                />
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded">
                  <span>ESC</span>
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {isLoading && (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                )}
                
                {!isLoading && query && results.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">No results found.</div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Results</div>
                    {results.map((result, index) => (
                      <div
                        key={result.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => handleSelect(result)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                          index === selectedIndex ? "bg-emerald-500/10 text-emerald-400" : "text-gray-300 hover:bg-zinc-800/50 hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-md",
                          index === selectedIndex ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-gray-400"
                        )}>
                          {getIcon(result.type)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-gray-500 truncate">{result.description}</span>
                          )}
                        </div>
                        <div className="text-xs px-2 py-1 bg-zinc-800 rounded capitalize text-gray-400">
                          {result.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!query && (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Actions</div>
                    
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-zinc-800/50 hover:text-white transition-colors" onClick={() => router.push('/admin')}>
                      <div className="p-2 rounded-md bg-zinc-800 text-gray-400"><Settings className="h-4 w-4" /></div>
                      <span className="font-medium flex-1">Go to Admin Dashboard</span>
                    </div>
                    
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-zinc-800/50 hover:text-white transition-colors" onClick={() => router.push('/agents')}>
                      <div className="p-2 rounded-md bg-zinc-800 text-gray-400"><Bot className="h-4 w-4" /></div>
                      <span className="font-medium flex-1">Browse Agents</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, Bot, Wrench, Cpu } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  article: FileText,
  news: FileText,
  guide: FileText,
  research: FileText,
  agent: Bot,
  tool: Wrench,
  model: Cpu,
};

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        router.push(results[selectedIndex].url);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
            placeholder="Search agents, tools, news..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-5 h-5 animate-spin text-primary ml-3" />}
          <button 
            onClick={onClose}
            className="ml-3 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border hover:bg-border transition-colors"
          >
            ESC
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((result, idx) => {
              const Icon = TYPE_ICONS[result.type.toLowerCase()] || FileText;
              return (
                <div
                  key={result.id}
                  onClick={() => {
                    router.push(result.url);
                    onClose();
                  }}
                  className={cn(
                    "flex items-center px-4 py-3 cursor-pointer mx-2 rounded-xl transition-colors",
                    idx === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  )}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-4",
                    idx === selectedIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-foreground truncate">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-muted-foreground truncate">{result.description}</div>
                    )}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-4">
                    {result.type}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {query.length > 1 && results.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No results found for "{query}"</p>
          </div>
        )}

        {query.length <= 1 && (
          <div className="py-8 px-6 border-t border-border/50 bg-muted/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Quick Links</h4>
            <div className="flex flex-wrap gap-2">
              <span onClick={() => { router.push('/agents'); onClose(); }} className="text-sm cursor-pointer hover:text-primary transition-colors bg-background border border-border px-3 py-1.5 rounded-full">Explore Agents</span>
              <span onClick={() => { router.push('/news'); onClose(); }} className="text-sm cursor-pointer hover:text-primary transition-colors bg-background border border-border px-3 py-1.5 rounded-full">Latest News</span>
              <span onClick={() => { router.push('/tools'); onClose(); }} className="text-sm cursor-pointer hover:text-primary transition-colors bg-background border border-border px-3 py-1.5 rounded-full">Developer Tools</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

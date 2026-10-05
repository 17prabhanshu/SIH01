"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Sun, Moon, PenLine, Mail } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "./theme-provider";
import { CommandPalette } from "../ui/command-palette";

const NAV_LINKS = [
  { name: "Agents", href: "/agents" },
  { name: "Tools", href: "/tools" },
  { name: "Models", href: "/models" },
  { name: "Build", href: "/build" },
  { name: "Security", href: "/security" },
  { name: "Guides", href: "/guides" },
  { name: "News", href: "/news" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 h-16 transition-colors duration-300 border-b",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-border"
            : "bg-background border-transparent"
        )}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 transition-colors">
              <span className="font-bold text-primary">A</span>
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">Agentverse</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-2",
                    isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50 hidden sm:flex items-center gap-2"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs border border-border rounded px-1.5 py-0.5 bg-muted/50">⌘K</span>
            </button>
            
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50 hidden sm:block"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/contact"
              className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Get in Touch</span>
            </Link>

            <Link
              href="/admin/login"
              className="hidden md:flex items-center gap-2 bg-muted text-foreground border border-border px-4 py-2 rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-primary/80"></span>
              Admin
            </Link>

            <button
              className="p-2 text-foreground lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

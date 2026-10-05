"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{name: string, role: string, avatar: string | null} | null>(null);
  
  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUser(data);
      })
      .catch(console.error);
  }, []);

  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  // Fallback info
  const displayName = user?.name || 'Admin User';
  const displayRole = user?.role ? user.role.replace('_', ' ') : 'Super Admin';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6">
      <button
        onClick={toggleSidebar}
        className="p-2 text-muted-foreground hover:text-foreground lg:hidden rounded-md hover:bg-muted/50 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-4">
        <div className="hidden md:flex flex-col">
          <div className="text-sm text-muted-foreground capitalize">
            Admin / {pathname.split('/').slice(2).join(' / ') || 'Dashboard'}
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {formattedTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 pr-3 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium border border-primary/30 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="hidden sm:block text-sm text-left">
              <p className="font-medium leading-none">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{displayRole}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border py-1 animate-in fade-in zoom-in-95">
              <Link 
                href="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User className="h-4 w-4" /> Profile Settings
              </Link>
              <div className="h-px bg-border my-1" />
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/admin/login';
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

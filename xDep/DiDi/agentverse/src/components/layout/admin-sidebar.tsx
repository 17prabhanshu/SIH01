"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tag,
  Bot,
  Wrench,
  Cpu,
  Layers,
  Server,
  Shield,
  BookOpen,
  Users,
  UserCheck,
  Image as ImageIcon,
  Search,
  ArrowRight,
  Link as LinkIcon,
  UserCog,
  Settings,
  ClipboardList,
  Mail,
  Bell,
} from "lucide-react";

const SIDEBAR_SECTIONS = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { name: "Articles", href: "/admin/articles", icon: FileText },
      { name: "Categories", href: "/admin/categories", icon: FolderOpen },
      { name: "Tags", href: "/admin/tags", icon: Tag },
    ],
  },
  {
    title: "Directory",
    items: [
      { name: "Agents", href: "/admin/agents", icon: Bot },
      { name: "Tools", href: "/admin/tools", icon: Wrench },
      { name: "Models", href: "/admin/models", icon: Cpu },
      { name: "Frameworks", href: "/admin/frameworks", icon: Layers },
      { name: "MCP Servers", href: "/admin/mcp", icon: Server },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { name: "Security Alerts", href: "/admin/security", icon: Shield },
      { name: "Glossary", href: "/admin/glossary", icon: BookOpen },
    ],
  },
  {
    title: "Community",
    items: [
      { name: "Contributors", href: "/admin/contributors", icon: Users },
      { name: "Authors", href: "/admin/authors", icon: UserCheck },
      { name: "Inbox", href: "/admin/contacts", icon: Mail },
      { name: "Subscribers", href: "/admin/subscribers", icon: Bell },
    ],
  },
  {
    title: "Media",
    items: [
      { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    title: "SEO",
    items: [
      { name: "SEO Dashboard", href: "/admin/seo", icon: Search },
      { name: "Redirects", href: "/admin/redirects", icon: ArrowRight },
      { name: "Links", href: "/admin/links", icon: LinkIcon },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Users", href: "/admin/users", icon: UserCog },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Audit Log", href: "/admin/audit", icon: ClipboardList },
    ],
  },
];

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex flex-col h-screen w-64 border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">AV</span>
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin">
          <div className="space-y-8">
            {SIDEBAR_SECTIONS.map((section, idx) => (
              <div key={idx}>
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h4>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/admin');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

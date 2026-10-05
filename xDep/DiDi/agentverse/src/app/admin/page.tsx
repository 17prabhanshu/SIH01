import { db } from "@/lib/db";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { FileText, Bot, Wrench, Cpu, Activity, TrendingUp, Users } from "lucide-react";

export const metadata = { title: 'Dashboard | Adminverse' };

export default async function AdminDashboardPage() {
  await requireAuth();

  let stats = { articles: 0, agents: 0, tools: 0, models: 0, users: 0 };
  let recentArticles: any[] = [];
  let recentUsers: any[] = [];
  
  try {
    stats.articles = await db.article.count();
    stats.agents = await db.agent.count();
    stats.tools = await db.tool.count();
    stats.models = await db.model.count();
    stats.users = await db.user.count();

    recentArticles = await db.article.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    
    recentUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
    });
  } catch (err) {
    console.error("Failed to fetch dashboard data", err);
  }

  const statCards = [
    { title: "Articles", value: stats.articles, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Agents", value: stats.agents, icon: Bot, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Tools", value: stats.tools, icon: Wrench, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Models", value: stats.models, icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const recentActivity = [
    ...recentArticles.map(a => ({
      title: `Article ${a.status === 'PUBLISHED' ? 'published' : 'drafted'}: '${a.title}'`,
      time: a.createdAt.toISOString(),
      icon: FileText,
      bg: "bg-purple-500/10",
      color: "text-purple-500",
      href: `/admin/articles/${a.id}/edit`
    })),
    ...recentUsers.map(u => ({
      title: `New User Registration: ${u.name || u.email}`,
      time: u.createdAt.toISOString(),
      icon: Users,
      bg: "bg-blue-500/10",
      color: "text-blue-500",
      href: `/admin/users/${u.id}/edit`
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight mb-2">Control Center</h1>
          <p className="text-muted-foreground">Monitor platform intelligence and manage content.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/articles/new" className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2">
            <FileText className="w-4 h-4" /> New Article
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon className="w-24 h-24 -mr-6 -mt-6 transform group-hover:scale-110 transition-transform" />
            </div>
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</h3>
            <p className="text-4xl font-black font-heading">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 bg-card border border-border rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" /> Recent Platform Activity
            </h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <Link key={i} href={activity.href} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/30 transition-colors group cursor-pointer">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.time).toLocaleDateString()}</p>
                </div>
                <div className="text-muted-foreground group-hover:translate-x-1 transition-transform">
                  &rarr;
                </div>
              </Link>
            )) : (
              <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground">
                No recent activity.
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
          <h2 className="font-heading text-2xl font-bold flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-accent" /> Quick Actions
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Manage SEO & Articles', href: '/admin/articles' },
              { label: 'Agent Directory', href: '/admin/agents' },
              { label: 'Platform Users', href: '/admin/users' },
              { label: 'Security Alerts', href: '/admin/security' },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex items-center justify-between p-5 rounded-2xl border border-border hover:bg-muted transition-colors group shadow-sm">
                <span className="font-bold text-sm group-hover:text-primary transition-colors">{action.label}</span>
                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

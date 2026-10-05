import { Search, Globe, ArrowUpRight, AlertTriangle } from "lucide-react";

export default function SeoDashboardPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Global SEO Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor search visibility, missing metadata, and overall site health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-bold">Indexed Pages</p>
              <h3 className="text-3xl font-bold font-heading">1,204</h3>
            </div>
          </div>
          <p className="text-sm text-emerald-500 font-medium flex items-center gap-1"><ArrowUpRight className="w-4 h-4"/> +14% this month</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-bold">Missing Meta</p>
              <h3 className="text-3xl font-bold font-heading">42</h3>
            </div>
          </div>
          <p className="text-sm text-amber-500 font-medium">Pages need focus keywords</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-bold">Avg Position</p>
              <h3 className="text-3xl font-bold font-heading">12.4</h3>
            </div>
          </div>
          <p className="text-sm text-emerald-500 font-medium flex items-center gap-1"><ArrowUpRight className="w-4 h-4"/> Improved by 2.1</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8 text-center h-[300px] flex flex-col items-center justify-center">
        <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold mb-2">Google Search Console Integration Pending</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Connect your Google Search Console account via OAuth to see real-time keyword rankings, CTR, and indexing status directly in this dashboard.
        </p>
        <button className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90">
          Connect Search Console
        </button>
      </div>
    </div>
  );
}

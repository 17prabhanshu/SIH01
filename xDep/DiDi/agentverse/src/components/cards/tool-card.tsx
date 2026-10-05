import Link from 'next/link';

interface ToolCardProps {
  tool: {
    name: string;
    slug: string;
    category: string;
    description: string;
    language: string;
    isOpenSource: boolean;
  };
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={"/tools/" + tool.slug} className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg">{tool.name}</h3>
        <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
          {tool.category}
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{tool.description}</p>
      
      <div className="flex flex-wrap gap-1 mt-auto">
        {tool.language && <span className="text-[10px] px-2 py-0.5 border rounded bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{tool.language}</span>}
        {tool.isOpenSource && <span className="text-[10px] px-2 py-0.5 border rounded bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Open Source</span>}
      </div>
    </Link>
  );
}

import Link from 'next/link';

interface AgentCardProps {
  agent: {
    name: string;
    slug: string;
    category: string;
    company: string;
    description: string;
    hasMCP: boolean;
    hasToolUse: boolean;
    isOpenSource: boolean;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={"/agents/" + agent.slug} className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
          {agent.name.charAt(0)}
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
          {agent.category}
        </span>
      </div>
      <h3 className="font-bold text-lg">{agent.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{agent.company}</p>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{agent.description}</p>
      
      <div className="flex flex-wrap gap-1 mt-auto">
        {agent.hasMCP && <span className="text-[10px] px-2 py-0.5 border rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">MCP ✓</span>}
        {agent.hasToolUse && <span className="text-[10px] px-2 py-0.5 border rounded bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">Tools</span>}
        {agent.isOpenSource && <span className="text-[10px] px-2 py-0.5 border rounded bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Open Source</span>}
      </div>
    </Link>
  );
}

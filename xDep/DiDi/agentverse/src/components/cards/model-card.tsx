import Link from 'next/link';

interface ModelCardProps {
  model: {
    name: string;
    slug: string;
    provider: string;
    contextWindow: string;
    modalities: string[];
    capabilities: string[];
    status: 'Active' | 'Preview' | 'Deprecated';
  };
}

export function ModelCard({ model }: ModelCardProps) {
  const statusColors = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Preview: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Deprecated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <Link href={"/models/" + model.slug} className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{model.name}</h3>
        <span className={"text-[10px] px-2 py-0.5 rounded-full " + statusColors[model.status]}>
          {model.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{model.provider}</p>
      
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1">Modalities</div>
        <div className="flex gap-1 flex-wrap">
          {model.modalities.map(m => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 border rounded bg-muted">{m}</span>
          ))}
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t border-border">
          <span>Context: {model.contextWindow}</span>
          <span>{model.capabilities.length} capabilities</span>
        </div>
      </div>
    </Link>
  );
}

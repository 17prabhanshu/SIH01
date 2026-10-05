const fs = require('fs');
const path = require('path');

const root = '/Users/prabhanshushekhar/Downloads/xSIH101/xDep/DiDi/agentverse';
const mkdir = (dir) => fs.mkdirSync(path.join(root, dir), { recursive: true });
const writeFile = (file, content) => fs.writeFileSync(path.join(root, file), content.trim() + '\n');

mkdir('src/app/(public)');
mkdir('src/app/(public)/agents');
mkdir('src/app/(public)/agents/[slug]');
mkdir('src/app/(public)/tools');
mkdir('src/app/(public)/tools/[slug]');
mkdir('src/app/(public)/models');
mkdir('src/app/(public)/models/[slug]');
mkdir('src/app/(public)/news');
mkdir('src/app/(public)/news/[slug]');
mkdir('src/app/(public)/guides');
mkdir('src/app/(public)/guides/[slug]');
mkdir('src/app/(public)/dictionary');
mkdir('src/app/(public)/dictionary/[slug]');
mkdir('src/app/(public)/security');
mkdir('src/app/(public)/security/[slug]');
mkdir('src/app/(public)/authors/[slug]');
mkdir('src/app/(public)/search');
mkdir('src/app/(public)/about');
mkdir('src/app/(public)/privacy');
mkdir('src/app/(public)/terms');
mkdir('src/app/(public)/contact');
mkdir('src/components/cards');

writeFile('src/app/(public)/page.tsx', `
import Link from 'next/link';

export const metadata = {
  title: 'Agentverse | The Intelligence Layer for the Agentic Internet',
  description: 'Discover and compare agents, tools, and models.',
};

export default async function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-24 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
          The Intelligence Layer for the Agentic Internet
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Discover, compare, and integrate the next generation of AI agents, tools, and models.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/agents" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90">
            Explore Agents
          </Link>
          <Link href="/news" className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-md font-medium">
            Read Latest
          </Link>
        </div>
      </section>
      
      {/* Placeholders for sections */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-8">Latest Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-muted-foreground">Articles coming soon...</div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto w-full bg-slate-50 dark:bg-slate-900 rounded-3xl">
        <h2 className="text-3xl font-bold mb-8">Trending Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-muted-foreground">Agents coming soon...</div>
        </div>
      </section>
    </div>
  );
}
`);

writeFile('src/components/cards/article-card.tsx', `
import Image from 'next/image';
import Link from 'next/link';

interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    categoryName: string;
    authorName: string;
    publishedAt: string;
    readingTime: number;
    featuredImage?: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={"/news/" + article.slug} className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {article.featuredImage ? (
          <Image src={article.featuredImage} alt={article.title} fill className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        )}
        <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
          {article.categoryName}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="font-medium">{article.authorName}</div>
          <div>{new Date(article.publishedAt).toLocaleDateString()} • {article.readingTime} min read</div>
        </div>
      </div>
    </Link>
  );
}
`);

writeFile('src/components/cards/agent-card.tsx', `
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
`);

writeFile('src/components/cards/tool-card.tsx', `
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
`);

writeFile('src/components/cards/model-card.tsx', `
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
`);

const pages = [
  { path: 'agents/page.tsx', title: 'Agents' },
  { path: 'agents/[slug]/page.tsx', title: 'Agent Details' },
  { path: 'tools/page.tsx', title: 'Tools' },
  { path: 'tools/[slug]/page.tsx', title: 'Tool Details' },
  { path: 'models/page.tsx', title: 'Models' },
  { path: 'models/[slug]/page.tsx', title: 'Model Details' },
  { path: 'news/page.tsx', title: 'News' },
  { path: 'news/[slug]/page.tsx', title: 'Article Details' },
  { path: 'guides/page.tsx', title: 'Guides' },
  { path: 'guides/[slug]/page.tsx', title: 'Guide Details' },
  { path: 'dictionary/page.tsx', title: 'Dictionary' },
  { path: 'dictionary/[slug]/page.tsx', title: 'Term Details' },
  { path: 'security/page.tsx', title: 'Security' },
  { path: 'security/[slug]/page.tsx', title: 'Security Alert' },
  { path: 'authors/[slug]/page.tsx', title: 'Author Profile' },
  { path: 'search/page.tsx', title: 'Search Results' },
  { path: 'about/page.tsx', title: 'About Us' },
  { path: 'privacy/page.tsx', title: 'Privacy Policy' },
  { path: 'terms/page.tsx', title: 'Terms of Service' },
  { path: 'contact/page.tsx', title: 'Contact Us' }
];

pages.forEach(p => {
  writeFile("src/app/(public)/" + p.path, 
"export const metadata = { title: '" + p.title + " | Agentverse' };\n\n" +
"export default function Page() {\n" +
"  return (\n" +
"    <div className=\"container mx-auto py-12 px-4\">\n" +
"      <h1 className=\"text-4xl font-bold mb-6\">" + p.title + "</h1>\n" +
"      <p className=\"text-muted-foreground\">Content coming soon...</p>\n" +
"    </div>\n" +
"  );\n" +
"}\n"
  );
});

console.log('Files generated successfully.');

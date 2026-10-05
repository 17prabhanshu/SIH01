const fs = require('fs');
const path = require('path');
const root = '/Users/prabhanshushekhar/Downloads/xSIH101/xDep/DiDi/agentverse';

const content = `import Link from 'next/link';
// import { db } from '@/lib/db'; // Assuming db exists
import { ArticleCard } from '@/components/cards/article-card';
import { AgentCard } from '@/components/cards/agent-card';
import { ToolCard } from '@/components/cards/tool-card';
import { ModelCard } from '@/components/cards/model-card';

export const metadata = {
  title: 'Agentverse | The Intelligence Layer for the Agentic Internet',
  description: 'Discover and compare agents, tools, and models.',
};

export default async function HomePage() {
  let agents: any[] = [];
  let articles: any[] = [];
  let tools: any[] = [];
  let models: any[] = [];
  let securityAlerts: any[] = [];
  let guides: any[] = [];

  try {
    // These are mock data shapes that would come from the database
    // agents = await db.agent.findMany({ where: { status: 'PUBLISHED', featured: true }, take: 4 })
    // articles = await db.article.findMany({ where: { status: 'PUBLISHED' }, take: 4 })
  } catch (error) {
    // Database not seeded or not available
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero */}
      <section className="py-24 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-pulse">
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

      {/* 2. Latest Intelligence */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">Latest Intelligence</h2>
          <Link href="/news" className="text-primary hover:underline text-sm font-medium">View all articles &rarr;</Link>
        </div>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id || article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
            No articles available at the moment.
          </div>
        )}
      </section>

      {/* 3. Trending Agents */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">Trending Agents</h2>
          <Link href="/agents" className="text-primary hover:underline text-sm font-medium">Explore all agents &rarr;</Link>
        </div>
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent.id || agent.slug} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
            No agents available at the moment.
          </div>
        )}
      </section>

      {/* 4. Featured Tools */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full bg-slate-50 dark:bg-slate-900 rounded-3xl my-8">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">Featured Tools</h2>
          <Link href="/tools" className="text-primary hover:underline text-sm font-medium">View all tools &rarr;</Link>
        </div>
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map(tool => (
              <ToolCard key={tool.id || tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
            No tools available at the moment.
          </div>
        )}
      </section>

      {/* 5. Model Radar */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">Model Radar</h2>
          <Link href="/models" className="text-primary hover:underline text-sm font-medium">Compare models &rarr;</Link>
        </div>
        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map(model => (
              <ModelCard key={model.id || model.slug} model={model} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
            No models available at the moment.
          </div>
        )}
      </section>

      {/* 6. Security Alerts */}
      {securityAlerts.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl font-bold mb-8 text-red-600 dark:text-red-400">Security Alerts</h2>
          <div className="space-y-4">
            {securityAlerts.map(alert => (
              <div key={alert.id || alert.slug} className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-300">{alert.title}</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">{alert.summary}</p>
                </div>
                <Link href={"/security/" + alert.slug} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium">Read More</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Latest Guides */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">Latest Guides</h2>
          <Link href="/guides" className="text-primary hover:underline text-sm font-medium">All guides &rarr;</Link>
        </div>
        {guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map(guide => (
              <div key={guide.id || guide.slug} className="p-6 border border-border rounded-xl">
                <div className="text-xs mb-2 text-muted-foreground">{guide.difficulty} • {guide.readingTime} min read</div>
                <h3 className="font-bold text-xl mb-2">{guide.title}</h3>
                <Link href={"/guides/" + guide.slug} className="text-primary text-sm hover:underline mt-4 inline-block">Read Guide &rarr;</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
            No guides available at the moment.
          </div>
        )}
      </section>

      {/* 8. Newsletter */}
      <section className="py-24 px-4 bg-primary text-primary-foreground mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Ahead of the Agentic Curve</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of developers and researchers getting our weekly intelligence report.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-3 rounded-md flex-1 text-foreground bg-background border-none focus:ring-2 focus:ring-primary-foreground"
              required
            />
            <button type="submit" className="px-6 py-3 bg-foreground text-background font-medium rounded-md hover:bg-foreground/90 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}`;

fs.writeFileSync(path.join(root, 'src/app/(public)/page.tsx'), content);
console.log('Home page updated');

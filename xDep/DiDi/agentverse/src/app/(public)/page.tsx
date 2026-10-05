import Link from 'next/link';
import { db } from '@/lib/db';
import { ArticleCard } from '@/components/cards/article-card';
import { AgentCard } from '@/components/cards/agent-card';
import { ToolCard } from '@/components/cards/tool-card';
import { ModelCard } from '@/components/cards/model-card';
import { AnimatedHero } from '@/components/animations/animated-hero';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { TiltCard } from '@/components/animations/tilt-card';
import { Marquee } from '@/components/animations/marquee';

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

  try {
    agents = await db.agent.findMany({ where: { status: 'PUBLISHED' }, take: 4 });
    articles = await db.article.findMany({ where: { status: 'PUBLISHED' }, take: 4 });
    tools = await db.tool.findMany({ where: { status: 'PUBLISHED' }, take: 8 });
    models = await db.model.findMany({ where: { status: 'PUBLISHED' }, take: 4 });
    securityAlerts = await db.securityAlert.findMany({ where: { status: 'ACTIVE' }, take: 2 });
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      
      {/* 1. Artistic Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-4">
        {/* Floating abstract orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/30 via-primary/5 to-transparent mix-blend-multiply animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/30 via-accent/5 to-transparent mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent mix-blend-multiply animate-blob animation-delay-4000"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">


          <h1 className="text-[12vw] sm:text-[8vw] md:text-[6rem] leading-[0.9] font-heading font-black tracking-tighter text-center uppercase mb-8">
            <span className="block">The Intelligence</span>
            <span className="block text-outline-accent italic">Layer</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl text-center font-medium mb-12">
            Discover, compare, and integrate the next generation of AI agents, tools, and models.
          </p>
          
          <ScrollReveal delay={0.2} direction="up" className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
            <Link href="/agents" className="group relative px-10 py-5 bg-foreground text-background rounded-full font-bold uppercase tracking-wider overflow-hidden">
              <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300">Explore Agents</span>
              <div className="absolute inset-0 h-full w-full bg-primary transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 ease-in-out"></div>
            </Link>
            <Link href="/news" className="group px-10 py-5 bg-transparent border border-foreground/20 hover:border-foreground text-foreground rounded-full font-bold uppercase tracking-wider transition-all">
              Read Latest <span className="inline-block group-hover:translate-x-2 transition-transform">&rarr;</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Intelligence Island */}
      <section className="py-8 px-4 w-full max-w-[1400px] mx-auto">
        <div className="bg-card rounded-[3rem] p-8 md:p-16 lg:p-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter uppercase leading-[0.9]">
                Latest<br/><span className="text-primary">Intelligence</span>
              </h2>
              <Link href="/news" className="inline-flex items-center gap-2 text-lg font-bold uppercase tracking-widest hover:text-primary transition-colors">
                View All <span className="p-3 rounded-full border border-current">&rarr;</span>
              </Link>
            </div>
          </ScrollReveal>
          
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((article, i) => (
                <ScrollReveal key={article.id || article.slug} delay={i * 0.1}>
                  <ArticleCard article={article} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed rounded-[2rem] text-muted-foreground">
              No articles available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured Tools Marquee */}
      <section className="py-32 w-full overflow-hidden relative">
        <ScrollReveal>
          <div className="px-4 max-w-[1400px] mx-auto mb-16">
            <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter uppercase text-center">
              Featured <span className="text-outline">Tools</span>
            </h2>
          </div>
        </ScrollReveal>
        
        {tools.length > 0 ? (
          <div className="relative z-10 w-[110vw] -ml-[5vw] transform -rotate-2">
            <div className="bg-foreground py-12">
              <Marquee speed={40}>
                {tools.map(tool => (
                  <div key={tool.id || tool.slug} className="w-[350px] shrink-0 mx-4">
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        ) : null}
      </section>

      {/* 4. Trending Agents with 3D Tilt */}
      <section className="py-24 px-4 w-full max-w-[1400px] mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-foreground/10 pb-12">
            <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter uppercase">
              Trending <br/><span className="text-accent">Agents</span>
            </h2>
            <Link href="/agents" className="inline-flex items-center gap-2 text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors">
              Explore All <span className="p-3 rounded-full border border-current">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent, i) => (
              <ScrollReveal key={agent.id || agent.slug} delay={i * 0.15} direction="up">
                <TiltCard>
                  <AgentCard agent={agent} />
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        ) : null}
      </section>

      {/* 5. Security Alerts Minimal */}
      {securityAlerts.length > 0 && (
        <section className="py-12 px-4 max-w-[1400px] mx-auto w-full">
          <ScrollReveal>
            <div className="bg-destructive text-destructive-foreground rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-black/20 via-black/5 to-transparent"></div>
              <h2 className="text-4xl font-heading font-black uppercase mb-8 flex items-center gap-4">
                <span className="w-4 h-4 rounded-full bg-current animate-ping"></span>
                Security Alerts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {securityAlerts.map((alert, i) => (
                  <Link href={"/security/" + alert.slug} key={alert.id || alert.slug} className="group">
                    <div className="p-6 border border-current/20 rounded-[1.5rem] hover:bg-black/10 transition-colors">
                      <h3 className="font-bold text-xl mb-2">{alert.title}</h3>
                      <p className="opacity-80 line-clamp-2">{alert.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 6. Newsletter Massive Block */}
      <section className="py-32 px-4 relative overflow-hidden mt-20">
        <div className="absolute inset-0 bg-foreground"></div>
        <ScrollReveal direction="up" className="max-w-[1400px] mx-auto text-center relative z-10 text-background py-32 rounded-[3rem] border border-background/10 backdrop-blur-md">
          <h2 className="text-[8vw] leading-[0.8] font-heading font-black uppercase tracking-tighter mb-8">
            Stay <span className="text-outline-accent">Ahead</span>
          </h2>
          <p className="text-xl md:text-2xl font-medium opacity-80 mb-12 max-w-2xl mx-auto">
            Join the elite circle of developers getting our weekly intelligence report.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto relative px-4">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="px-8 py-6 rounded-full flex-1 text-foreground bg-background border-none focus:outline-none focus:ring-4 focus:ring-primary text-lg font-bold uppercase tracking-wider"
              required
            />
            <button type="submit" className="px-10 py-6 bg-primary text-primary-foreground font-black tracking-widest uppercase rounded-full hover:scale-105 transition-transform">
              Subscribe
            </button>
          </form>
        </ScrollReveal>
      </section>
    </div>
  );
}
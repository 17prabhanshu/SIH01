import { db } from "@/lib/db";
import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: 'Agents Directory | Agentverse' };

export default async function AgentsPage() {
  const agents = await db.agent.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10 dark:bg-emerald-900/20" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-20">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Agents</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Explore our curated directory of autonomous AI agents. Find the perfect intelligent worker for your next task.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent: any, i: number) => (
            <ScrollReveal key={agent.id} delay={i * 0.1}>
              <Link href={`/agents/${agent.slug}`}>
                <TiltCard className="h-full">
                  <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-primary/50 transition-colors overflow-hidden group">
                    <div className="w-full h-32 relative overflow-hidden bg-muted border-b border-border/50 shrink-0">
                      <img 
                        src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop&sig=${agent.id}`} 
                        alt="Abstract Art" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                    </div>
                    
                    <div className="p-8 pt-4 flex flex-col h-full relative">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center overflow-hidden -mt-12 shadow-lg relative z-10">
                          {agent.logoUrl ? (
                            <img src={agent.logoUrl} alt={agent.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-heading text-2xl font-bold text-primary">{agent.name.charAt(0)}</span>
                          )}
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 font-mono text-xs z-10">
                          {agent.pricingModel || 'FREE'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-heading text-2xl font-bold mb-3">{agent.name}</h3>
                      <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-6">
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/30">
                        {agent.openSource && (
                          <Badge variant="outline" className="rounded-full text-xs">Open Source</Badge>
                        )}
                        {agent.mcpSupport && (
                          <Badge variant="outline" className="rounded-full text-xs">MCP</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}

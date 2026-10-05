import { db } from "@/lib/db";
import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: 'AI Models | Agentverse' };

export default async function ModelsPage() {
  const models = await db.model.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10 dark:bg-emerald-900/20" />
      <div className="absolute bottom-1/4 left-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Models</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                The LLMs, VLMs, and foundational models driving the agentic ecosystem.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model: any, i: number) => (
            <ScrollReveal key={model.id} delay={i * 0.1}>
              <Link href={`/models/${model.slug}`}>
                <TiltCard className="h-full">
                  <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-accent/50 transition-colors overflow-hidden group">
                    <div className="w-full h-32 relative overflow-hidden bg-muted border-b border-border/50 shrink-0">
                      <img 
                        src={`https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop&sig=${model.id}`} 
                        alt="Abstract Art" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-luminosity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-8 pt-4 flex flex-col h-full relative">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center overflow-hidden -mt-12 shadow-lg relative z-10">
                           <span className="font-heading text-2xl font-bold text-secondary-foreground">{model.provider.charAt(0)}</span>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 font-mono text-xs bg-accent/10 text-accent z-10">
                          {model.contextWindow ? `${Math.round(model.contextWindow / 1000)}k Context` : 'Unknown Context'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-heading text-2xl font-bold mb-1">{model.name}</h3>
                      <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase mb-4 opacity-70">
                        {model.provider}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/30">
                        {model.reasoning && (
                          <Badge variant="outline" className="rounded-full text-xs">Reasoning</Badge>
                        )}
                        {model.toolCalling && (
                          <Badge variant="outline" className="rounded-full text-xs border-accent/20 bg-accent/5">Tool Calling</Badge>
                        )}
                        {model.vision && (
                          <Badge variant="outline" className="rounded-full text-xs">Vision</Badge>
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

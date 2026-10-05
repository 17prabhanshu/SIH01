import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, Cpu } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await db.agent.findUnique({ where: { slug } });
  return { title: agent ? `${agent.name} | Agentverse` : 'Agent Not Found' };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const agent = await db.agent.findUnique({ 
    where: { slug },
    include: { category: true, company: true }
  });

  if (!agent) return notFound();

  // Extract dummy JSON data safely
  const capabilities = typeof agent.capabilities === 'string' ? JSON.parse(agent.capabilities) : agent.capabilities || [];
  const integrations = typeof agent.integrations === 'string' ? JSON.parse(agent.integrations) : agent.integrations || [];

  return (
    <div className="relative min-h-screen pb-24">
      {/* Dynamic Background Orb */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      {/* Header Banner */}
      <div className="w-full h-[30vh] sm:h-[40vh] relative overflow-hidden bg-muted border-b border-border">
        {agent.logoUrl ? (
           <img src={agent.logoUrl} alt={agent.name} className="w-full h-full object-cover opacity-50 blur-sm scale-105" />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-32 relative z-10">
        <ScrollReveal>
          <Link href="/agents" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
            <ArrowLeft className="w-4 h-4" /> Back to Agents
          </Link>

          <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-[3rem] shadow-2xl mb-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-3xl overflow-hidden bg-background border border-border shadow-inner p-4 flex items-center justify-center">
              {agent.logoUrl ? (
                <img src={agent.logoUrl} alt={agent.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <span className="font-heading font-bold text-5xl text-primary">{agent.name.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    {agent.category?.name || 'Autonomous Agent'}
                  </span>
                  {agent.openSource && (
                    <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      Open Source
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight">{agent.name}</h1>
                <p className="text-xl text-muted-foreground mt-4 leading-relaxed max-w-2xl">
                  {agent.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                {agent.officialUrl && (
                  <a href={agent.officialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
                {agent.docsUrl && (
                  <a href={agent.docsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted text-foreground border border-border px-6 py-3 rounded-full font-bold hover:bg-muted/80 transition-colors">
                    Documentation
                  </a>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-12">
            <ScrollReveal delay={0.1}>
              <h2 className="font-heading text-3xl font-bold mb-6 flex items-center gap-3">
                <Cpu className="text-primary" /> Technical Overview
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground">
                <p>{agent.overview || `Detailed overview for ${agent.name} is currently being updated by our editorial team.`}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h2 className="font-heading text-3xl font-bold mb-6">Capabilities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.isArray(capabilities) && capabilities.length > 0 ? capabilities.map((cap: string, i: number) => (
                  <div key={i} className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="font-medium">{cap}</span>
                  </div>
                )) : (
                  <p className="text-muted-foreground">Capabilities not listed.</p>
                )}
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-8">
            <ScrollReveal delay={0.3}>
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="font-bold text-lg mb-4 border-b border-border/50 pb-4">Specifications</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Model Used</dt>
                    <dd className="font-medium">{agent.modelUsed || 'Various / BYOK'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pricing Model</dt>
                    <dd className="font-medium">{agent.pricingModel || agent.pricing || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deployment</dt>
                    <dd className="font-medium">{agent.deployment || 'Cloud / SaaS'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Browser Use</dt>
                    <dd className="font-medium">{agent.browserUse ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="bg-muted/30 border border-border rounded-3xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" /> Security Stance
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.securityInfo || 'No verified security audit provided.'}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

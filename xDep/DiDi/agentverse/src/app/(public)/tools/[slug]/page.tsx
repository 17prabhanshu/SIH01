import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Code } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await db.tool.findUnique({ where: { slug } });
  return { title: tool ? `${tool.name} | Agentverse` : 'Tool Not Found' };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tool = await db.tool.findUnique({ 
    where: { slug },
    include: { category: true, company: true }
  });

  if (!tool) return notFound();

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-blue-500/10 via-blue-500/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="w-full h-[30vh] sm:h-[40vh] relative overflow-hidden bg-muted border-b border-border">
        {tool.logoUrl ? (
           <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-cover opacity-50 blur-sm scale-105" />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-32 relative z-10">
        <ScrollReveal>
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>

          <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-[3rem] shadow-2xl mb-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-3xl overflow-hidden bg-background border border-border shadow-inner p-4 flex items-center justify-center">
              {tool.logoUrl ? (
                <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <span className="font-heading font-bold text-5xl text-blue-500">{tool.name.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    {tool.category?.name || 'Developer Tool'}
                  </span>
                  {tool.openSource && (
                    <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      Open Source
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight">{tool.name}</h1>
                <p className="text-xl text-muted-foreground mt-4 leading-relaxed max-w-2xl">
                  {tool.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                {tool.officialUrl && (
                  <a href={tool.officialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
                {tool.githubUrl && (
                  <a href={tool.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted text-foreground border border-border px-6 py-3 rounded-full font-bold hover:bg-muted/80 transition-colors">
                    GitHub Repo
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
                <Code className="text-blue-500" /> Technical Overview
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground">
                <p>{tool.overview || `Detailed overview for ${tool.name} is currently being updated.`}</p>
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-8">
            <ScrollReveal delay={0.2}>
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="font-bold text-lg mb-4 border-b border-border/50 pb-4">Specifications</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Language</dt>
                    <dd className="font-medium">{tool.language || 'Multi-language'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Framework</dt>
                    <dd className="font-medium">{tool.framework || 'Standalone'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Hosting</dt>
                    <dd className="font-medium">
                      {[tool.cloudHosted && 'Cloud', tool.selfHosted && 'Self-Hosted'].filter(Boolean).join(' / ') || 'Unknown'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pricing</dt>
                    <dd className="font-medium">{tool.pricing || 'Free'}</dd>
                  </div>
                </dl>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

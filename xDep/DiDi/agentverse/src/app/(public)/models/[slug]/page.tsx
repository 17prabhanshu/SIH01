import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Database } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await db.model.findUnique({ where: { slug } });
  return { title: model ? `${model.name} | Agentverse` : 'Model Not Found' };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const model = await db.model.findUnique({ where: { slug } });

  if (!model) return notFound();

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-indigo-500/10 via-indigo-500/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="w-full h-[30vh] sm:h-[40vh] relative overflow-hidden bg-muted border-b border-border">
        <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-32 relative z-10">
        <ScrollReveal>
          <Link href="/models" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
            <ArrowLeft className="w-4 h-4" /> Back to Models
          </Link>

          <div className="bg-card/80 backdrop-blur-xl border border-border p-8 md:p-12 rounded-[3rem] shadow-2xl mb-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-3xl overflow-hidden bg-background border border-border shadow-inner p-4 flex items-center justify-center">
              <span className="font-heading font-bold text-5xl text-indigo-500">{model.name.charAt(0)}</span>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    {model.provider}
                  </span>
                  <span className="px-3 py-1 bg-muted text-foreground border border-border rounded-full text-xs font-bold uppercase tracking-wider">
                    {model.family}
                  </span>
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight">{model.name}</h1>
                <p className="text-xl text-muted-foreground mt-4 leading-relaxed max-w-2xl">
                  {model.modality} foundation model optimized for {model.agentSuitability}.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                {model.docsUrl && (
                  <a href={model.docsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-600 transition-colors">
                    <ExternalLink className="w-4 h-4" /> API Documentation
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
                <Database className="text-indigo-500" /> Capabilities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Reasoning', val: model.reasoning },
                  { name: 'Tool Calling', val: model.toolCalling },
                  { name: 'Structured Outputs', val: model.structuredOutputs },
                  { name: 'Vision', val: model.vision },
                  { name: 'Audio', val: model.audio },
                  { name: 'Coding', val: model.coding },
                ].map(cap => cap.val && (
                  <div key={cap.name} className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-medium text-sm">{cap.name}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-8">
            <ScrollReveal delay={0.2}>
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="font-bold text-lg mb-4 border-b border-border/50 pb-4">Specifications</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Context Window</dt>
                    <dd className="font-medium">{(model.contextWindow || 0).toLocaleString()} tokens</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Input Pricing</dt>
                    <dd className="font-medium">{model.pricingInput} / 1M tokens</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Output Pricing</dt>
                    <dd className="font-medium">{model.pricingOutput} / 1M tokens</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deployment</dt>
                    <dd className="font-medium">{model.deploymentType}</dd>
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

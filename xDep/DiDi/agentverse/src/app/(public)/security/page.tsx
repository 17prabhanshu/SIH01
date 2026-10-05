import { db } from "@/lib/db";
import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: 'Security Intelligence | Agentverse' };

export default async function SecurityPage() {
  const alerts = await db.securityAlert.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-destructive/20 via-destructive/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-orange-500">Intelligence</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Stay ahead of vulnerabilities, jailbreaks, and prompt injection vectors in the agentic ecosystem.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {alerts.map((alert: any, i: number) => (
            <ScrollReveal key={alert.id} delay={i * 0.1}>
              <Link href={`/security/${alert.slug}`}>
                <TiltCard className="h-full">
                  <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-destructive/50 transition-colors overflow-hidden group">
                    <div className="w-full h-32 relative overflow-hidden bg-muted border-b border-border/50 shrink-0">
                      <img 
                        src={`https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop&sig=${alert.id}`} 
                        alt="Security Art" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-luminosity grayscale"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                    </div>

                    <div className="p-8 pt-4 flex flex-col h-full relative">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center overflow-hidden -mt-12 shadow-lg relative z-10 text-destructive">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'secondary'} className="rounded-full px-3 py-1 font-mono text-xs z-10">
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <h3 className="font-heading text-2xl font-bold mb-3">{alert.title}</h3>
                      <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-6">
                        {alert.summary}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/30">
                        {alert.cveId && (
                          <Badge variant="outline" className="rounded-full text-xs font-mono">{alert.cveId}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(alert.publishedAt).toLocaleDateString()}
                        </span>
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

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const alert = await db.securityAlert.findUnique({ where: { slug } });
  return { title: alert ? `${alert.title} | Security` : 'Alert Not Found' };
}

export default async function SecurityAlertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const alert = await db.securityAlert.findUnique({ where: { slug } });

  if (!alert) return notFound();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-red-500/10 via-red-500/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <ScrollReveal>
          <Link href="/security" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Security Feed
          </Link>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wider ${getSeverityColor(alert.severity)}`}>
                {alert.severity} SEVERITY
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {new Date(alert.publishedAt || alert.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {alert.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed bg-muted/30 p-6 rounded-2xl border border-border">
              {alert.summary}
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-12">
          <ScrollReveal delay={0.1}>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Technical Details
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed bg-card border border-border p-8 rounded-3xl">
              {(alert.technicalDetails || "").split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h2 className="font-heading text-2xl font-bold mb-4">Mitigation</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed bg-card border border-border p-8 rounded-3xl">
              {(alert.mitigation || "").split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-6 rounded-2xl">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Affected Systems</h3>
                <p className="font-mono text-sm">{alert.affectedSystems}</p>
              </div>
              <div className="bg-muted p-6 rounded-2xl">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Affected Versions</h3>
                <p className="font-mono text-sm">{alert.affectedVersions}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

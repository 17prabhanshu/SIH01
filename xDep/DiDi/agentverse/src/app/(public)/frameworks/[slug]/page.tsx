import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function FrameworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const framework = await db.framework.findUnique({ where: { slug } });

  if (!framework) return notFound();

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-blue-500/10 via-blue-500/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 max-w-4xl">
        <ScrollReveal>
          <Link href="/frameworks" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Frameworks
          </Link>
          
          <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-bold mb-4">{framework.name}</h1>
            <p className="text-xl text-muted-foreground mb-8">{framework.description}</p>
            
            <div className="flex gap-4">
              {framework.officialUrl && (
                <a href={framework.officialUrl} target="_blank" rel="noreferrer" className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:opacity-90">
                  <ExternalLink className="w-4 h-4" /> Official Site
                </a>
              )}
              {framework.githubUrl && (
                <a href={framework.githubUrl} target="_blank" rel="noreferrer" className="bg-muted text-foreground border border-border px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-muted/80">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

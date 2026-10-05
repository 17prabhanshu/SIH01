import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function MCPServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await db.mCPServer.findUnique({ where: { slug } });

  if (!server) return notFound();

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-amber-500/10 via-amber-500/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 max-w-4xl">
        <ScrollReveal>
          <Link href="/mcp-servers" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to MCP Servers
          </Link>
          
          <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-bold mb-4">{server.name}</h1>
            <p className="text-xl text-muted-foreground mb-8">{server.description}</p>
            
            <div className="flex gap-4">
              {server.githubUrl && (
                <a href={server.githubUrl} target="_blank" rel="noreferrer" className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:opacity-90">
                  <ExternalLink className="w-4 h-4" /> View Source
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

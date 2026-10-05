import { db } from "@/lib/db";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TiltCard } from "@/components/animations/tilt-card";
import Link from "next/link";
import { Server } from "lucide-react";

export const metadata = { title: 'MCP Servers | Agentverse' };

export default async function MCPServersPage() {
  const servers = await db.mCPServer.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-amber-500/20 via-orange-500/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-24">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              MCP <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Servers</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Model Context Protocol (MCP) servers that connect your autonomous agents to real-world data and APIs securely.
            </p>
          </div>
        </ScrollReveal>

        {servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servers.map((server, i) => (
              <ScrollReveal key={server.id} delay={i * 0.1}>
                <TiltCard className="h-full">
                  <Link href={`/mcp-servers/${server.slug}`} className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-amber-500/50 transition-colors overflow-hidden group">
                    <div className="w-full h-32 relative overflow-hidden bg-muted border-b border-border/50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
                      <Server className="w-12 h-12 text-amber-500 relative z-10 opacity-50" />
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                          {server.category || 'Connector'}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl font-bold mb-3">{server.name}</h3>
                      <p className="text-muted-foreground leading-relaxed flex-1">
                        {server.description}
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal delay={0.2}>
            <div className="w-full p-12 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
              <Server className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-heading text-2xl font-bold mb-2">No MCP Servers Listed</h3>
              <p className="text-muted-foreground">The MCP directory is currently being populated with official connectors.</p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

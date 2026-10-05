import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";

export const metadata = { title: 'Guides & Tutorials | Agentverse' };

const GUIDES = [
  {
    title: "Building your first AI Agent",
    description: "A step-by-step tutorial to constructing a basic reasoning loop with LangChain.",
    href: "/news/building-your-first-ai-agent",
    img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Mastering MCP Servers",
    description: "Connect your autonomous agents to real-world databases and APIs.",
    href: "/news/mastering-mcp-servers",
    img: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop"
  }
];

export default function GuidesPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-24">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Guides</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Learn how to architect, secure, and deploy agentic workflows with our comprehensive tutorials.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {GUIDES.map((guide, i) => (
            <ScrollReveal key={guide.title} delay={i * 0.1}>
              <Link href={guide.href}>
                <TiltCard className="h-full">
                  <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-primary/50 transition-colors overflow-hidden group">
                    <div className="w-full h-64 relative overflow-hidden bg-muted border-b border-border/50">
                      <img 
                        src={guide.img} 
                        alt={guide.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                    </div>
                    
                    <div className="p-8">
                      <h3 className="font-heading text-3xl font-bold mb-4">{guide.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {guide.description}
                      </p>
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

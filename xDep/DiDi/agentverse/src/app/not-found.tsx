import Link from "next/link";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto px-4 text-center z-10">
        <ScrollReveal>
          <div className="font-heading font-extrabold text-[15rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/10 select-none">
            404
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 mt-8">
            Lost in the <span className="text-primary">Agentverse</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            The intelligent agent or page you are looking for has been decommissioned, moved, or never existed in this timeline.
          </p>
          
          <div className="flex items-center justify-center gap-6">
            <Link 
              href="/" 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Return Home
            </Link>
            <Link 
              href="/agents" 
              className="bg-card text-card-foreground border border-border px-8 py-4 rounded-full font-bold text-lg hover:border-primary/50 transition-colors"
            >
              Explore Agents
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Aesthetic abstract art graphic in background */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-20 pointer-events-none -z-20 mix-blend-overlay">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" alt="Abstract 404" className="w-full h-full object-cover rounded-full " />
      </div>
    </div>
  );
}

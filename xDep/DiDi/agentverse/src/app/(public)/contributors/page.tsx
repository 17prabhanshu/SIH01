import { db } from "@/lib/db";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TiltCard } from "@/components/animations/tilt-card";
import Link from "next/link";
import { Users } from "lucide-react";

export const metadata = { title: 'Contributors | Agentverse' };

export default async function ContributorsPage() {
  const contributors = await db.contributorProfile.findMany({
    where: { approved: true },
    orderBy: { displayName: 'asc' },
  });

  return (
    <div className="relative min-h-screen pb-24">
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-24">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Contributors</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Meet the researchers, engineers, and writers who make Agentverse the premier directory for autonomous AI.
            </p>
          </div>
        </ScrollReveal>

        {contributors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contributors.map((contributor, i) => (
              <ScrollReveal key={contributor.id} delay={i * 0.1}>
                <TiltCard className="h-full">
                  <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-6 text-center hover:border-primary/50 transition-colors">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-full overflow-hidden border-2 border-border mb-4">
                      {contributor.avatar ? (
                        <img src={contributor.avatar} alt={contributor.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-heading font-bold text-2xl text-primary">
                          {contributor.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-lg font-bold">{contributor.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{contributor.expertise}</p>
                    <p className="text-xs text-foreground/80 line-clamp-3">{contributor.bio}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal delay={0.2}>
            <div className="w-full p-12 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-heading text-2xl font-bold mb-2">Become a Contributor</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Join our community of AI researchers and developers by submitting your first guest post or tool.
              </p>
              <Link href="/submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold">
                Submit Content
              </Link>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

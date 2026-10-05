import { db } from "@/lib/db";
import { TiltCard } from "@/components/animations/tilt-card";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: 'Editorial & News | Agentverse' };

export default async function NewsPage() {
  const articles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: true, category: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10 dark:bg-emerald-900/20" />
      <div className="absolute bottom-0 left-1/4 w-[60vw] h-[60vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                Editorial & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">News</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Stay updated with the latest in the agentic internet, guest posts, and deep dives into AI tooling.
              </p>
            </div>
            <Link href="/submit" className="shrink-0 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
              Submit Guest Post
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any, i: number) => (
            <ScrollReveal key={article.id} delay={i * 0.1}>
              <Link href={`/news/${article.slug}`}>
                <TiltCard className="h-full">
                  <div className="p-6 h-full flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] hover:border-primary/50 transition-colors group">
                    <div className="w-full h-56 bg-muted rounded-[1.5rem] mb-6 overflow-hidden relative border border-border/50">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <img src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop`} alt="Editorial Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {article.category && (
                          <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                            {article.category.name}
                          </Badge>
                        )}
                        <Badge className="backdrop-blur-md bg-primary/90 text-primary-foreground">
                          {article.contentType}
                        </Badge>
                      </div>
                    </div>
                    
                    <h3 className="font-heading text-2xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                    <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-6">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30 text-xs text-muted-foreground font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden">
                          {article.author?.avatar && <img src={article.author.avatar} alt={article.author.name} className="w-full h-full object-cover" />}
                        </div>
                        <span>{article.author?.name || 'Industry Analyst'}</span>
                      </div>
                      <span>{article.publishedAt ? formatDate(article.publishedAt) : ''}</span>
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

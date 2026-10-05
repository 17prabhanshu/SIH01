import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = q.trim();

    // Run parallel searches across our core models using Prisma
    const [articles, agents, tools, models] = await Promise.all([
      db.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: searchTerm } },
            { body: { contains: searchTerm } },
            { excerpt: { contains: searchTerm } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, excerpt: true, contentType: true },
      }),
      db.agent.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 3,
        select: { id: true, name: true, slug: true, description: true },
      }),
      db.tool.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 3,
        select: { id: true, name: true, slug: true, description: true },
      }),
      db.model.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: searchTerm } },
            { provider: { contains: searchTerm } },
          ],
        },
        take: 3,
        select: { id: true, name: true, slug: true, provider: true },
      }),
    ]);

    // Format all results into the universal SearchResult format expected by the Command Palette
    const results = [
      ...articles.map((a: any) => ({
        id: `article-${a.id}`,
        title: a.title,
        type: a.contentType?.toLowerCase() || 'article', // news, guide, etc.
        url: `/${a.contentType?.toLowerCase() === 'news' ? 'news' : 'guides'}/${a.slug}`,
        description: a.excerpt?.substring(0, 80) + '...',
      })),
      ...agents.map((a: any) => ({
        id: `agent-${a.id}`,
        title: a.name,
        type: 'agent',
        url: `/agents/${a.slug}`,
        description: a.description?.substring(0, 80) + '...',
      })),
      ...tools.map((t: any) => ({
        id: `tool-${t.id}`,
        title: t.name,
        type: 'tool',
        url: `/tools/${t.slug}`,
        description: t.description?.substring(0, 80) + '...',
      })),
      ...models.map((m: any) => ({
        id: `model-${m.id}`,
        title: m.name,
        type: 'model',
        url: `/models/${m.slug}`,
        description: `Model provided by ${m.provider}`,
      }))
    ];

    // Sort by relevance (basic: items where title starts with query go first)
    results.sort((a, b) => {
      const aStartsWith = a.title.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWith = b.title.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });

    return NextResponse.json(results.slice(0, 8)); // Return top 8 results
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Search Error" }, { status: 500 });
  }
}

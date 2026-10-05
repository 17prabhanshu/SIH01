import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: 'SEO Backend | Admin' };

export default async function AdminArticlesPage() {
  await requireAuth();
  const articles = await db.article.findMany({
    include: { author: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-heading text-4xl font-bold mb-2">SEO & Content Backend</h1>
          <p className="text-muted-foreground">Manage guest posts, SEO metadata, and editorial content.</p>
        </div>
        <Link href="/admin/articles/new" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold">
          + New Article
        </Link>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Title</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Section</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Author</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Status</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {articles.map((article: any) => {
                return (
                  <tr key={article.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold line-clamp-1">{article.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{article.slug}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline" className="text-[10px] uppercase bg-background">
                          {article.contentType}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">
                          {article.category?.name || "Uncategorized"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">{article.author?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <Badge variant={article.status === 'PUBLISHED' ? 'default' : article.status === 'SUBMITTED' ? 'destructive' : 'secondary'} className="rounded-full">
                        {article.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/articles/${article.id}/edit`} className="text-sm font-bold text-primary hover:underline">
                        Edit / Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
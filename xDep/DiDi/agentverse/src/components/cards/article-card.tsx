import Image from 'next/image';
import Link from 'next/link';

interface ArticleCardProps {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    categoryName: string;
    authorName: string;
    publishedAt: string;
    readingTime: number;
    featuredImage?: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={"/news/" + article.slug} className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {article.featuredImage ? (
          <Image src={article.featuredImage} alt={article.title} fill className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        )}
        <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
          {article.categoryName}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="font-medium">{article.authorName}</div>
          <div>{new Date(article.publishedAt).toLocaleDateString()} • {article.readingTime} min read</div>
        </div>
      </div>
    </Link>
  );
}

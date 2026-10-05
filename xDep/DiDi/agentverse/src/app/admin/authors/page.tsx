import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function AuthorsAdminPage() {
  const data = await db.author.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }
  ];

  return (
    <AdminDataTable
      title="Authors"
      description="Editorial authors"
      data={data}
      columns={columns}
      createUrl="/admin/authors/new"
      modelName="author"
      entitySlug="authors"
    />
  );
}

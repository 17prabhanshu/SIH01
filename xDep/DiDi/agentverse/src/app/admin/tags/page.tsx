import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function TagsAdminPage() {
  const data = await db.tag.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }
  ];

  return (
    <AdminDataTable
      title="Tags"
      description="Manage topic tags"
      data={data}
      columns={columns}
      createUrl="/admin/tags/new"
      modelName="tag"
      entitySlug="tags"
    />
  );
}

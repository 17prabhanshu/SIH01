import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function CategoriesAdminPage() {
  const data = await db.category.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }, { key: 'contentType', label: 'Content Type' }
  ];

  return (
    <AdminDataTable
      title="Categories"
      description="Manage content taxonomy"
      data={data}
      columns={columns}
      createUrl="/admin/categories/new"
      modelName="category"
      entitySlug="categories"
    />
  );
}

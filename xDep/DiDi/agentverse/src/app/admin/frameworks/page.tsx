import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function FrameworksAdminPage() {
  const data = await db.framework.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  
  const flattenedData = data.map((d: any) => ({
    ...d,
    categoryName: d.category?.name || d.category || "Uncategorized" // Handle relational object or string
  }));

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'language', label: 'Language' }, { key: 'status', label: 'Status' }
  ];

  return (
    <AdminDataTable
      title="Frameworks"
      description="Agentic Frameworks"
      data={flattenedData}
      columns={columns.concat({ key: 'categoryName', label: 'Section/Category' })}
      createUrl="/admin/frameworks/new"
      modelName="framework"
      entitySlug="frameworks"
    />
  );
}

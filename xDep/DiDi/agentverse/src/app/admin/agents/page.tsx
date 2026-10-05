import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function AgentsAdminPage() {
  const data = await db.agent.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  
  const flattenedData = data.map((d: any) => ({
    ...d,
    categoryName: d.category?.name || d.category || "Uncategorized" // Handle relational object or string
  }));

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'slug', label: 'Slug' }, { key: 'status', label: 'Status' }
  ];

  return (
    <AdminDataTable
      title="Agents"
      description="AI Agents Directory"
      data={flattenedData}
      columns={columns.concat({ key: 'categoryName', label: 'Section/Category' })}
      createUrl="/admin/agents/new"
      modelName="agent"
      entitySlug="agents"
    />
  );
}

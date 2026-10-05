import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function ModelsAdminPage() {
  const data = await db.model.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'provider', label: 'Provider' }, { key: 'status', label: 'Status' }
  ];

  return (
    <AdminDataTable
      title="Models"
      description="AI Models Directory"
      data={data}
      columns={columns}
      createUrl="/admin/models/new"
      modelName="model"
      entitySlug="models"
    />
  );
}

import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function AuditAdminPage() {
  const data = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'action', label: 'Action' }, { key: 'entityType', label: 'Entity Type' }, { key: 'createdAt', label: 'Created At' }
  ];

  return (
    <AdminDataTable
      title="Audit Logs"
      description="System activity"
      data={data}
      columns={columns}
      createUrl="/admin/audit/new"
      modelName="auditLog"
      entitySlug="audit"
    />
  );
}

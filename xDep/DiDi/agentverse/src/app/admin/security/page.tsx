import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function SecurityAdminPage() {
  const data = await db.securityAlert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'title', label: 'Title' }, { key: 'severity', label: 'Severity' }, { key: 'status', label: 'Status' }
  ];

  return (
    <AdminDataTable
      title="Security Alerts"
      description="AI Vulnerabilities"
      data={data}
      columns={columns}
      createUrl="/admin/security/new"
      modelName="securityAlert"
      entitySlug="security"
    />
  );
}

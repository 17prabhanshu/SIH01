import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function ContributorsAdminPage() {
  const data = await db.contributorProfile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'displayName', label: 'Display Name' }, { key: 'approved', label: 'Approved' }
  ];

  return (
    <AdminDataTable
      title="Contributors"
      description="Community builders"
      data={data}
      columns={columns}
      createUrl="/admin/contributors/new"
      modelName="contributorProfile"
      entitySlug="contributors"
    />
  );
}

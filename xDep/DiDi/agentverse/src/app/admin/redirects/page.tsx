import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function RedirectsAdminPage() {
  const data = await db.redirect.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'source', label: 'Source' }, { key: 'destination', label: 'Destination' }, { key: 'statusCode', label: 'Status Code' }
  ];

  return (
    <AdminDataTable
      title="Redirects"
      description="URL forwarding"
      data={data}
      columns={columns}
      createUrl="/admin/redirects/new"
      modelName="redirect"
      entitySlug="redirects"
    />
  );
}

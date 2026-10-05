import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function LinksAdminPage() {
  const data = await db.internalLink.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'anchorText', label: 'Anchor Text' }, { key: 'targetEntityType', label: 'Target Entity Type' }, { key: 'targetEntityId', label: 'Target Entity Id' }
  ];

  return (
    <AdminDataTable
      title="Internal Links"
      description="Auto-linked entities"
      data={data}
      columns={columns}
      createUrl="/admin/links/new"
      modelName="internalLink"
      entitySlug="links"
    />
  );
}

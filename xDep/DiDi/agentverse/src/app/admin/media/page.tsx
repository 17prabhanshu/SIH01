import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function MediaAdminPage() {
  const data = await db.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'filename', label: 'Filename' }, { key: 'mimeType', label: 'Mime Type' }, { key: 'size', label: 'Size' }
  ];

  return (
    <AdminDataTable
      title="Media Library"
      description="Uploaded assets"
      data={data}
      columns={columns}
      createUrl="/admin/media/new"
      modelName="mediaAsset"
      entitySlug="media"
    />
  );
}

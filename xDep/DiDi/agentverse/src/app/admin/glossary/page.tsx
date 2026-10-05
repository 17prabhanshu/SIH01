import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function GlossaryAdminPage() {
  const data = await db.glossaryTerm.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'term', label: 'Term' }, { key: 'slug', label: 'Slug' }
  ];

  return (
    <AdminDataTable
      title="Glossary Terms"
      description="AI Dictionary"
      data={data}
      columns={columns}
      createUrl="/admin/glossary/new"
      modelName="glossaryTerm"
      entitySlug="glossary"
    />
  );
}

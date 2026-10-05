import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function McpAdminPage() {
  const data = await db.mCPServer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  
  const flattenedData = data.map((d: any) => ({
    ...d,
    categoryName: d.category?.name || d.category || "Uncategorized" // Handle relational object or string
  }));

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'provider', label: 'Provider' }, { key: 'status', label: 'Status' }
  ];

  return (
    <AdminDataTable
      title="MCP Servers"
      description="Model Context Protocol Servers"
      data={flattenedData}
      columns={columns.concat({ key: 'categoryName', label: 'Section/Category' })}
      createUrl="/admin/mcp/new"
      modelName="mCPServer"
      entitySlug="mcp"
    />
  );
}

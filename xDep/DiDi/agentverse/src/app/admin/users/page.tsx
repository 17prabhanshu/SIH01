import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export default async function UsersAdminPage() {
  const data = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  }).catch(() => []); // Fallback for DB errors

  const columns = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }
  ];

  return (
    <AdminDataTable
      title="Users"
      description="Platform accounts"
      data={data}
      columns={columns}
      createUrl="/admin/users/new"
      modelName="user"
      entitySlug="users"
    />
  );
}

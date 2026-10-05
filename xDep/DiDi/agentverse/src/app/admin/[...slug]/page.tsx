import { requireAuth } from "@/lib/session";
import AdminNotFound from "../not-found";
import { UniversalForm } from "@/components/admin/universal-form";

export default async function AdminCatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  await requireAuth();
  const slug = (await params).slug;

  const isNew = slug.length === 2 && slug[1] === "new";
  const isEdit = slug.length === 3 && slug[2] === "edit";

  if (isNew || isEdit) {
    const entitySlug = slug[0];
    const id = isEdit ? slug[1] : null;
    return <UniversalForm entitySlug={entitySlug} recordId={id} />;
  }

  // Simply render the Admin-specific "Not Found / Under Construction" page
  // This physically traps the user inside the Admin Layout!
  return <AdminNotFound />;
}

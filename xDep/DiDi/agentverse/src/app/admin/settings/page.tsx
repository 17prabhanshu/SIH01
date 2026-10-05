import { User, Mail, Shield, Key, Smartphone, Globe } from "lucide-react";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary font-medium rounded-xl transition-colors">
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium rounded-xl transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium rounded-xl transition-colors">
            <Globe className="w-4 h-4" /> Preferences
          </button>
        </div>

        <div className="md:col-span-3 space-y-8">
          <SettingsForm user={user} />
        </div>
      </div>
    </div>
  );
}

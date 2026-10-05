"use client";

import { useState, useRef } from "react";
import { Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsForm({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formPayload,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || data.error || "Upload failed");
      
      setFormData(prev => ({ ...prev, avatar: data.url }));
      alert("Avatar uploaded successfully! Don't forget to save changes.");
    } catch (err: any) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/crud', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'user',
          id: user.id,
          data: formData
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update profile");
      
      alert("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Personal Information</h2>
      
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background shadow-lg overflow-hidden relative group">
          {formData.avatar ? (
             <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             <span className="uppercase">{formData.name ? formData.name.substring(0, 2) : "AD"}</span>
          )}
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
            <span className="text-white text-xs font-bold">CHANGE</span>
          </div>
        </div>
        <div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {uploading ? "Uploading..." : "Change Avatar"}
          </button>
          <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 5MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">Display Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} required className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="email" value={formData.email} onChange={e => setFormData(prev => ({...prev, email: e.target.value}))} required className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">Bio</label>
          <textarea rows={4} value={formData.bio} onChange={e => setFormData(prev => ({...prev, bio: e.target.value}))} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="Write a short bio about yourself..." />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => router.refresh()} className="px-6 py-2.5 rounded-xl font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || uploading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, UploadCloud, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

// Custom Image Uploader Component
function ImageUploader({ value, onChange }: { value: string, onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || "Upload failed");
      }
      if (data.url) onChange(data.url);
    } catch (err: any) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-1 flex items-center gap-4">
      {value && (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted/50 flex-shrink-0">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer text-center group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
        ) : (
          <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
        )}
        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {uploading ? "Uploading..." : "Click to upload image"}
        </p>
      </div>
    </div>
  );
}

const SLUG_TO_MODEL: Record<string, string> = {
  articles: "article",
  categories: "category",
  tags: "tag",
  agents: "agent",
  tools: "tool",
  models: "model",
  frameworks: "framework",
  mcp: "mCPServer",
  companies: "company",
  security: "securityAlert",
  glossary: "glossaryTerm",
  contributors: "contributorProfile",
  authors: "author",
  media: "mediaAsset",
  redirects: "redirect",
  links: "internalLink",
  users: "user",
  audit: "auditLog",
  reviews: "review",
  comparisons: "comparison",
  subscribers: "newsletterSubscriber",
  contacts: "contactMessage",
};

export function UniversalForm({ entitySlug, recordId }: { entitySlug: string; recordId: string | null }) {
  const router = useRouter();
  const [schema, setSchema] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = SLUG_TO_MODEL[entitySlug];

  useEffect(() => {
    if (!model) {
      setError("Unknown entity type");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const schemaRes = await fetch(`/api/admin/crud?action=schema&model=${model}`);
        if (!schemaRes.ok) throw new Error("Failed to load schema");
        const { schema: modelSchema } = await schemaRes.json();
        setSchema(modelSchema);

        if (recordId) {
          const dataRes = await fetch(`/api/admin/crud?model=${model}&id=${recordId}`);
          if (!dataRes.ok) throw new Error("Failed to load record");
          const { data } = await dataRes.json();
          setFormData(data || {});
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [model, recordId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Clean data according to schema
    const cleanedData = { ...formData };
    
    // Auto-generate slug if a title/name exists but slug is empty
    const slugSource = cleanedData.title || cleanedData.name || cleanedData.term;
    if (slugSource && !cleanedData.slug) {
      cleanedData.slug = String(slugSource).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    schema.forEach(field => {
      // Remove read-only or unsupported fields
      if (['id', 'createdAt', 'updatedAt'].includes(field.name)) {
        delete cleanedData[field.name];
        return;
      }
      
      // Auto-cast types based on schema definition
      if (cleanedData[field.name] !== undefined) {
        if (cleanedData[field.name] === "") {
          // Delete empty strings for optional fields so Prisma doesn't crash
          delete cleanedData[field.name];
        } else {
          if (field.type === 'Int') {
            cleanedData[field.name] = parseInt(cleanedData[field.name], 10);
          }
          if (field.type === 'Boolean') {
            cleanedData[field.name] = cleanedData[field.name] === true || cleanedData[field.name] === "true";
          }
        }
      }
    });

    try {
      const method = recordId ? 'PUT' : 'POST';
      const payload = { model, data: cleanedData, ...(recordId && { id: recordId }) };

      const res = await fetch('/api/admin/crud', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save");

      router.push(`/admin/${entitySlug}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 max-w-2xl text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6">
          <p className="font-bold">Error loading form</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Link href={`/admin/${entitySlug}`} className="text-primary hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 relative px-4">
      <div className="flex items-center gap-4 mb-10">
        <Link href={`/admin/${entitySlug}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-heading capitalize tracking-tight">
            {recordId ? "Edit" : "New"} {entitySlug.replace(/s$/, '')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Fill in the schema properties to {recordId ? "update the existing" : "create a new"} record.
          </p>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-2xl border border-border/60 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {schema.map(field => {
              if (['id', 'createdAt', 'updatedAt'].includes(field.name)) return null;
              if (field.isId || field.relationName) return null; // skip relations for basic generic form
              
              const isRequired = field.isRequired;
              const formattedLabel = field.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
              const isImageField = field.type === 'String' && (field.name.toLowerCase().includes('image') || field.name.toLowerCase().includes('avatar') || field.name.toLowerCase().includes('logo'));
              
              return (
                <div key={field.name} className={`space-y-2.5 ${field.type === 'String' && field.name.toLowerCase().includes('body') ? 'md:col-span-2' : ''}`}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex gap-1 ml-1">
                    {formattedLabel} {isRequired && <span className="text-destructive">*</span>}
                  </label>
                  
                  {isImageField ? (
                    <ImageUploader 
                      value={formData[field.name] || ""} 
                      onChange={(url) => setFormData({ ...formData, [field.name]: url })} 
                    />
                  ) : field.name.toLowerCase() === 'status' ? (
                    <select
                      value={formData[field.name] || "DRAFT"}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="DRAFT">Draft (Not visible)</option>
                      <option value="PUBLISHED">Published (Live)</option>
                      <option value="ARCHIVED">Archived</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                    </select>
                  ) : field.name.toLowerCase() === 'contenttype' ? (
                    <select
                      value={formData[field.name] || "ARTICLE"}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="ARTICLE">General Article</option>
                      <option value="NEWS">News</option>
                      <option value="GUIDE">Guide</option>
                      <option value="TUTORIAL">Tutorial</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPARISON">Comparison</option>
                      <option value="EXPLAINER">Explainer</option>
                      <option value="RESEARCH">Research</option>
                      <option value="SECURITY_ALERT">Security Alert</option>
                    </select>
                  ) : field.type === 'Boolean' ? (
                    <select
                      value={formData[field.name]?.toString() || "false"}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value === 'true' })}
                      className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : field.type === 'String' && (field.name.toLowerCase().includes('body') || field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('overview')) ? (
                    <textarea
                      rows={6}
                      value={formData[field.name] || ""}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={isRequired}
                      placeholder={`Enter ${formattedLabel.toLowerCase()}...`}
                      className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm resize-y"
                    />
                  ) : (
                    <input
                      type={field.type === 'Int' ? 'number' : 'text'}
                      value={formData[field.name] || ""}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={isRequired}
                      placeholder={`Enter ${formattedLabel.toLowerCase()}...`}
                      className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-8 border-t border-border/50 flex justify-end gap-4 mt-8">
            <Link href={`/admin/${entitySlug}`} className="px-6 py-3.5 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving Changes..." : recordId ? "Update Record" : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

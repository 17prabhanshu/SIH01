import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Get available models from Prisma schema
const models = Prisma.dmmf.datamodel.models;

export async function GET(req: Request) {
  await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']); // Ensure logged in
  
  const { searchParams } = new URL(req.url);
  const model = searchParams.get('model');
  const action = searchParams.get('action'); // e.g. "schema"

  if (action === "schema" && model) {
    const modelSchema = models.find(m => m.name.toLowerCase() === model.toLowerCase());
    if (!modelSchema) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    return NextResponse.json({ schema: modelSchema.fields });
  }

  if (model && searchParams.get('id')) {
    try {
      const record = await (db as any)[model].findUnique({ where: { id: searchParams.get('id') } });
      return NextResponse.json({ data: record });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

// Automated E-E-A-T & Guest Masking Protocol
async function applyMaskingProtocol(model: string, data: any, session: any) {
  const sanitized = { ...data };

  // 0. Auto-generate slug if missing (server-side fallback for API-only calls)
  if (!sanitized.slug) {
    const slugSource = sanitized.title || sanitized.name || sanitized.term;
    if (slugSource) {
      sanitized.slug = String(slugSource).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
    }
  }

  // 1. Auto-Scrub "Guest" terminology from bios and names
  if (sanitized.bio && typeof sanitized.bio === 'string') {
    sanitized.bio = sanitized.bio
      .replace(/guest poster|guest writer|guest author/gi, "Contributing Analyst")
      .replace(/guest post|sponsored post|paid post/gi, "independent research")
      .replace(/freelance/gi, "industry");
  }
  
  if (sanitized.name && typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.replace(/Guest|Sponsor/gi, "Analyst");
  }

  // 2. Auto-Nofollow External Links in Content Bodies
  if (sanitized.body && typeof sanitized.body === 'string') {
    // If it's HTML, force rel="nofollow" on external links
    sanitized.body = sanitized.body.replace(/<a\s+([^>]*href="http[^"]*"[^>]*)>/gi, (match: string, inner: string) => {
      if (inner.includes('tecrese.com') || inner.includes('rel=')) return match;
      return `<a ${inner} rel="nofollow noopener noreferrer">`;
    });
  }

  // 3. Default to highly credible content types and fallback statuses
  if (model.toLowerCase() === 'article') {
    if (!sanitized.contentType) sanitized.contentType = 'RESEARCH';
  }

  // Auto-inject authorId for models that strictly require it but skip it in generic UI
  if (['article', 'review'].includes(model.toLowerCase())) {
    if (!sanitized.authorId) {
      const fallbackAuthor = await (db as any).author.findFirst() || await (db as any).author.create({
        data: { name: "Intelligence Desk", slug: "intelligence-desk", bio: "Agentverse internal research team." }
      });
      sanitized.authorId = fallbackAuthor.id;
    }
  }

  // 4. Default Required Statuses (Draft) to prevent strict validation crashes
  const modelsRequiringStatus = ['article', 'agent', 'tool', 'model', 'framework', 'mcpserver', 'securityalert', 'comparison', 'review'];
  if (modelsRequiringStatus.includes(model.toLowerCase()) && !sanitized.status) {
    sanitized.status = 'DRAFT';
  }

  // 5. Provide strict fallback defaults for model-specific required fields
  if (model.toLowerCase() === 'securityalert' && !sanitized.severity) sanitized.severity = 'INFO';
  if (model.toLowerCase() === 'comparison') {
    if (!sanitized.entityType) sanitized.entityType = 'agent';
    if (!sanitized.entityIds) sanitized.entityIds = '[]';
  }
  if (model.toLowerCase() === 'review') {
    if (!sanitized.entityType) sanitized.entityType = 'agent';
    if (!sanitized.entityId) sanitized.entityId = 'unknown';
  }

  return sanitized;
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR']); // RBAC Protection

    const { model, data } = await req.json();
    if (!model || !data) return NextResponse.json({ error: "Missing model or data" }, { status: 400 });
    
    // SECURITY PATCH: Privilege Escalation Prevention
    const sensitiveModels = ['user', 'session', 'auditLog', 'role'];
    if (sensitiveModels.includes(model.toLowerCase()) && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Only Super Admins can modify system records." }, { status: 403 });
    }

    const sanitizedData = await applyMaskingProtocol(model, data, session);
    const result = await (db as any)[model].create({ data: sanitizedData });
    
    revalidatePath('/', 'layout'); // Force public site cache invalidation
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR']); // RBAC Protection

    const { model, id, data } = await req.json();
    if (!model || !id || !data) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    
    // SECURITY PATCH: Privilege Escalation Prevention
    const sensitiveModels = ['user', 'session', 'auditLog', 'role'];
    if (sensitiveModels.includes(model.toLowerCase()) && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Only Super Admins can modify system records." }, { status: 403 });
    }
    
    const sanitizedData = await applyMaskingProtocol(model, data, session);
    const result = await (db as any)[model].update({ 
      where: { id }, 
      data: sanitizedData 
    });
    
    revalidatePath('/', 'layout'); // Force public site cache invalidation
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole(['SUPER_ADMIN']); // Only Super Admins can delete records

    const { searchParams } = new URL(req.url);
    const model = searchParams.get('model');
    const id = searchParams.get('id');
    
    if (!model || !id) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    await (db as any)[model].delete({ where: { id } });
    
    revalidatePath('/', 'layout'); // Force public site cache invalidation
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Forbidden' ? 403 : 500 });
  }
}

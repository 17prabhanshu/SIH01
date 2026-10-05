import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// Hardcoded for now. In a real scenario, this would query all Agents/Tools/Models from DB.
const KNOWN_ENTITIES = [
  { term: "Devin", url: "/agents/devin", type: "agent" },
  { term: "LangChain", url: "/tools/langchain", type: "tool" },
  { term: "Claude 3.5 Sonnet", url: "/models/claude-3-5-sonnet", type: "model" },
  { term: "AutoGPT", url: "/agents/autogpt", type: "agent" },
  { term: "Llama 3", url: "/models/llama-3", type: "model" },
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']); // SECURITY PATCH: Enforce RBAC
    const p = await params;
    const article = await db.article.findUnique({ where: { id: p.id } });
    
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    let modifiedBody = article.body;
    let modifiedCount = 0;

    // A simple regex replacer that avoids replacing inside already existing <a> tags
    for (const entity of KNOWN_ENTITIES) {
      // Create a regex to match the term (case insensitive, full word), ignoring if it's already inside an <a> tag
      // For simplicity, we just check if it's not preceded by href="
      const regex = new RegExp(`(?<!href=["'])(?<!>)\\b(${entity.term})\\b(?![^<]*>|[^<>]*<\/a>)`, 'gi');
      
      const beforeStr = modifiedBody;
      modifiedBody = modifiedBody.replace(regex, (match) => {
        return `<a href="${entity.url}" class="${entity.type}-link interactive font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">${match}</a>`;
      });

      if (beforeStr !== modifiedBody) {
        modifiedCount++;
      }
    }

    if (modifiedCount > 0) {
      await db.article.update({
        where: { id: p.id },
        data: { body: modifiedBody }
      });
    }

    return NextResponse.json({ success: true, modifiedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

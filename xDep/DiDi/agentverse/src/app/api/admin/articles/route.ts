import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const articles = await db.article.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const article = await db.article.create({
      data: {
        title: body.title,
        slug,
        body: body.body || body.content || "",
        contentType: body.contentType || "ARTICLE",
        status: body.status || "DRAFT",
        authorId: "1" // Stub
      }
    });
    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}
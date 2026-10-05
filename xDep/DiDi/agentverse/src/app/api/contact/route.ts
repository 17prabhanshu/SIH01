import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

// SECURITY PATCH: Rate limiter to prevent bot spam
const rateLimitMap = new Map<string, { count: number; lockUntil: number }>();
const MAX_SUBMISSIONS = 3;
const LOCK_TIME_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const record = rateLimitMap.get(ip);
    
    if (record) {
      if (Date.now() < record.lockUntil) {
        return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429 });
      }
      if (Date.now() > record.lockUntil) rateLimitMap.delete(ip);
    }
    
    const currentRecord = rateLimitMap.get(ip) || { count: 0, lockUntil: 0 };
    currentRecord.count += 1;
    if (currentRecord.count >= MAX_SUBMISSIONS) {
      currentRecord.lockUntil = Date.now() + LOCK_TIME_MS;
    }
    rateLimitMap.set(ip, currentRecord);

    // Support both JSON and FormData
    let name: string | null = null;
    let email: string | null = null;
    let subject: string | null = null;
    let message: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await req.json();
      name = json.name;
      email = json.email;
      subject = json.subject;
      message = json.message;
    } else {
      const body = await req.formData();
      name = body.get('name') as string;
      email = body.get('email') as string;
      subject = body.get('subject') as string;
      message = body.get('message') as string;
    }

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Name, email, and message are required." }, { status: 400 });
    }

    // Persist to the database so Admins can read it in the Inbox
    await db.contactMessage.create({
      data: { name, email, subject: subject || '', message, status: 'UNREAD' }
    });

    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

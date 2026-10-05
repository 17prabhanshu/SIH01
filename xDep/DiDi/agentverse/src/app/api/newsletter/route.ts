import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const rateLimitMap = new Map<string, { count: number; lockUntil: number }>();
const MAX_SUBMISSIONS = 5;
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
    let email: string | null = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await req.json();
      email = json.email;
    } else {
      const body = await req.formData();
      email = body.get('email') as string;
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    // Save to the database
    // Use upsert to prevent unique constraint crashes if they subscribe twice
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: { status: 'ACTIVE', subscribedAt: new Date(), unsubscribedAt: null },
      create: { email, status: 'ACTIVE', subscribedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

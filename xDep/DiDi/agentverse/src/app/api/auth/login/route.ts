import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// ARCHITECTURE UPGRADE: Upstash Redis Rate Limiting vs Local Fallback
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Local fallback memory map
const rateLimitMap = new Map<string, { attempts: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // 1. Check Rate Limit
    if (redis) {
      const attempts = await redis.get<number>(`rl:login:${ip}`) || 0;
      if (attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { success: false, error: { message: `Too many attempts. Account locked.` } },
          { status: 429 }
        );
      }
    } else {
      const record = rateLimitMap.get(ip);
      if (record) {
        if (Date.now() < record.lockUntil) {
          const remainingMinutes = Math.ceil((record.lockUntil - Date.now()) / 60000);
          return NextResponse.json(
            { success: false, error: { message: `Too many attempts. Account locked for ${remainingMinutes} minutes.` } },
            { status: 429 }
          );
        }
        if (Date.now() > record.lockUntil && record.attempts >= MAX_ATTEMPTS) rateLimitMap.delete(ip);
      }
    }

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return recordFailedAttempt(ip);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return recordFailedAttempt(ip);
    
    // Successful login - clear their failure record
    if (redis) await redis.del(`rl:login:${ip}`);
    else rateLimitMap.delete(ip);
    
    await createSession(user.id, user.role);
    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}

async function recordFailedAttempt(ip: string) {
  if (redis) {
    const attempts = await redis.incr(`rl:login:${ip}`);
    if (attempts === 1) await redis.expire(`rl:login:${ip}`, 15 * 60); // 15 min lock
  } else {
    const record = rateLimitMap.get(ip) || { attempts: 0, lockUntil: 0 };
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) record.lockUntil = Date.now() + LOCK_TIME_MS;
    rateLimitMap.set(ip, record);
  }
  return NextResponse.json({ success: false, error: { message: "Invalid credentials" } }, { status: 401 });
}

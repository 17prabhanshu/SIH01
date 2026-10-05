import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Return safe fields
  return NextResponse.json({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    avatar: user.avatar, 
    role: user.role 
  });
}

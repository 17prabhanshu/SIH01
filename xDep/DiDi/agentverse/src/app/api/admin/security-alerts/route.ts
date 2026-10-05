import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const alerts = await db.securityAlert.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(alerts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const alert = await db.securityAlert.create({
      data: {
        title: body.title,
        slug: body.slug,
        severity: body.severity,
        summary: body.summary,
        status: body.status || 'ACTIVE',
      }
    })
    return NextResponse.json(alert)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

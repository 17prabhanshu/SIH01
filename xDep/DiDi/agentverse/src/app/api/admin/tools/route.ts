import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const tools = await db.tool.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tools)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tool = await db.tool.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        status: body.status || 'DRAFT',
      }
    })
    return NextResponse.json(tool)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 })
  }
}

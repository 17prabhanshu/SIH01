import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const agents = await db.agent.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(agents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // auth check would go here
    const agent = await db.agent.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        status: body.status || 'DRAFT',
      }
    })
    return NextResponse.json(agent)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}

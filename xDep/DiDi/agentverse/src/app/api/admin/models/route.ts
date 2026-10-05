import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const models = await db.model.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(models)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const model = await db.model.create({
      data: {
        name: body.name,
        slug: body.slug,
        provider: body.provider,
        status: body.status || 'DRAFT',
      }
    })
    return NextResponse.json(model)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
}

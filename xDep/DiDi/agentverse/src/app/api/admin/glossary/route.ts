import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const terms = await db.glossaryTerm.findMany({
      orderBy: { term: 'asc' }
    })
    return NextResponse.json(terms)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const term = await db.glossaryTerm.create({
      data: {
        term: body.term,
        slug: body.slug,
        definition: body.definition,
      }
    })
    return NextResponse.json(term)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create term' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const redirects = await db.redirect.findMany({
      orderBy: { source: 'asc' }
    })
    return NextResponse.json(redirects)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch redirects' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const redirect = await db.redirect.create({
      data: {
        source: body.source,
        destination: body.destination,
        statusCode: body.statusCode ?? 301,
      }
    })
    return NextResponse.json(redirect)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create redirect' }, { status: 500 })
  }
}

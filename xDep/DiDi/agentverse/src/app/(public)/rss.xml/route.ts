import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })

    const rssItems = articles
      .map((article: any) => {
        const folder = article.contentType === 'GUIDE' ? 'guides' : 'news'
        const url = `${SITE_URL}/${folder}/${article.slug}`
        const date = article.publishedAt 
          ? new Date(article.publishedAt).toUTCString()
          : new Date(article.updatedAt).toUTCString()

        return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description><![CDATA[${article.excerpt || ''}]]></description>
    </item>`
      })
      .join('')

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Agentverse Updates</title>
    <link>${SITE_URL}</link>
    <description>Latest news, guides, and updates from Agentverse.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}

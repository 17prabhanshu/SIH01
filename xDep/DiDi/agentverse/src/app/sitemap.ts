import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/agents', '/tools', '/models', '/guides', '/dictionary', 
    '/news', '/security', '/about', '/privacy', '/terms', '/contact'
  ]

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    const agents = await db.agent.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    })
    agents.forEach((item: any) => {
      sitemapEntries.push({
        url: `${SITE_URL}/agents/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  } catch (error) {}

  try {
    const tools = await db.tool.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    })
    tools.forEach((item: any) => {
      sitemapEntries.push({
        url: `${SITE_URL}/tools/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  } catch (error) {}

  try {
    const models = await db.model.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    })
    models.forEach((item: any) => {
      sitemapEntries.push({
        url: `${SITE_URL}/models/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  } catch (error) {}

  try {
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, contentType: true, updatedAt: true }
    })
    articles.forEach((item: any) => {
      const folder = item.contentType === 'GUIDE' ? 'guides' : 'news'
      sitemapEntries.push({
        url: `${SITE_URL}/${folder}/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  } catch (error) {}

  try {
    const glossary = await db.glossaryTerm.findMany({
      select: { slug: true, updatedAt: true }
    })
    glossary.forEach((item: any) => {
      sitemapEntries.push({
        url: `${SITE_URL}/dictionary/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    })
  } catch (error) {}

  try {
    const security = await db.securityAlert.findMany({
      select: { slug: true, updatedAt: true }
    })
    security.forEach((item: any) => {
      sitemapEntries.push({
        url: `${SITE_URL}/security/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    })
  } catch (error) {}

  try {
    const authors = await db.author.findMany({
      select: { slug: true, updatedAt: true }
    })
    authors.forEach((item: any) => {
      sitemapEntries.push({
        url: `${SITE_URL}/authors/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
      })
    })
  } catch (error) {}

  return sitemapEntries
}

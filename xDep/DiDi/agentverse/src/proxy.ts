import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-in-production'
if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === 'dev-secret-change-in-production')) {
  throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be set in production environment variables.");
}
const SESSION_COOKIE_NAME = 'agentverse_session'

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // Admin Route Protection
  const isProtectedPath = 
    (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) ||
    request.nextUrl.pathname.startsWith('/api/admin');

  if (isProtectedPath) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(AUTH_SECRET)
      await jwtVerify(token, secret)
    } catch (error) {
      // Invalid token
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

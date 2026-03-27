import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'upendoapps.com'

  // Extract subdomain
  const subdomain = hostname.replace(`.${baseDomain}`, '')

  // Skip if main domain, www, or no subdomain
  if (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    hostname === 'localhost:3000' ||
    subdomain === hostname ||
    subdomain === ''
  ) {
    return NextResponse.next()
  }

  // Already rewritten — avoid double rewrite
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith(`/${subdomain}`)) {
    return NextResponse.next()  
  }

  // Rewrite subdomain requests  
  const url = request.nextUrl.clone()
  url.pathname = `/${subdomain}${pathname}`

  // Pass subdomain as header for use in pages
  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant', subdomain)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
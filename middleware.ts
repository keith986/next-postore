import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'upendoapps.com'

  // Extract subdomain
  const subdomain = hostname.replace(`.${baseDomain}`, '')

  // Skip if main domain or no real subdomain
  if (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    subdomain === hostname ||
    subdomain === '' ||
    subdomain === 'www'
  ) {
    return NextResponse.next()   
  }

  const pathname = request.nextUrl.pathname

  // Only rewrite the ROOT path — let all other paths pass through normally
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}`
    return NextResponse.rewrite(url)
  }

  // All other paths (/admin/*, /onboarding, etc.) pass through unchanged
  // but inject the tenant via header so pages know which tenant this is
  const response = NextResponse.next()
  response.headers.set('x-tenant', subdomain)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}  
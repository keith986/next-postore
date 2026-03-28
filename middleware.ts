import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = 'upendoapps.com'
  const mainApp = 'pos.upendoapps.com'

  // If it's the main app domain — pass through normally
  if (hostname === mainApp || hostname === `www.${mainApp}`) {
    return NextResponse.next()
  }

  // Extract subdomain from root domain
  const subdomain = hostname.replace(`.${baseDomain}`, '')

  // Skip if root domain or www or pos
  if (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    subdomain === hostname ||
    subdomain === '' ||
    subdomain === 'www' ||
    subdomain === 'pos'
  ) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}`
    return NextResponse.rewrite(url)
  }

  const response = NextResponse.next()
  response.headers.set('x-tenant', subdomain)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
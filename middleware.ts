import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Get subdomain by removing the base domain
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'upendoapps.com'
  const subdomain = hostname
    .replace(`.${baseDomain}`, '')
    .replace('www.', '')

  // If it's the main domain or www, continue normally
  if (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    subdomain === hostname // no subdomain detected
  ) {
    return NextResponse.next()  
  }

  // It's a subdomain — rewrite to /[subdomain]/...
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  url.pathname = `/${subdomain}${pathname}`
  
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
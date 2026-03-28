import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const baseDomain = 'upendoapps.com'
  const mainApp = 'pos.upendoapps.com'

  if (hostname === mainApp || hostname === `www.${mainApp}`) {
    return NextResponse.next()
  }

  const subdomain = hostname.replace(`.${baseDomain}`, '')

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

  // ── Protect admin/staff routes ──
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    try {
      const checkUrl = `https://${mainApp}/api/internal/subdomain-status?subdomain=${subdomain}`
      const res  = await fetch(checkUrl, { cache: 'no-store' })
      const data = await res.json()

      if (data.status !== 'active') {
        return NextResponse.redirect(`https://${mainApp}/payment`)
      }
    } catch {
      // Silent fail — allow through on error
    }
  }

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
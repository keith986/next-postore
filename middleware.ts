import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/app/_lib/db'

export async function middleware(request: NextRequest) {
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

  // Only protect admin/staff dashboard routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    try {
      const pool = await getPool()

      // Find the admin by subdomain
      const [rows] = await pool.query(
        'SELECT u.id FROM users u WHERE u.domain = ? LIMIT 1',
        [subdomain]
      ) as [{ id: string }[], unknown]

      if (!rows || rows.length === 0) {
        return NextResponse.redirect(new URL('https://pos.upendoapps.com'))
      }

      const adminId = rows[0].id

      // Check subscription
      const [subRows] = await pool.query(
        "SELECT status FROM subscriptions WHERE user_id = ? AND status = 'active' LIMIT 1",
        [adminId]
      ) as [{ status: string }[], unknown]

      if (!subRows || subRows.length === 0) {
        // No active subscription — redirect to payment
        return NextResponse.redirect(new URL('https://pos.upendoapps.com/payment'))
      }
    } catch {
      // On DB error allow through silently
      return NextResponse.next()
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
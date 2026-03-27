import { getPool } from '@/app/_lib/db'

interface Props {
  params: Promise<{ tenant: string }>
}

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params
  const pool = await getPool()

  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, store_name, domain, pos_type FROM users WHERE domain = ? LIMIT 1',
    [tenant]
  ) as [{ id: string; full_name: string; email: string; role: string; store_name: string | null; domain: string; pos_type: string | null }[], unknown]

  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
        <h1>Store not found</h1>
        <p><strong>{tenant}.upendoapps.com</strong> does not exist.</p>
        <a href="https://upendoapps.com">Go to main site</a>
      </div>
    )
  }

  const user = rows[0]

  // Inject user into localStorage then redirect
  const userData = JSON.stringify({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    store_name: user.store_name,
    domain: user.domain,
  })

  const redirectTo = user.pos_type ? '/admin/dashboard' : '/onboarding'

  // Use a client-side script to set localStorage then redirect
  return (
    <html>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          localStorage.setItem('user', ${JSON.stringify(userData)});
          window.location.href = '${redirectTo}';
        `}} />
      </body>
    </html>
  )
}
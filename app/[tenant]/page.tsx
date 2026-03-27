import { redirect } from 'next/navigation'
import { getPool } from '@/app/_lib/db'

interface Props {
  params: Promise<{ tenant: string }>
}

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params
  const pool = await getPool()

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE domain = ? LIMIT 1',
    [tenant]
  ) as [{ id: string; domain: string; pos_type: string | null }[], unknown]

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

  // If pos_type is set, go to dashboard, otherwise onboarding
  if (user.pos_type) {
    redirect('/admin/dashboard')
  } else {
    redirect('/onboarding')
  }
}
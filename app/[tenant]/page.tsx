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
  ) as [{ id: string; domain: string }[], unknown]

  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
        <h1>Store not found</h1>
        <p><strong>{tenant}.upendoapps.com</strong> does not exist.</p>
        <a href="https://upendoapps.com">Go to main site</a>
      </div>
    )     
  }

  redirect('/admin/dashboard');
}
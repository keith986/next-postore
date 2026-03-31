'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function TenantPage() {
  const params = useParams()
  const tenant = params.tenant as string

  useEffect(() => {
    const stored = localStorage.getItem('user')

    if (!stored) {
      window.location.href = 'https://pos.upendoapps.com'
      return
    }

    let user: Record<string, string>
    try {
      user = JSON.parse(stored)
    } catch {
      localStorage.removeItem('user')
      window.location.href = 'https://pos.upendoapps.com'
      return
    }

    // Wrong subdomain for this user
    if (user.domain !== tenant) {
      window.location.href = user.domain
        ? `https://${user.domain}.upendoapps.com`
        : 'https://pos.upendoapps.com'
      return
    }

    // Verify session with server before trusting localStorage
    fetch('/api/auth/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, role: user.role }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem('user')
          window.location.href = 'https://pos.upendoapps.com?unauthorized=true'
          return
        }

        if (data.payment_status !== 'active') {
          localStorage.removeItem('user')
          window.location.href = 'https://pos.upendoapps.com?unpaid=true'
          return
        }

        // All clear — redirect based on role/pos_type
        if (user.role === 'staff') {
          window.location.href = '/staff/dashboard'
          return
        }

        window.location.href = user.pos_type ? '/admin/dashboard' : '/onboarding'
      })
      .catch(() => {
        // Network error — allow through rather than lock out
        window.location.href = user.pos_type ? '/admin/dashboard' : '/onboarding'
      })

  }, [tenant])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: "'DM Sans', sans-serif", gap: 14
    }}>
      <div style={{
        width: 44, height: 44, background: '#141410',
        borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 18, fontWeight: 500
      }}>P</div>
      <div style={{
        width: 20, height: 20,
        border: '2px solid #e2e0d8',
        borderTopColor: '#141410',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: 14, color: '#9a9a8e' }}>Loading your store…</p>
    </div>
  )
}
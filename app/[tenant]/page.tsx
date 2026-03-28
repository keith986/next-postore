'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function TenantPage() {
  const params = useParams()
  const tenant = params.tenant as string

  useEffect(() => {
    const stored = localStorage.getItem('user')

    if (!stored) {
      // No user in localStorage — send to main domain
      window.location.href = 'https://pos.upendoapps.com'
      return
    }

    try {
      const user = JSON.parse(stored)

      // Check if this subdomain belongs to the stored user
      if (user.domain !== tenant) {
        // Wrong subdomain — redirect to their correct one
        if (user.domain) {
          window.location.href = `https://${user.domain}.upendoapps.com`
        } else {
          window.location.href = 'https://pos.upendoapps.com'
        }
        return
      }

      // Correct subdomain — redirect based on pos_type
      if (user.pos_type) {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/onboarding'
      }

    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('read_notifs')
      window.location.href = 'https://pos.upendoapps.com?logout=true'
    }
  }, [tenant])

  // Show loading while redirecting
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'sans-serif', gap: 14
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
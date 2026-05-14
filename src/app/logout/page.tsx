'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'

export default function LogoutPage() {
  const router = useRouter()
  const { logout, isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    logout().finally(() => {
      router.replace('/login')
    })
  }, [isHydrated, logout, router])

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-sm">
        <p className="text-center text-sm text-slate-600">Keluar...</p>
      </div>
    </main>
  )
}
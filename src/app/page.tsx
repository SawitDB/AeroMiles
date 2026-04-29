'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function HomePage() {
  const router = useRouter()
  const { user, isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    router.replace(user ? '/dashboard' : '/login')
  }, [isHydrated, router, user])

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-secondary-900">AeroMiles</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Memuat...</p>
      </div>
    </main>
  )
}

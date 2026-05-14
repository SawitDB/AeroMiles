'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PengaturanProfilPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/profile')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-slate-500">Mengalihkan ke halaman profil...</p>
    </main>
  )
}

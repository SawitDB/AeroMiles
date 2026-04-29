'use client'

import { useRequireAuth } from '@/lib/auth/useRequireAuth'

export default function DashboardPage() {
  const { user, isHydrated } = useRequireAuth()

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-sm">
          <p className="text-center text-sm text-slate-600">Memuat...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
          <h1 className="text-center text-2xl font-semibold text-secondary-900">Selamat Datang, {user.name}!</h1>
          <p className="mt-1 text-center text-sm text-slate-600">NPM: {user.npm}</p>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-secondary to-secondary-300 p-6 text-white">
            <p className="text-center text-sm font-semibold opacity-90">TOTAL SALDO MILES</p>
            <p className="mt-2 text-center text-4xl font-bold">
              {user.miles} <span className="text-base font-semibold">PTS</span>
            </p>
            <p className="mt-2 text-center text-sm">
              Status Keanggotaan: <span className="font-semibold">Blue Tier</span>
            </p>
          </div>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Aktivitas Terakhir</h2>
          <div className="mt-3 flex items-center justify-between border-b border-slate-200 py-3">
            <span className="text-sm font-semibold text-slate-500">Penerbangan CGK-DPS</span>
            <span className="text-sm font-bold text-primary-700">+500 pts</span>
          </div>
        </div>
      </div>
    </main>
  )
}

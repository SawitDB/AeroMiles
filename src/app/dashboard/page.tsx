'use client'

import { useMemo } from 'react'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'

export default function DashboardPage() {
  const { user, isHydrated } = useRequireAuth()

  const tierColor = useMemo(() => {
    const tier = (user?.idTier ?? '').toUpperCase()
    switch (tier) {
      case 'SILV':
        return 'bg-slate-300 text-slate-900'
      case 'GOLD':
        return 'bg-yellow-400 text-slate-900'
      case 'PLAT':
        return 'bg-purple-600 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }, [user])

  if (!isHydrated || !user) return null

  const fullName = user.name || '-'
  const isMember = user.role === 'member'
  const isStaf = user.role === 'staf'

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="col-span-1 rounded-xl bg-white/6 p-4">
          <h2 className="text-lg font-semibold text-white">Profil</h2>
          <div className="mt-3 space-y-2 text-sm text-white/90">
            <div><span className="font-medium">Nama:</span> {fullName}</div>
            <div><span className="font-medium">Email:</span> {user.email}</div>
            <div><span className="font-medium">Kontak:</span> {user.countryCode} {user.mobileNumber}</div>
            <div><span className="font-medium">Kewarganegaraan:</span> {user.kewarganegaraan}</div>
            <div><span className="font-medium">Tanggal Lahir:</span> {user.tanggalLahir}</div>
          </div>
        </section>

        {isMember ? (
          <section className="col-span-2 rounded-xl bg-white/6 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Member Overview</h2>
              <div className={`rounded-md px-3 py-1 text-sm font-semibold ${tierColor}`}>{(user.idTier ?? 'BLUE').toUpperCase()}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Nomor Member</div>
                <div className="mt-1 font-semibold">{user.nomorMember ?? '-'}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Award Miles</div>
                <div className="mt-1 font-semibold">{user.awardMiles ?? 0}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Total Miles</div>
                <div className="mt-1 font-semibold">{user.totalMiles ?? 0}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Tanggal Bergabung</div>
                <div className="mt-1 font-semibold">{user.tanggalBergabung ?? '-'}</div>
              </div>
            </div>
          </section>
        ) : null}

        {isStaf ? (
          <section className="col-span-2 rounded-xl bg-white/6 p-4">
            <h2 className="text-lg font-semibold text-white">Staf Overview</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">ID Staf</div>
                <div className="mt-1 font-semibold">{user.idStaf ?? '-'}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Maskapai</div>
                <div className="mt-1 font-semibold">{user.kodeMaskapai ?? '-'}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Klaim Menunggu</div>
                <div className="mt-1 font-semibold">-</div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

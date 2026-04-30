'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Session = { email: string; role?: string; name?: string; first_mid_name?: string }

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [userRec, setUserRec] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem('aeromiles_session')
    if (!raw) {
      router.replace('/login')
      return
    }
    try {
      const s = JSON.parse(raw) as Session
      setSession(s)

      const usersRaw = window.localStorage.getItem('aeromiles_users')
      const users = usersRaw ? (JSON.parse(usersRaw) as any[]) : []
      const rec = users.find((u) => String(u.email).toLowerCase() === String(s.email).toLowerCase())
      setUserRec(rec ?? null)

      const txRaw = window.localStorage.getItem('aeromiles_transactions')
      const tx = txRaw ? (JSON.parse(txRaw) as any[]) : []
      let filtered = tx
      if (rec?.nomor_member) filtered = tx.filter((t) => t.nomor_member === rec.nomor_member)
      else filtered = tx.filter((t) => String(t.email).toLowerCase() === String(s.email).toLowerCase())
      filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      setTransactions(filtered.slice(0, 5))

      const claimsRaw = window.localStorage.getItem('aeromiles_claims')
      const cls = claimsRaw ? (JSON.parse(claimsRaw) as any[]) : []
      setClaims(cls)
    } catch {
      router.replace('/login')
    }
  }, [router])

  const fullName = useMemo(() => {
    if (!session && !userRec) return ''
    const parts = [userRec?.salutation, userRec?.first_mid_name ?? session?.first_mid_name ?? session?.name, userRec?.last_name]
    return parts.filter(Boolean).join(' ')
  }, [session, userRec])

  const tierColor = useMemo(() => {
    const tier = (userRec?.id_tier ?? '').toString().toUpperCase()
    switch (tier) {
      case 'SILVER':
        return 'bg-slate-300 text-slate-900'
      case 'GOLD':
        return 'bg-yellow-400 text-slate-900'
      case 'PLATINUM':
        return 'bg-purple-600 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }, [userRec])

  const awardMiles = useMemo(() => {
    if (!transactions || transactions.length === 0) return 120
    return transactions.reduce((acc, t) => acc + (t.jumlah > 0 ? t.jumlah : 0), 0)
  }, [transactions])

  const totalMiles = useMemo(() => {
    if (userRec?.miles) return userRec.miles
    if (!transactions || transactions.length === 0) return 5000
    return transactions.reduce((acc, t) => acc + (t.jumlah ?? 0), 0)
  }, [userRec, transactions])

  const claimSummary = useMemo(() => {
    const all = claims || []
    const waiting = all.filter((c) => c.status === 'Menunggu').length
    const approved = all.filter((c) => c.status === 'Disetujui').length
    const rejected = all.filter((c) => c.status === 'Ditolak').length
    return { waiting, approved, rejected }
  }, [claims])

  if (!session) return null

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="col-span-1 rounded-xl bg-white/6 p-4">
          <h2 className="text-lg font-semibold text-white">Profil</h2>
          <div className="mt-3 space-y-2 text-sm text-white/90">
            <div><span className="font-medium">Nama:</span> {fullName || '-'}</div>
            <div><span className="font-medium">Email:</span> {session.email}</div>
            <div><span className="font-medium">Kontak:</span> {(userRec?.country_code ?? '') + ' ' + (userRec?.phone ?? userRec?.mobile_number ?? '')}</div>
            <div><span className="font-medium">Kewarganegaraan:</span> {userRec?.kewarganegaraan ?? '-'}</div>
            <div><span className="font-medium">Tanggal Lahir:</span> {userRec?.tanggal_lahir ?? '-'}</div>
          </div>
        </section>

        {session.role === 'member' ? (
          <section className="col-span-2 rounded-xl bg-white/6 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Member Overview</h2>
              <div className={`rounded-md px-3 py-1 text-sm font-semibold ${tierColor}`}>{(userRec?.id_tier ?? 'BLUE').toUpperCase()}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Nomor Member</div>
                <div className="mt-1 font-semibold">{userRec?.nomor_member ?? '-'}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Award Miles</div>
                <div className="mt-1 font-semibold">{awardMiles}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Total Miles</div>
                <div className="mt-1 font-semibold">{totalMiles}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Tanggal Bergabung</div>
                <div className="mt-1 font-semibold">{userRec?.tanggal_bergabung ?? '-'}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-white">5 Transaksi Miles Terbaru</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/70">
                      <th className="py-2">Tanggal</th>
                      <th className="py-2">Jenis</th>
                      <th className="py-2">Jumlah</th>
                      <th className="py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-3 text-white/70">Tidak ada transaksi.</td>
                      </tr>
                    ) : (
                      transactions.map((t, idx) => (
                        <tr key={idx} className="border-t border-white/6">
                          <td className="py-2 text-white/90">{t.tanggal}</td>
                          <td className="py-2 text-white/90">{t.jenis}</td>
                          <td className={`py-2 font-semibold ${t.jumlah >= 0 ? 'text-green-300' : 'text-rose-300'}`}>{(t.jumlah >= 0 ? '+' : '') + t.jumlah}</td>
                          <td className="py-2 text-white/80">{t.keterangan ?? '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {session.role === 'staf' ? (
          <section className="col-span-2 rounded-xl bg-white/6 p-4">
            <h2 className="text-lg font-semibold text-white">Staf Overview</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">ID Staf</div>
                <div className="mt-1 font-semibold">{userRec?.id_staf ?? '-'}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Maskapai</div>
                <div className="mt-1 font-semibold">{userRec?.kode_maskapai ?? '-'}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Klaim Menunggu (semua staf)</div>
                <div className="mt-1 font-semibold">{claimSummary.waiting}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Klaim Disetujui (Anda)</div>
                <div className="mt-1 font-semibold">{claims.filter((c) => c.handledBy === session.email && c.status === 'Disetujui').length}</div>
              </div>

              <div className="rounded-md bg-white/5 p-3 text-sm text-white">
                <div className="text-xs">Klaim Ditolak (Anda)</div>
                <div className="mt-1 font-semibold">{claims.filter((c) => c.handledBy === session.email && c.status === 'Ditolak').length}</div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

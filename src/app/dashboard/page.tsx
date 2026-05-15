'use client'

import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, isHydrated } = useRequireAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && isHydrated) {
      setLoading(true)
      fetch(`/api/dashboard/stats?email=${user.email}&role=${user.role}`)
        .then((res) => res.json())
        .then((data) => {
          setStats(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Failed to fetch stats', err)
          setLoading(false)
        })
    }
  }, [user, isHydrated])

  if (!isHydrated || !user) return null

  const isStaf = user.role === 'staf'
  const isMember = user.role === 'member'

  return (
    <main className="min-h-screen bg-[#F8F7FA] px-8 py-12 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#1D1D42]">
            Dashboard {isStaf ? 'Staf' : 'Member'}
          </h1>
          <p className="text-gray-500">Selamat datang kembali, {user.name?.split(' ')[0] || 'Aero'}.</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Informasi Pribadi */}
          <section className="lg:col-span-4">
            <div className="h-full rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-[#1D1D42]">Informasi Pribadi</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Nama Lengkap</label>
                  <p className="text-lg font-medium text-[#1D1D42]">{user.name || '-'}</p>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email</label>
                  <p className="font-medium text-[#1D1D42]">{user.email}</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Kontak</label>
                  <p className="font-medium text-[#1D1D42]">{user.countryCode} {user.mobileNumber}</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Kewarganegaraan</label>
                  <p className="font-medium text-[#1D1D42]">{user.kewarganegaraan || '-'}</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Tanggal Lahir</label>
                  <p className="font-medium text-[#1D1D42]">{user.tanggalLahir || '-'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Overview Cards */}
          <section className="space-y-8 lg:col-span-8">
            {/* Top Cards */}
            {isStaf ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">ID Staf</label>
                  <p className="mt-2 text-3xl font-bold text-[#1D1D42]">{user.idStaf || '-'}</p>
                </div>
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Maskapai</label>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{user.kodeMaskapai || '-'}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Award Miles</label>
                  <p className="mt-1 text-2xl font-bold text-primary">{user.awardMiles?.toLocaleString('id-ID') || 0}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Miles</label>
                  <p className="mt-1 text-2xl font-bold text-[#1D1D42]">{user.totalMiles?.toLocaleString('id-ID') || 0}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tier</label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">{user.idTier || 'BLUE'}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">No. Member</label>
                  <p className="mt-1 text-2xl font-bold text-[#1D1D42]">{user.nomorMember || '-'}</p>
                </div>
              </div>
            )}

            {/* Operational Overview Card (STAF) */}
            {isStaf && (
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#1D1D42]">Overview Operasional Klaim</h2>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Menunggu */}
                  <div className="rounded-2xl bg-[#FDFCFE] border border-gray-50 p-6 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-amber-600">Menunggu</span>
                    <p className="my-2 text-4xl font-black text-[#1D1D42]">
                      {loading ? '...' : stats?.summary?.waiting ?? 0}
                    </p>
                    <span className="text-[10px] text-gray-400">Seluruh Staf</span>
                  </div>

                  {/* Disetujui */}
                  <div className="rounded-2xl bg-[#FDFCFE] border border-gray-50 p-6 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600">Disetujui</span>
                    <p className="my-2 text-4xl font-black text-[#1D1D42]">
                      {loading ? '...' : stats?.summary?.approved_by_me ?? 0}
                    </p>
                    <span className="text-[10px] text-gray-400">Oleh Anda</span>
                  </div>

                  {/* Ditolak */}
                  <div className="rounded-2xl bg-[#FDFCFE] border border-gray-50 p-6 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-rose-600">Ditolak</span>
                    <p className="my-2 text-4xl font-black text-[#1D1D42]">
                      {loading ? '...' : stats?.summary?.rejected_by_me ?? 0}
                    </p>
                    <span className="text-[10px] text-gray-400">Oleh Anda</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Transactions (MEMBER) */}
            {isMember && (
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#1D1D42]">5 Transaksi Terakhir</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-400 border-b border-gray-50">
                      <tr>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Tanggal</th>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Jenis</th>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Jumlah</th>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">Memuat data...</td></tr>
                      ) : !stats?.transactions || stats.transactions.length === 0 ? (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada transaksi.</td></tr>
                      ) : (
                        stats.transactions.map((t: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-4 text-gray-600">{new Date(t.timestamp).toLocaleDateString('id-ID')}</td>
                            <td className="py-4 font-medium text-[#1D1D42]">{t.jenis}</td>
                            <td className={`py-4 font-bold ${t.jumlah >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.jumlah >= 0 ? '+' : ''}{t.jumlah.toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 text-gray-500">{t.keterangan}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
'use client'

import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/components/AuthProvider'

type ClaimStatus = 'Menunggu' | 'Disetujui' | 'Ditolak'

type ClaimRequest = {
  id: number
  email_member: string
  maskapai: string
  bandara_asal: string
  bandara_tujuan: string
  tanggal_penerbangan: string
  flight_number: string
  nomor_tiket: string
  kelas_kabin: 'Economy' | 'Business' | 'First'
  pnr: string
  status_penerimaan: ClaimStatus
  timestamp: string
  email_staf?: string | null
}

function formatDate(value: string) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return value
  }
}

function formatDateTime(value: string) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export default function Page() {
  const { user, isHydrated } = useAuth()
  const [claims, setClaims] = useState<ClaimRequest[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Semua' | ClaimStatus>('Semua')
  const [maskapaiFilter, setMaskapaiFilter] = useState('Semua')
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null)
  const [reviewStatus, setReviewStatus] = useState<ClaimStatus>('Disetujui')
  const [reviewError, setReviewError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchClaims = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/claim-review')
      if (!res.ok) throw new Error('Gagal mengambil data klaim')
      const data = await res.json()
      setClaims(data)
    } catch (err: any) {
      console.error(err)
      setReviewError(err.message || 'Gagal memuat klaim dari database.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isHydrated) return
    fetchClaims()
  }, [isHydrated])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return claims.filter((claim) => {
      const matchSearch = !q || [claim.email_member, claim.maskapai, claim.flight_number, claim.nomor_tiket, claim.pnr]
        .some((value) => value?.toLowerCase().includes(q))
      const matchStatus = statusFilter === 'Semua' ? true : claim.status_penerimaan === statusFilter
      const matchMaskapai = maskapaiFilter === 'Semua' ? true : claim.maskapai === maskapaiFilter
      return matchSearch && matchStatus && matchMaskapai
    })
  }, [claims, search, statusFilter, maskapaiFilter])

  const maskapaiOptions = Array.from(new Set(claims.map((claim) => claim.maskapai))).sort()

  if (!isHydrated) {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <p className="text-sm text-white/70">Memuat halaman kelola klaim…</p>
      </main>
    )
  }

  if (!user || user.role !== 'staf') {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <div className="rounded-2xl bg-white/95 p-8 text-center shadow-xl">
          <p className="text-lg font-bold text-red-600">Akses Ditolak</p>
          <p className="mt-2 text-sm text-slate-500">Halaman ini hanya untuk Staf.</p>
        </div>
      </main>
    )
  }

  function openReview(claim: ClaimRequest) {
    setSelectedClaim(claim)
    setReviewStatus(claim.status_penerimaan === 'Menunggu' ? 'Disetujui' : claim.status_penerimaan)
    setReviewError('')
    setSuccessMessage('')
  }

  async function saveReview() {
    if (!selectedClaim || !user) return

    setIsLoading(true)
    setReviewError('')
    setSuccessMessage('')
    try {
      const res = await fetch('/api/claim-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClaim.id,
          status_penerimaan: reviewStatus,
          email_staf: user.email
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan review')

      setSuccessMessage(result.message)
      fetchClaims()
      // Wait a bit so the user can see the success message before closing
      setTimeout(() => {
        if (!reviewError) setSelectedClaim(null)
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setReviewError(err.message || 'Gagal menyimpan review ke database.')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    { label: 'Total Klaim', value: claims.length, accent: 'from-blue-500 to-cyan-500' },
    { label: 'Menunggu', value: claims.filter((claim) => claim.status_penerimaan === 'Menunggu').length, accent: 'from-amber-500 to-orange-500' },
    { label: 'Disetujui', value: claims.filter((claim) => claim.status_penerimaan === 'Disetujui').length, accent: 'from-emerald-500 to-green-500' },
    { label: 'Ditolak', value: claims.filter((claim) => claim.status_penerimaan === 'Ditolak').length, accent: 'from-rose-500 to-red-500' },
  ]

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kelola Klaim</h1>
            <p className="mt-1 text-sm text-white/70">Panel review klaim missing miles untuk staf AeroMiles</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="overflow-hidden rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10">
              <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${stat.accent}`} />
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
              <div className="mt-2 text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 grid gap-3 rounded-2xl bg-white/95 p-4 shadow-lg shadow-slate-950/10 ring-1 ring-slate-200/70 lg:grid-cols-[1.2fr_0.5fr_0.5fr] lg:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari member, maskapai, flight, tiket, atau PNR…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'Semua' | ClaimStatus)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>
          <select
            value={maskapaiFilter}
            onChange={(event) => setMaskapaiFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          >
            <option value="Semua">Semua Maskapai</option>
            {maskapaiOptions.map((maskapai) => (
              <option key={maskapai} value={maskapai}>{maskapai}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-xl shadow-slate-950/10 ring-1 ring-slate-200/70">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-800">Daftar Klaim Missing Miles</h2>
            <p className="mt-1 text-sm text-slate-500">Gunakan panel review untuk mengganti status dan menambahkan catatan staf.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Penerbangan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Penanganan</th>
                  <th className="px-5 py-4">Waktu</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && claims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">Memuat data klaim…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">Belum ada data klaim yang cocok dengan filter.</td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr key={claim.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{claim.email_member}</div>
                        <div className="text-xs text-slate-500">{claim.kelas_kabin}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{claim.maskapai} · {claim.flight_number}</div>
                        <div className="text-xs text-slate-500">{claim.bandara_asal} → {claim.bandara_tujuan} · {formatDate(claim.tanggal_penerbangan)}</div>
                        <div className="text-xs text-slate-500">Tiket {claim.nomor_tiket} · PNR {claim.pnr}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${claim.status_penerimaan === 'Menunggu' ? 'bg-amber-100 text-amber-700' : claim.status_penerimaan === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {claim.status_penerimaan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div>{claim.email_staf ?? '-'}</div>
                        <div className="text-xs text-slate-500">Peninjau klaim</div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{formatDateTime(claim.timestamp)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openReview(claim)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedClaim ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Review Klaim Missing Miles</h3>
                <p className="mt-1 text-sm text-slate-500">Perbarui status klaim sesuai hasil verifikasi staf.</p>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200">✕</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Member</p>
                <p className="mt-2 font-semibold text-slate-800">{selectedClaim.email_member}</p>
                <p className="mt-3 text-sm text-slate-600">{selectedClaim.maskapai} · {selectedClaim.flight_number}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedClaim.bandara_asal} → {selectedClaim.bandara_tujuan}</p>
                <p className="mt-1 text-sm text-slate-600">{formatDate(selectedClaim.tanggal_penerbangan)}</p>
                <p className="mt-1 text-sm text-slate-600">Tiket {selectedClaim.nomor_tiket} · PNR {selectedClaim.pnr}</p>
              </div>

              <div className="space-y-4">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Status Penerimaan</span>
                  <select
                    value={reviewStatus}
                    onChange={(event) => setReviewStatus(event.target.value as ClaimStatus)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </label>
              </div>
            </div>

            {reviewError ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{reviewError}</p> : null}
            {successMessage ? <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setSelectedClaim(null)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">Batal</button>
              <button onClick={saveReview} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700">Simpan Review</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

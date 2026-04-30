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

type ModalMode = 'add' | 'edit' | null

const EMPTY_FORM: {
  maskapai: string
  bandara_asal: string
  bandara_tujuan: string
  tanggal_penerbangan: string
  flight_number: string
  nomor_tiket: string
  kelas_kabin: ClaimRequest['kelas_kabin']
  pnr: string
} = {
  maskapai: '',
  bandara_asal: '',
  bandara_tujuan: '',
  tanggal_penerbangan: '',
  flight_number: '',
  nomor_tiket: '',
  kelas_kabin: 'Economy' as const,
  pnr: '',
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
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<ClaimRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClaimRequest | null>(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch claims from API
  const fetchClaims = async () => {
    if (!user?.email) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/claim-missing-miles?email=${encodeURIComponent(user.email)}`)
      if (!res.ok) throw new Error('Gagal mengambil data klaim')
      const data = await res.json()
      setClaims(data)
    } catch (err) {
      console.error(err)
      setFormError('Gagal memuat klaim dari server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !user?.email) return
    fetchClaims()
  }, [isHydrated, user?.email])

  if (!isHydrated) {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <p className="text-sm text-white/70">Memuat halaman klaim…</p>
      </main>
    )
  }

  if (!user || user.role !== 'member') {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <div className="rounded-2xl bg-white/95 p-8 text-center shadow-xl">
          <p className="text-lg font-bold text-red-600">Akses Ditolak</p>
          <p className="mt-2 text-sm text-slate-500">Halaman ini hanya untuk Member.</p>
        </div>
      </main>
    )
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return claims.filter((claim) => {
      const matchSearch = !q || [claim.maskapai, claim.bandara_asal, claim.bandara_tujuan, claim.flight_number, claim.nomor_tiket, claim.pnr]
        .some((value) => value.toLowerCase().includes(q))
      const matchStatus = statusFilter === 'Semua' ? true : claim.status_penerimaan === statusFilter
      return matchSearch && matchStatus
    })
  }, [claims, search, statusFilter])

  function openAdd() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalMode('add')
  }

  function openEdit(claim: ClaimRequest) {
    setEditTarget(claim)
    setForm({
      maskapai: claim.maskapai,
      bandara_asal: claim.bandara_asal,
      bandara_tujuan: claim.bandara_tujuan,
      tanggal_penerbangan: claim.tanggal_penerbangan,
      flight_number: claim.flight_number,
      nomor_tiket: claim.nomor_tiket,
      kelas_kabin: claim.kelas_kabin,
      pnr: claim.pnr,
    })
    setFormError('')
    setModalMode('edit')
  }

  async function handleSave() {
    if (!form.maskapai || !form.bandara_asal || !form.bandara_tujuan || !form.tanggal_penerbangan || !form.flight_number || !form.nomor_tiket || !form.kelas_kabin || !form.pnr) {
      setFormError('Semua field wajib diisi.')
      return
    }

    if (form.bandara_asal === form.bandara_tujuan) {
      setFormError('Bandara asal dan tujuan tidak boleh sama.')
      return
    }

    setIsLoading(true)
    try {
      const url = modalMode === 'edit' ? '/api/claim-missing-miles' : '/api/claim-missing-miles'
      const method = modalMode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(modalMode === 'edit' && editTarget ? { id: editTarget.id } : {}),
          email_member: user?.email,
          maskapai: form.maskapai,
          bandara_asal: form.bandara_asal,
          bandara_tujuan: form.bandara_tujuan,
          tanggal_penerbangan: form.tanggal_penerbangan,
          flight_number: form.flight_number,
          nomor_tiket: form.nomor_tiket,
          kelas_kabin: form.kelas_kabin,
          pnr: form.pnr,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Gagal menyimpan klaim.')
        return
      }

      setModalMode(null)
      setEditTarget(null)
      await fetchClaims()
    } catch (err) {
      console.error(err)
      setFormError('Gagal menyimpan klaim.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/claim-missing-miles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      })

      if (!res.ok) throw new Error('Gagal menghapus klaim')
      setDeleteTarget(null)
      await fetchClaims()
    } catch (err) {
      console.error(err)
      setFormError('Gagal menghapus klaim.')
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
            <h1 className="text-2xl font-bold text-white">Klaim Miles</h1>
            <p className="mt-1 text-sm text-white/70">Ajukan, lihat, dan klaim missing miles</p>
          </div>
          <button
            onClick={openAdd}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700"
          >
            + Ajukan Klaim Baru
          </button>
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

        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-lg shadow-slate-950/10 ring-1 ring-slate-200/70 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari maskapai, bandara, flight number, nomor tiket, atau PNR…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 lg:max-w-xl"
          />
          <div className="flex flex-wrap items-center gap-2">
            {(['Semua', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${statusFilter === status ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-xl shadow-slate-950/10 ring-1 ring-slate-200/70">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-800">Daftar Klaim Miles</h2>
            <p className="mt-1 text-sm text-slate-500">Semua klaim tampil dengan aksi edit dan hapus untuk data yang masih menunggu.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Maskapai</th>
                  <th className="px-5 py-4">Rute</th>
                  <th className="px-5 py-4">Detail Penerbangan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Waktu</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">Belum ada klaim yang cocok dengan filter.</td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr key={claim.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{claim.maskapai}</div>
                        <div className="text-xs text-slate-500">{claim.kelas_kabin}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{claim.bandara_asal} → {claim.bandara_tujuan}</div>
                        <div className="text-xs text-slate-500">{formatDate(claim.tanggal_penerbangan)}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div>{claim.flight_number}</div>
                        <div className="text-xs text-slate-500">Tiket {claim.nomor_tiket} · PNR {claim.pnr}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${claim.status_penerimaan === 'Menunggu' ? 'bg-amber-100 text-amber-700' : claim.status_penerimaan === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {claim.status_penerimaan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{formatDateTime(claim.timestamp)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(claim)}
                            disabled={claim.status_penerimaan !== 'Menunggu'}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(claim)}
                            disabled={claim.status_penerimaan !== 'Menunggu'}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300"
                          >
                            Hapus
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

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{modalMode === 'add' ? 'Ajukan Klaim Baru' : 'Edit Klaim Miles'}</h3>
                <p className="mt-1 text-sm text-slate-500">Isi data penerbangan dengan format yang sesuai. Klaim baru akan masuk ke status menunggu.</p>
              </div>
              <button onClick={() => setModalMode(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200">✕</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: 'maskapai', label: 'Kode Maskapai' },
                { key: 'bandara_asal', label: 'Bandara Asal' },
                { key: 'bandara_tujuan', label: 'Bandara Tujuan' },
                { key: 'tanggal_penerbangan', label: 'Tanggal Penerbangan', type: 'date' },
                { key: 'flight_number', label: 'Flight Number' },
                { key: 'nomor_tiket', label: 'Nomor Tiket' },
                { key: 'pnr', label: 'PNR' },
              ].map((field) => (
                <label key={field.key} className="space-y-2 text-sm font-medium text-slate-700">
                  <span>{field.label}</span>
                  <input
                    type={field.type ?? 'text'}
                    value={(form as Record<string, string>)[field.key]}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              ))}

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Kelas Kabin</span>
                <select
                  value={form.kelas_kabin}
                  onChange={(event) => setForm((prev) => ({ ...prev, kelas_kabin: event.target.value as typeof form.kelas_kabin }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </label>
            </div>

            {formError ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{formError}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setModalMode(null)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">Batal</button>
              <button onClick={handleSave} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700">Simpan Klaim</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
            <h3 className="text-xl font-bold text-slate-800">Hapus Klaim</h3>
            <p className="mt-2 text-sm text-slate-500">Klaim {deleteTarget.flight_number} akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">Batal</button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">Hapus</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

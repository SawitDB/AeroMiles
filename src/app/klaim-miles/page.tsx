'use client'

import { useEffect, useMemo, useState } from 'react'
import { seedAllData } from '@/lib/seedData'

/* ─── Types ──────────────────────────────────────────────── */
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

const EMPTY_FORM: any = {
  maskapai: '',
  bandara_asal: '',
  bandara_tujuan: '',
  tanggal_penerbangan: '',
  flight_number: '',
  nomor_tiket: '',
  kelas_kabin: 'Economy',
  pnr: '',
}

/* ─── Helpers ─────────────────────────────────────────────── */
function loadClaims(): ClaimRequest[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('aeromiles_claim') || '[]') } catch { return [] }
}
function saveClaims(data: ClaimRequest[]) {
  localStorage.setItem('aeromiles_claim', JSON.stringify(data))
}
function formatDate(value: string) {
  if (!value) return '-'
  try { return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return value }
}
function formatDateTime(value: string) {
  if (!value) return '-'
  try { return new Date(value).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return value }
}

/* ─── Component ──────────────────────────────────────────── */
export default function KlaimMilesPage() {
  const [session, setSession] = useState<{ email: string; role: string } | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [claims, setClaims] = useState<ClaimRequest[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Semua' | ClaimStatus>('Semua')

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<ClaimRequest | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ClaimRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    seedAllData()
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aeromiles_session') : null
    if (raw) {
      try { setSession(JSON.parse(raw)) } catch { setSession(null) }
    }
    setClaims(loadClaims())
    setIsHydrated(true)
  }, [])

  const filtered = useMemo(() => {
    if (!session) return []
    return claims.filter(c => {
      if (c.email_member !== session.email) return false
      const q = search.toLowerCase()
      const matchSearch = !q || [c.maskapai, c.flight_number, c.nomor_tiket, c.pnr].some(v => v.toLowerCase().includes(q))
      const matchStatus = statusFilter === 'Semua' || c.status_penerimaan === statusFilter
      return matchSearch && matchStatus
    })
  }, [claims, session, search, statusFilter])

  function handleSave() {
    if (!form.maskapai || !form.bandara_asal || !form.bandara_tujuan || !form.tanggal_penerbangan || !form.flight_number || !form.nomor_tiket || !form.pnr) {
      setFormError('Semua field wajib diisi.')
      return
    }
    if (form.bandara_asal === form.bandara_tujuan) { setFormError('Asal dan tujuan tidak boleh sama.'); return }

    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      if (modalMode === 'add') {
        const newC: ClaimRequest = {
          id: Date.now(),
          email_member: session?.email || '',
          ...form,
          status_penerimaan: 'Menunggu',
          timestamp: now,
        }
        const next = [...claims, newC]
        setClaims(next); saveClaims(next)
      } else if (modalMode === 'edit' && editTarget) {
        const next = claims.map(c => c.id === editTarget.id ? { ...c, ...form } : c)
        setClaims(next); saveClaims(next)
      }
      setModalMode(null); setEditTarget(null)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    setIsLoading(true)
    try {
      const next = claims.filter(c => c.id !== deleteTarget.id)
      setClaims(next); saveClaims(next); setDeleteTarget(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) return <div className="p-6 text-white">Memuat…</div>
  if (isHydrated && (!session || session.role !== 'member')) return <div className="p-6 text-white">Akses Ditolak. Khusus Member.</div>

  const stats = [
    { label: 'Total Klaim', value: filtered.length, accent: 'from-blue-500 to-cyan-500' },
    { label: 'Menunggu', value: filtered.filter(c => c.status_penerimaan === 'Menunggu').length, accent: 'from-amber-500 to-orange-500' },
    { label: 'Disetujui', value: filtered.filter(c => c.status_penerimaan === 'Disetujui').length, accent: 'from-emerald-500 to-green-500' },
    { label: 'Ditolak', value: filtered.filter(c => c.status_penerimaan === 'Ditolak').length, accent: 'from-rose-500 to-red-500' },
  ]

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Klaim Miles</h1>
            <p className="mt-1 text-sm text-white/70">Ajukan dan pantau klaim missing miles Anda (Dummy Data)</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setModalMode('add'); setFormError('') }}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700">
            + Ajukan Klaim Baru
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="overflow-hidden rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10">
              <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${s.accent}`} />
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">{s.label}</div>
              <div className="mt-2 text-3xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-lg lg:flex-row lg:items-center">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari flight, tiket, PNR…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
          <div className="flex gap-2">
            {(['Semua', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Penerbangan</th>
                  <th className="px-5 py-4">Detail</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Waktu</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-14 text-center text-slate-400">Belum ada data klaim.</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{c.maskapai} · {c.flight_number}</div>
                      <div className="text-xs text-slate-500">{c.bandara_asal} → {c.bandara_tujuan}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div>Tiket: {c.nomor_tiket}</div>
                      <div>PNR: {c.pnr} ({c.kelas_kabin})</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.status_penerimaan === 'Menunggu' ? 'bg-amber-100 text-amber-700' : c.status_penerimaan === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {c.status_penerimaan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDateTime(c.timestamp)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setEditTarget(c); setForm(c); setModalMode('edit') }}
                          disabled={c.status_penerimaan !== 'Menunggu'}
                          className="text-blue-600 hover:underline disabled:text-slate-300">Edit</button>
                        <button onClick={() => setDeleteTarget(c)}
                          disabled={c.status_penerimaan !== 'Menunggu'}
                          className="text-rose-600 hover:underline disabled:text-slate-300">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL ADD/EDIT */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{modalMode === 'add' ? 'Ajukan Klaim' : 'Edit Klaim'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={form.maskapai} onChange={e => setForm({...form, maskapai: e.target.value})} placeholder="Kode Maskapai (cth: GA)" className="rounded-xl border p-2.5 text-sm" />
              <input value={form.flight_number} onChange={e => setForm({...form, flight_number: e.target.value})} placeholder="Flight Number (cth: GA-123)" className="rounded-xl border p-2.5 text-sm" />
              <input value={form.bandara_asal} onChange={e => setForm({...form, bandara_asal: e.target.value})} placeholder="Bandara Asal (cth: CGK)" className="rounded-xl border p-2.5 text-sm" />
              <input value={form.bandara_tujuan} onChange={e => setForm({...form, bandara_tujuan: e.target.value})} placeholder="Bandara Tujuan (cth: DPS)" className="rounded-xl border p-2.5 text-sm" />
              <input type="date" value={form.tanggal_penerbangan} onChange={e => setForm({...form, tanggal_penerbangan: e.target.value})} className="rounded-xl border p-2.5 text-sm" />
              <input value={form.nomor_tiket} onChange={e => setForm({...form, nomor_tiket: e.target.value})} placeholder="Nomor Tiket" className="rounded-xl border p-2.5 text-sm" />
              <input value={form.pnr} onChange={e => setForm({...form, pnr: e.target.value})} placeholder="PNR" className="rounded-xl border p-2.5 text-sm" />
              <select value={form.kelas_kabin} onChange={e => setForm({...form, kelas_kabin: e.target.value})} className="rounded-xl border p-2.5 text-sm">
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>
            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 text-sm font-semibold text-slate-600">Batal</button>
              <button onClick={handleSave} disabled={isLoading} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white disabled:opacity-50">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Hapus Klaim?</h3>
            <p className="text-sm text-slate-500 mb-6">Data klaim untuk {deleteTarget.flight_number} akan dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Batal</button>
              <button onClick={handleDelete} disabled={isLoading} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

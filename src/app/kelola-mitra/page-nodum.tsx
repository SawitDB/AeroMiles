'use client'

import { useEffect, useState, useMemo } from 'react'

/* ─── Types ──────────────────────────────────────────────── */
type Penyedia = { id: number }

type Mitra = {
  email_mitra: string
  id_penyedia: number
  nama_mitra: string
  tanggal_kerja_sama: string
}

type ModalMode = 'add' | 'edit' | null

const EMPTY_FORM = {
  email_mitra: '',
  nama_mitra: '',
  tanggal_kerja_sama: '',
}

/* ─── Storage helpers ─────────────────────────────────────── */
function loadMitra(): Mitra[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('aeromiles_mitra') || '[]') } catch { return [] }
}
function saveMitra(data: Mitra[]) {
  localStorage.setItem('aeromiles_mitra', JSON.stringify(data))
}
function loadPenyedia(): Penyedia[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('aeromiles_penyedia') || '[]') } catch { return [] }
}
function savePenyedia(data: Penyedia[]) {
  localStorage.setItem('aeromiles_penyedia', JSON.stringify(data))
}
function getNextPenyediaId(list: Penyedia[]): number {
  if (list.length === 0) return 1
  return Math.max(...list.map(p => p.id)) + 1
}
function loadHadiah(): { id_penyedia: number }[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('aeromiles_hadiah') || '[]') } catch { return [] }
}
function saveHadiah(data: any[]) {
  localStorage.setItem('aeromiles_hadiah', JSON.stringify(data))
}

/* ─── Component ──────────────────────────────────────────── */
export default function KelolaMitraPage() {
  const [session, setSession] = useState<{ role?: string; email?: string } | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const [mitra, setMitra] = useState<Mitra[]>([])
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Mitra | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Mitra | null>(null)
  const [hadiah, setHadiah] = useState<{ id_penyedia: number }[]>([])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aeromiles_session') : null
    if (raw) {
      try { setSession(JSON.parse(raw)) } catch { setSession(null) }
    }
    setMitra(loadMitra())
    setHadiah(loadHadiah())
    setIsHydrated(true)
  }, [])

  /* ── Filter (DIPINDAHKAN KE ATAS SEBELUM RETURN KONDISIONAL) ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return mitra.filter(m =>
      m.email_mitra.toLowerCase().includes(q) ||
      m.nama_mitra.toLowerCase().includes(q) ||
      String(m.id_penyedia).includes(q)
    )
  }, [mitra, search])

  /* ── EARLY RETURNS ── */
  if (!isHydrated) return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-white/70">Memuat…</p>
    </main>
  )
  if (isHydrated && session && session.role !== 'staf') return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-2xl bg-white/90 p-8 text-center shadow">
        <p className="text-lg font-bold text-red-600">Akses Ditolak</p>
        <p className="mt-2 text-sm text-slate-500">Halaman ini hanya untuk Staf.</p>
      </div>
    </main>
  )

  function openAdd() {
    setForm({ ...EMPTY_FORM, tanggal_kerja_sama: new Date().toISOString().split('T')[0] })
    setFormError('')
    setModalMode('add')
  }
  function openEdit(m: Mitra) {
    setEditTarget(m)
    setForm({ email_mitra: m.email_mitra, nama_mitra: m.nama_mitra, tanggal_kerja_sama: m.tanggal_kerja_sama })
    setFormError('')
    setModalMode('edit')
  }
  function handleSave() {
    if (!form.email_mitra || !form.nama_mitra || !form.tanggal_kerja_sama) {
      setFormError('Semua field wajib diisi.')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(form.email_mitra)) { setFormError('Format email tidak valid.'); return }

    if (modalMode === 'add') {
      if (mitra.some(m => m.email_mitra.toLowerCase() === form.email_mitra.toLowerCase())) {
        setFormError('Email mitra sudah terdaftar.')
        return
      }
      // Create new PENYEDIA entry
      const penyediaList = loadPenyedia()
      const newId = getNextPenyediaId(penyediaList)
      const newPenyedia = [...penyediaList, { id: newId }]
      savePenyedia(newPenyedia)

      // Create MITRA
      const newMitra: Mitra = {
        email_mitra: form.email_mitra,
        id_penyedia: newId,
        nama_mitra: form.nama_mitra,
        tanggal_kerja_sama: form.tanggal_kerja_sama,
      }
      const next = [...mitra, newMitra]
      setMitra(next); saveMitra(next)

    } else if (modalMode === 'edit' && editTarget) {
      const next = mitra.map(m => m.email_mitra === editTarget.email_mitra
        ? { ...m, nama_mitra: form.nama_mitra, tanggal_kerja_sama: form.tanggal_kerja_sama }
        : m)
      setMitra(next); saveMitra(next)
    }
    setModalMode(null); setEditTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    // Remove the mitra
    const nextMitra = mitra.filter(m => m.email_mitra !== deleteTarget.email_mitra)
    saveMitra(nextMitra)
    setMitra(nextMitra)

    // Remove associated PENYEDIA
    const penyediaList = loadPenyedia()
    const nextPenyedia = penyediaList.filter(p => p.id !== deleteTarget.id_penyedia)
    savePenyedia(nextPenyedia)

    // Cascade: remove hadiah from that penyedia
    const hadiahList: any[] = (() => {
      try { return JSON.parse(localStorage.getItem('aeromiles_hadiah') || '[]') } catch { return [] }
    })()
    const nextHadiah = hadiahList.filter((h: any) => h.id_penyedia !== deleteTarget.id_penyedia)
    saveHadiah(nextHadiah)
    setHadiah(nextHadiah)

    setDeleteTarget(null)
  }

  function hadiahCount(id_penyedia: number) {
    return hadiah.filter(h => h.id_penyedia === id_penyedia).length
  }

  /* ── date formatter ── */
  function fmtDate(d: string) {
    if (!d) return '-'
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    } catch { return d }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-6xl">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kelola Mitra</h1>
            <p className="mt-1 text-sm text-white/70">Manajemen data mitra kerja sama AeroMiles</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700">
            + Daftarkan Mitra
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: 'Total Mitra', value: mitra.length, icon: '🤝' },
            { label: 'Total Penyedia (Mitra)', value: mitra.length, icon: '🏢' },
            { label: 'Total Hadiah dari Mitra', value: mitra.reduce((acc, m) => acc + hadiahCount(m.id_penyedia), 0), icon: '🎁' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/10 p-4 text-white">
              <div className="text-xl">{s.icon}</div>
              <div className="mt-1 text-xs text-white/70">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama mitra, email, atau ID penyedia…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 sm:max-w-md" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl bg-white/95 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-4">Email Mitra</th>
                <th className="px-4 py-4">ID Penyedia</th>
                <th className="px-4 py-4">Nama Mitra</th>
                <th className="px-4 py-4">Tanggal Kerja Sama</th>
                <th className="px-4 py-4">Hadiah</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">Belum ada data mitra.</td></tr>
                : filtered.map(m => (
                  <tr key={m.email_mitra} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-600">{m.email_mitra}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-mono text-xs font-bold text-purple-700">
                        #{m.id_penyedia}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.nama_mitra}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(m.tanggal_kerja_sama)}</td>
                    <td className="px-4 py-3">
                      {hadiahCount(m.id_penyedia) > 0
                        ? <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            {hadiahCount(m.id_penyedia)} hadiah
                          </span>
                        : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            0 hadiah
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(m)} title="Edit"
                          className="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">✏️</button>
                        <button onClick={() => setDeleteTarget(m)} title="Hapus"
                          className="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Mitra cards on mobile as supplement */}
        <div className="mt-6 grid gap-4 sm:hidden">
          {filtered.map(m => (
            <div key={m.email_mitra} className="rounded-2xl bg-white/95 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-800">{m.nama_mitra}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{m.email_mitra}</div>
                </div>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 font-mono text-xs font-bold text-purple-700">#{m.id_penyedia}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">Kerja sama sejak {fmtDate(m.tanggal_kerja_sama)}</div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50">✏️</button>
                  <button onClick={() => setDeleteTarget(m)} className="rounded-lg px-2 py-1 text-red-500 hover:bg-red-50">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ MODAL ADD / EDIT ═══ */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'add' ? '🤝 Daftarkan Mitra Baru' : '✏️ Edit Mitra'}
                </h2>
                <button onClick={() => setModalMode(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email Mitra <span className="text-red-500">*</span></label>
                  {modalMode === 'edit'
                    ? <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">{editTarget?.email_mitra}</div>
                    : <input type="email" value={form.email_mitra} onChange={e => setForm(f => ({ ...f, email_mitra: e.target.value }))}
                        placeholder="mitra@perusahaan.com"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  }
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Nama Mitra <span className="text-red-500">*</span></label>
                  <input value={form.nama_mitra} onChange={e => setForm(f => ({ ...f, nama_mitra: e.target.value }))}
                    placeholder="cth: Hotel Bintang Lima"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Tanggal Kerja Sama <span className="text-red-500">*</span></label>
                  <input type="date" value={form.tanggal_kerja_sama} onChange={e => setForm(f => ({ ...f, tanggal_kerja_sama: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>

                {modalMode === 'add' && (
                  <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
                    ℹ️ Sistem akan otomatis membuat entri <strong>Penyedia</strong> baru dan mengasosiasikannya dengan Mitra ini.
                  </div>
                )}

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={() => setModalMode(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button onClick={handleSave}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MODAL DELETE ═══ */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900">Hapus Mitra?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Mitra <span className="font-semibold">{deleteTarget.nama_mitra}</span> akan dihapus beserta:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-500">
                <li>• Data Penyedia (ID #{deleteTarget.id_penyedia})</li>
                <li>• {hadiahCount(deleteTarget.id_penyedia)} hadiah yang disediakan mitra ini</li>
              </ul>
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                ⚠️ Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button onClick={handleDelete}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
'use client'

import { useEffect, useState, useMemo } from 'react'

/* ─── Types ──────────────────────────────────────────────── */
type Penyedia = { id: number; label: string; type: 'maskapai' | 'mitra' }

type Hadiah = {
  kode_hadiah: string
  nama: string
  miles: number
  deskripsi: string
  valid_start_date: string
  program_end: string
  id_penyedia: number
}

type ModalMode = 'add' | 'edit' | null

const EMPTY_FORM = {
  nama: '',
  miles: '',
  deskripsi: '',
  valid_start_date: '',
  program_end: '',
  id_penyedia: '',
}

/* ─── Helpers ─────────────────────────────────────────────── */
function loadHadiah(): Hadiah[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('aeromiles_hadiah') || '[]') } catch { return [] }
}
function saveHadiah(data: Hadiah[]) {
  localStorage.setItem('aeromiles_hadiah', JSON.stringify(data))
}
function loadPenyedia(): Penyedia[] {
  if (typeof window === 'undefined') return []
  const penyediaRaw: { id: number }[] = (() => {
    try { return JSON.parse(localStorage.getItem('aeromiles_penyedia') || '[]') } catch { return [] }
  })()
  const mitraRaw: { email_mitra: string; id_penyedia: number; nama_mitra: string }[] = (() => {
    try { return JSON.parse(localStorage.getItem('aeromiles_mitra') || '[]') } catch { return [] }
  })()
  const maskapaiRaw: { kode_maskapai: string; nama_maskapai: string; id_penyedia?: number }[] = (() => {
    try { return JSON.parse(localStorage.getItem('aeromiles_maskapai') || '[]') } catch { return [] }
  })()
  const result: Penyedia[] = []
  // add maskapai as penyedia
  maskapaiRaw.forEach(m => {
    if (m.id_penyedia) result.push({ id: m.id_penyedia, label: `${m.kode_maskapai} – ${m.nama_maskapai}`, type: 'maskapai' })
  })
  // add mitra as penyedia
  mitraRaw.forEach(m => {
    result.push({ id: m.id_penyedia, label: `${m.nama_mitra} (Mitra)`, type: 'mitra' })
  })
  // any remaining penyedia not matched
  penyediaRaw.forEach(p => {
    if (!result.find(r => r.id === p.id)) {
      result.push({ id: p.id, label: `Penyedia #${p.id}`, type: 'mitra' })
    }
  })
  return result
}
function getNextKodeHadiah(list: Hadiah[]): string {
  if (list.length === 0) return 'RWD-001'
  const nums = list.map(h => {
    const m = h.kode_hadiah.match(/RWD-(\d+)/)
    return m ? parseInt(m[1]) : 0
  })
  const next = Math.max(...nums) + 1
  return `RWD-${String(next).padStart(3, '0')}`
}
function isExpired(program_end: string): boolean {
  return new Date(program_end) < new Date()
}
function isActive(h: Hadiah): boolean {
  const now = new Date()
  return new Date(h.valid_start_date) <= now && new Date(h.program_end) >= now
}

/* ─── Component ──────────────────────────────────────────── */
export default function KelolaHadiahPenyediaPage() {
  const [session, setSession] = useState<{ role?: string; email?: string } | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [activeTab, setActiveTab] = useState<'hadiah' | 'penyedia'>('hadiah')

  // Hadiah state
  const [hadiah, setHadiah] = useState<Hadiah[]>([])
  const [penyediaList, setPenyediaList] = useState<Penyedia[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterPenyedia, setFilterPenyedia] = useState('Semua')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Hadiah | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Hadiah | null>(null)

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aeromiles_session') : null
    if (raw) {
      try { setSession(JSON.parse(raw)) } catch { setSession(null) }
    }
    setHadiah(loadHadiah())
    setPenyediaList(loadPenyedia())
    setIsHydrated(true)
  }, [])

  /* ── Hadiah filtering (DIPINDAHKAN KE ATAS SINI) ── */
  const filtered = useMemo(() => {
    return hadiah.filter(h => {
      const q = search.toLowerCase()
      const matchSearch = h.kode_hadiah.toLowerCase().includes(q) || h.nama.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'Semua'
        ? true
        : filterStatus === 'Aktif' ? isActive(h)
        : filterStatus === 'Kedaluwarsa' ? isExpired(h.program_end)
        : !isActive(h) && !isExpired(h.program_end)
      const matchPenyedia = filterPenyedia === 'Semua' ? true : String(h.id_penyedia) === filterPenyedia
      return matchSearch && matchStatus && matchPenyedia
    })
  }, [hadiah, search, filterStatus, filterPenyedia])

  const refreshPenyedia = () => setPenyediaList(loadPenyedia())

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormError('')
    setModalMode('add')
  }
  function openEdit(h: Hadiah) {
    setEditTarget(h)
    setForm({
      nama: h.nama, miles: String(h.miles), deskripsi: h.deskripsi,
      valid_start_date: h.valid_start_date, program_end: h.program_end,
      id_penyedia: String(h.id_penyedia),
    })
    setFormError('')
    setModalMode('edit')
  }
  function handleSave() {
    if (!form.nama || !form.miles || !form.valid_start_date || !form.program_end || !form.id_penyedia) {
      setFormError('Semua field wajib diisi.')
      return
    }
    if (Number(form.miles) <= 0) { setFormError('Miles harus lebih dari 0.'); return }
    if (form.valid_start_date > form.program_end) { setFormError('Tanggal mulai tidak boleh setelah tanggal akhir.'); return }

    if (modalMode === 'add') {
      const newH: Hadiah = {
        kode_hadiah: getNextKodeHadiah(hadiah),
        nama: form.nama, miles: Number(form.miles),
        deskripsi: form.deskripsi, valid_start_date: form.valid_start_date,
        program_end: form.program_end, id_penyedia: Number(form.id_penyedia),
      }
      const next = [...hadiah, newH]
      setHadiah(next); saveHadiah(next)
    } else if (modalMode === 'edit' && editTarget) {
      const next = hadiah.map(h => h.kode_hadiah === editTarget.kode_hadiah
        ? { ...h, nama: form.nama, miles: Number(form.miles), deskripsi: form.deskripsi, valid_start_date: form.valid_start_date, program_end: form.program_end, id_penyedia: Number(form.id_penyedia) }
        : h)
      setHadiah(next); saveHadiah(next)
    }
    setModalMode(null); setEditTarget(null)
  }
  function handleDelete() {
    if (!deleteTarget) return
    const next = hadiah.filter(h => h.kode_hadiah !== deleteTarget.kode_hadiah)
    setHadiah(next); saveHadiah(next); setDeleteTarget(null)
  }

  function getPenyediaLabel(id: number) {
    return penyediaList.find(p => p.id === id)?.label ?? `Penyedia #${id}`
  }
  function getStatusBadge(h: Hadiah) {
    if (isExpired(h.program_end)) return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Kedaluwarsa</span>
    if (isActive(h)) return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Aktif</span>
    return <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">Belum Mulai</span>
  }

  /* ── EARLY RETURNS (DITEMPATKAN SETELAH SEMUA HOOK) ── */
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

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-7xl">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kelola Hadiah &amp; Penyedia</h1>
            <p className="mt-1 text-sm text-white/70">Manajemen katalog hadiah dan data penyedia AeroMiles</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('hadiah'); refreshPenyedia() }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'hadiah' ? 'bg-white text-blue-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              🎁 Hadiah
            </button>
            <button
              onClick={() => setActiveTab('penyedia')}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'penyedia' ? 'bg-white text-blue-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              🏢 Penyedia
            </button>
          </div>
        </div>

        {/* ── HADIAH TAB ── */}
        {activeTab === 'hadiah' && (
          <>
            {/* Stats strip */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total Hadiah', value: hadiah.length },
                { label: 'Aktif', value: hadiah.filter(isActive).length },
                { label: 'Belum Mulai', value: hadiah.filter(h => !isActive(h) && !isExpired(h.program_end)).length },
                { label: 'Kedaluwarsa', value: hadiah.filter(h => isExpired(h.program_end)).length },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/10 p-4 text-white">
                  <div className="text-xs text-white/70">{s.label}</div>
                  <div className="mt-1 text-2xl font-bold">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari kode atau nama hadiah…"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
                  <option>Semua</option>
                  <option>Aktif</option>
                  <option>Belum Mulai</option>
                  <option>Kedaluwarsa</option>
                </select>
                <select value={filterPenyedia} onChange={e => setFilterPenyedia(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
                  <option value="Semua">Semua Penyedia</option>
                  {penyediaList.map(p => <option key={p.id} value={String(p.id)}>{p.label}</option>)}
                </select>
              </div>
              <button onClick={openAdd}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700">
                + Tambah Hadiah
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl bg-white/95 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4">Kode</th>
                    <th className="px-4 py-4">Nama Hadiah</th>
                    <th className="px-4 py-4">Penyedia</th>
                    <th className="px-4 py-4">Miles</th>
                    <th className="px-4 py-4">Periode Valid</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">Tidak ada data hadiah.</td></tr>
                    : filtered.map(h => (
                      <tr key={h.kode_hadiah} className="border-b border-slate-50 hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">{h.kode_hadiah}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{h.nama}</div>
                          {h.deskripsi && <div className="mt-0.5 text-xs text-slate-400 line-clamp-1">{h.deskripsi}</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{getPenyediaLabel(h.id_penyedia)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{h.miles.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          <div>{h.valid_start_date}</div>
                          <div>s.d. {h.program_end}</div>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(h)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(h)} title="Edit"
                              className="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">✏️</button>
                            <button onClick={() => setDeleteTarget(h)} 
                              disabled={isActive(h)}
                              className="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              title={isActive(h) ? 'Tidak dapat menghapus hadiah yang masih aktif' : 'Hapus'}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── PENYEDIA TAB ── */}
        {activeTab === 'penyedia' && (
          <>
            <div className="mb-4 overflow-x-auto rounded-2xl bg-white/95 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4">ID Penyedia</th>
                    <th className="px-4 py-4">Nama / Label</th>
                    <th className="px-4 py-4">Tipe</th>
                    <th className="px-4 py-4">Jumlah Hadiah</th>
                  </tr>
                </thead>
                <tbody>
                  {penyediaList.length === 0
                    ? <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">Belum ada data penyedia.</td></tr>
                    : penyediaList.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">#{p.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{p.label}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.type === 'maskapai' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {p.type === 'maskapai' ? '✈️ Maskapai' : '🤝 Mitra'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{hadiah.filter(h => h.id_penyedia === p.id).length} hadiah</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <p className="text-xs text-white/60">
              Penyedia bersumber dari data Maskapai dan Mitra. Kelola mitra melalui halaman <strong>Kelola Mitra</strong>.
            </p>
          </>
        )}

        {/* ═══ MODAL ADD/EDIT ═══ */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'add' ? '🎁 Tambah Hadiah Baru' : '✏️ Edit Hadiah'}
                </h2>
                <button onClick={() => setModalMode(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">✕</button>
              </div>

              <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                {modalMode === 'edit' && (
                  <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                    <span className="text-slate-500">Kode Hadiah:</span>{' '}
                    <span className="font-mono font-bold text-blue-600">{editTarget?.kode_hadiah}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nama Hadiah <span className="text-red-500">*</span></label>
                  <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                    placeholder="cth: Free Upgrade Business Class"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Penyedia <span className="text-red-500">*</span></label>
                  <select value={form.id_penyedia} onChange={e => setForm(f => ({ ...f, id_penyedia: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400">
                    <option value="">-- Pilih Penyedia --</option>
                    {penyediaList.map(p => <option key={p.id} value={String(p.id)}>{p.label}</option>)}
                  </select>
                  {penyediaList.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">⚠️ Belum ada penyedia. Tambahkan Mitra terlebih dahulu.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Miles (harga) <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={form.miles} onChange={e => setForm(f => ({ ...f, miles: e.target.value }))}
                    placeholder="cth: 5000"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
                  <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                    rows={2} placeholder="Deskripsi hadiah (opsional)"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Valid Mulai <span className="text-red-500">*</span></label>
                    <input type="date" value={form.valid_start_date} onChange={e => setForm(f => ({ ...f, valid_start_date: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Berakhir <span className="text-red-500">*</span></label>
                    <input type="date" value={form.program_end} onChange={e => setForm(f => ({ ...f, program_end: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
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
              <h2 className="text-lg font-bold text-slate-900">Hapus Hadiah?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Hadiah <span className="font-semibold">{deleteTarget.nama}</span>{' '}
                (<span className="font-mono text-blue-600">{deleteTarget.kode_hadiah}</span>) akan dihapus permanen.
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
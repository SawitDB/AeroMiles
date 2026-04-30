'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { loadIdentitas, saveIdentitas } from '@/lib/auth/storage'
import type { Identitas } from '@/lib/auth/types'

const JENIS_OPTIONS: Identitas['jenis'][] = ['Paspor', 'KTP', 'SIM']
const NEGARA_OPTIONS = [
  'Indonesia', 'Malaysia', 'Singapura', 'Filipina', 'Thailand',
  'Vietnam', 'Australia', 'Amerika Serikat', 'Inggris', 'Jepang',
]

type ModalMode = 'add' | 'edit' | null

const EMPTY_FORM = {
  nomor: '',
  jenis: 'Paspor' as Identitas['jenis'],
  negaraPenerbit: 'Indonesia',
  tanggalTerbit: '',
  tanggalHabis: '',
}

function isExpired(tanggalHabis: string) {
  return new Date(tanggalHabis) < new Date()
}

export default function IdentitasPage() {
  const { user, isHydrated } = useRequireAuth()
  const [list, setList] = useState<Identitas[]>([])
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Identitas | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Identitas | null>(null)

  useEffect(() => {
    if (!user) return
    setList(loadIdentitas().filter(i => i.emailMember === user.email))
  }, [user])

  if (isHydrated && user && user.role !== 'member') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-2xl bg-white/90 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">Akses Ditolak</p>
          <p className="mt-2 text-sm text-slate-500">Halaman ini hanya untuk Member.</p>
        </div>
      </main>
    )
  }

  if (!isHydrated || !user) return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Memuat...</p>
    </main>
  )

  function openAdd() {
    setForm(EMPTY_FORM); setFormError(''); setEditTarget(null); setModalMode('add')
  }

  function openEdit(id: Identitas) {
    setEditTarget(id)
    setForm({ nomor: id.nomor, jenis: id.jenis, negaraPenerbit: id.negaraPenerbit, tanggalTerbit: id.tanggalTerbit, tanggalHabis: id.tanggalHabis })
    setFormError(''); setModalMode('edit')
  }

  function handleSave() {
    if (!form.nomor || !form.tanggalTerbit || !form.tanggalHabis) { setFormError('Semua field wajib diisi.'); return }
    if (new Date(form.tanggalHabis) <= new Date(form.tanggalTerbit)) { setFormError('Tanggal habis harus setelah tanggal terbit.'); return }
    const all = loadIdentitas()
    if (modalMode === 'add') {
      if (all.some(i => i.nomor === form.nomor)) { setFormError('Nomor dokumen sudah terdaftar.'); return }
      const newId: Identitas = { nomor: form.nomor, emailMember: user.email, jenis: form.jenis, negaraPenerbit: form.negaraPenerbit, tanggalTerbit: form.tanggalTerbit, tanggalHabis: form.tanggalHabis }
      const next = [...all, newId]
      saveIdentitas(next); setList(next.filter(i => i.emailMember === user.email))
    } else if (modalMode === 'edit' && editTarget) {
      const next = all.map(i => i.nomor === editTarget.nomor
        ? { ...i, jenis: form.jenis, negaraPenerbit: form.negaraPenerbit, tanggalTerbit: form.tanggalTerbit, tanggalHabis: form.tanggalHabis }
        : i)
      saveIdentitas(next); setList(next.filter(i => i.emailMember === user.email))
    }
    setModalMode(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    const all = loadIdentitas()
    const next = all.filter(i => i.nomor !== deleteTarget.nomor)
    saveIdentitas(next); setList(next.filter(i => i.emailMember === user.email)); setDeleteTarget(null)
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-4xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Identitas Saya</h1>
            <p className="mt-1 text-sm text-slate-500">Kelola dokumen identitas Anda</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white hover:bg-secondary/90">
            + Tambah Identitas
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white/90 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-4">No. Dokumen</th>
                <th className="px-4 py-4">Jenis</th>
                <th className="px-4 py-4">Negara</th>
                <th className="px-4 py-4">Terbit</th>
                <th className="px-4 py-4">Habis</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0
                ? <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">Belum ada dokumen identitas.</td></tr>
                : list.map(id => (
                  <tr key={id.nomor} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{id.nomor}</td>
                    <td className="px-4 py-3">{id.jenis}</td>
                    <td className="px-4 py-3 text-slate-600">{id.negaraPenerbit}</td>
                    <td className="px-4 py-3 text-slate-600">{id.tanggalTerbit}</td>
                    <td className="px-4 py-3 text-slate-600">{id.tanggalHabis}</td>
                    <td className="px-4 py-3">
                      {isExpired(id.tanggalHabis)
                        ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Kedaluwarsa</span>
                        : <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Aktif</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">✏️</button>
                        <button onClick={() => setDeleteTarget(id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Modal Add/Edit */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'add' ? 'Tambah Identitas Baru' : 'Edit Identitas'}
                </h2>
                <button onClick={() => setModalMode(null)} className="text-xl text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nomor Dokumen <span className="text-red-500">*</span></label>
                  <input value={form.nomor} onChange={e => setForm(f => ({ ...f, nomor: e.target.value }))}
                    disabled={modalMode === 'edit'} placeholder="cth: A12345678"
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none ${modalMode === 'edit' ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'}`} />
                  {modalMode === 'edit' && <p className="mt-1 text-xs text-slate-400">Nomor dokumen tidak dapat diubah.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Jenis Dokumen <span className="text-red-500">*</span></label>
                  <select value={form.jenis} onChange={e => setForm(f => ({ ...f, jenis: e.target.value as Identitas['jenis'] }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary">
                    {JENIS_OPTIONS.map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Negara Penerbit <span className="text-red-500">*</span></label>
                  <select value={form.negaraPenerbit} onChange={e => setForm(f => ({ ...f, negaraPenerbit: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary">
                    {NEGARA_OPTIONS.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Tanggal Terbit <span className="text-red-500">*</span></label>
                    <input type="date" value={form.tanggalTerbit} onChange={e => setForm(f => ({ ...f, tanggalTerbit: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Tanggal Habis <span className="text-red-500">*</span></label>
                    <input type="date" value={form.tanggalHabis} onChange={e => setForm(f => ({ ...f, tanggalHabis: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary" />
                  </div>
                </div>
                {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={() => setModalMode(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                <button onClick={handleSave}
                  className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-bold text-white hover:bg-secondary/90">Simpan</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hapus */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-slate-900">Hapus Identitas?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Dokumen <span className="font-semibold">{deleteTarget.nomor}</span> ({deleteTarget.jenis}) akan dihapus secara permanen.
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                <button onClick={handleDelete}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700">Hapus</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
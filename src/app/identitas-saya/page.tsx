'use client'

import { useEffect, useState } from 'react'

type Identitas = {
  nomor: string
  jenis: string
  negara_penerbit: string
  tanggal_terbit: string
  tanggal_habis: string
}

const JENIS_OPTIONS = ['KTP', 'Paspor', 'SIM']

const emptyForm = {
  nomor: '',
  jenis: 'KTP',
  negara_penerbit: '',
  tanggal_terbit: '',
  tanggal_habis: '',
}

export default function Page() {
  const [data, setData] = useState<Identitas[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editNomor, setEditNomor] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    const res = await fetch('/api/identitas')
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function openTambah() {
    setEditNomor(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(item: Identitas) {
    setEditNomor(item.nomor)
    setForm({
      nomor: item.nomor,
      jenis: item.jenis,
      negara_penerbit: item.negara_penerbit,
      tanggal_terbit: item.tanggal_terbit.slice(0, 10),
      tanggal_habis: item.tanggal_habis.slice(0, 10),
    })
    setError('')
    setShowForm(true)
  }

  async function handleSubmit() {
    setError('')
    const isEdit = editNomor !== null
    const res = await fetch('/api/identitas', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Terjadi kesalahan')
      return
    }
    setShowForm(false)
    fetchData()
  }

  async function handleDelete(nomor: string) {
    const res = await fetch('/api/identitas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomor }),
    })
    if (res.ok) {
      setDeleteConfirm(null)
      fetchData()
    }
  }

  function isExpired(tanggal_habis: string) {
    return new Date(tanggal_habis) < new Date()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Identitas Saya</h1>
        <button
          onClick={openTambah}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          + Tambah Identitas
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-[#1e2d4a] p-6 text-white shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editNomor ? 'Edit Identitas' : 'Tambah Identitas Baru'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Nomor Dokumen</label>
                <input
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm disabled:opacity-50"
                  value={form.nomor}
                  disabled={!!editNomor}
                  onChange={e => setForm({ ...form, nomor: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Jenis Dokumen</label>
                <select
                  className="w-full rounded-lg bg-[#1e2d4a] border border-white/20 px-3 py-2 text-sm"
                  value={form.jenis}
                  onChange={e => setForm({ ...form, jenis: e.target.value })}
                >
                  {JENIS_OPTIONS.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm">Negara Penerbit</label>
                <input
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm"
                  value={form.negara_penerbit}
                  onChange={e => setForm({ ...form, negara_penerbit: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-sm">Tanggal Terbit</label>
                  <input
                    type="date"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm"
                    value={form.tanggal_terbit}
                    onChange={e => setForm({ ...form, tanggal_terbit: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm">Tanggal Habis</label>
                  <input
                    type="date"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm"
                    value={form.tanggal_habis}
                    onChange={e => setForm({ ...form, tanggal_habis: e.target.value })}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl bg-[#1e2d4a] p-6 text-white shadow-xl">
            <h2 className="mb-2 text-lg font-semibold">Hapus Identitas?</h2>
            <p className="mb-5 text-sm text-white/70">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="mt-6">
        {loading ? (
          <p className="text-white/60">Memuat...</p>
        ) : data.length === 0 ? (
          <p className="text-white/60">Tidak ada identitas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-white/60">
                <th className="pb-3 pr-4">No. Dokumen</th>
                <th className="pb-3 pr-4">Jenis</th>
                <th className="pb-3 pr-4">Negara</th>
                <th className="pb-3 pr-4">Terbit</th>
                <th className="pb-3 pr-4">Habis</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.nomor} className="border-b border-white/10">
                  <td className="py-3 pr-4 font-mono">{item.nomor}</td>
                  <td className="py-3 pr-4">{item.jenis}</td>
                  <td className="py-3 pr-4">{item.negara_penerbit}</td>
                  <td className="py-3 pr-4">{item.tanggal_terbit?.slice(0, 10)}</td>
                  <td className="py-3 pr-4">{item.tanggal_habis?.slice(0, 10)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      isExpired(item.tanggal_habis)
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {isExpired(item.tanggal_habis) ? 'Kedaluwarsa' : 'Aktif'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded px-2 py-1 text-xs hover:bg-white/10"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.nomor)}
                        className="rounded px-2 py-1 text-xs hover:bg-white/10"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
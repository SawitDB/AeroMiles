'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { loadMembers, saveMembers, getNextMemberNumber } from '@/lib/auth/storage'
import type { Member } from '@/lib/auth/types'

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']
const COUNTRY_CODES = ['+62', '+1', '+44', '+81', '+65', '+60', '+61', '+49', '+33', '+86']
const KEWARGANEGARAAN = [
  'Indonesia', 'Malaysia', 'Singapura', 'Filipina', 'Thailand',
  'Vietnam', 'Australia', 'Amerika Serikat', 'Inggris', 'Jepang',
]
const TIERS = ['Blue', 'Silver', 'Gold', 'Platinum']

type ModalMode = 'add' | 'edit' | null

const EMPTY_FORM = {
  email: '',
  salutation: 'Mr.',
  firstName: '',
  lastName: '',
  countryCode: '+62',
  mobileNumber: '',
  tanggalLahir: '',
  kewarganegaraan: 'Indonesia',
  idTier: 'Blue',
}

const TIER_COLOR: Record<string, string> = {
  Blue: 'bg-blue-100 text-blue-700',
  Silver: 'bg-slate-200 text-slate-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-purple-100 text-purple-700',
}

export default function KelolaMemberPage() {
  const { user, isHydrated } = useRequireAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('Semua Tier')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  useEffect(() => { setMembers(loadMembers()) }, [])

  if (isHydrated && user && user.role !== 'staf') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-2xl bg-white/90 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">Akses Ditolak</p>
          <p className="mt-2 text-sm text-slate-500">Halaman ini hanya untuk Staf.</p>
        </div>
      </main>
    )
  }

  if (!isHydrated || !user) return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Memuat...</p>
    </main>
  )

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.nomorMember.toLowerCase().includes(q)
    const matchTier = filterTier === 'Semua Tier' || m.idTier === filterTier
    return matchSearch && matchTier
  })

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormError('')
    setModalMode('add')
  }

  function openEdit(m: Member) {
    setEditTarget(m)
    setForm({ email: m.email, salutation: m.salutation, firstName: m.firstName, lastName: m.lastName, countryCode: m.countryCode, mobileNumber: m.mobileNumber, tanggalLahir: m.tanggalLahir, kewarganegaraan: m.kewarganegaraan, idTier: m.idTier })
    setFormError('')
    setModalMode('edit')
  }

  function handleSave() {
    if (!form.email || !form.firstName || !form.lastName || !form.mobileNumber || !form.tanggalLahir) {
      setFormError('Semua field wajib diisi.')
      return
    }
    if (modalMode === 'add') {
      if (members.some(m => m.email === form.email)) { setFormError('Email sudah terdaftar.'); return }
      const newMember: Member = {
        email: form.email, name: `${form.salutation} ${form.firstName} ${form.lastName}`,
        salutation: form.salutation, firstName: form.firstName, lastName: form.lastName,
        countryCode: form.countryCode, mobileNumber: form.mobileNumber,
        tanggalLahir: form.tanggalLahir, kewarganegaraan: form.kewarganegaraan,
        role: 'member', nomorMember: getNextMemberNumber(), idTier: form.idTier,
        tanggalBergabung: new Date().toISOString().split('T')[0], awardMiles: 0, totalMiles: 0,
      }
      const next = [...members, newMember]
      setMembers(next); saveMembers(next)
    } else if (modalMode === 'edit' && editTarget) {
      const next = members.map(m => m.email === editTarget.email
        ? { ...m, name: `${form.salutation} ${form.firstName} ${form.lastName}`, salutation: form.salutation, firstName: form.firstName, lastName: form.lastName, countryCode: form.countryCode, mobileNumber: form.mobileNumber, tanggalLahir: form.tanggalLahir, kewarganegaraan: form.kewarganegaraan, idTier: form.idTier }
        : m)
      setMembers(next); saveMembers(next)
    }
    setModalMode(null); setEditTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    const next = members.filter(m => m.email !== deleteTarget.email)
    setMembers(next); saveMembers(next); setDeleteTarget(null)
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-6xl">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kelola Member</h1>
            <p className="mt-1 text-sm text-slate-500">Manajemen data seluruh member AeroMiles</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white hover:bg-secondary/90">
            + Tambah Member
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau nomor member..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
            <option>Semua Tier</option>
            {TIERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white/90 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-4">No. Member</th>
                <th className="px-4 py-4">Nama</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Tier</th>
                <th className="px-4 py-4">Total Miles</th>
                <th className="px-4 py-4">Award Miles</th>
                <th className="px-4 py-4">Bergabung</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} className="py-10 text-center text-sm text-slate-400">Tidak ada data member.</td></tr>
                : filtered.map(m => (
                  <tr key={m.email} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-secondary">{m.nomorMember}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                    <td className="px-4 py-3 text-slate-500">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_COLOR[m.idTier] ?? 'bg-slate-100 text-slate-600'}`}>
                        {m.idTier}
                      </span>
                    </td>
                    <td className="px-4 py-3">{(m.totalMiles ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{(m.awardMiles ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{m.tanggalBergabung}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(m)} title="Edit"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600">✏️</button>
                        <button onClick={() => setDeleteTarget(m)} title="Hapus"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">🗑️</button>
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
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'add' ? 'Tambah Member Baru' : 'Edit Member'}
                </h2>
                <button onClick={() => setModalMode(null)} className="text-xl text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                {modalMode === 'add' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@contoh.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Salutation <span className="text-red-500">*</span></label>
                  <select value={form.salutation} onChange={e => setForm(f => ({ ...f, salutation: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary">
                    {SALUTATIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nama Depan <span className="text-red-500">*</span></label>
                    <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="cth: John"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nama Belakang <span className="text-red-500">*</span></label>
                    <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="cth: Doe"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kewarganegaraan <span className="text-red-500">*</span></label>
                  <select value={form.kewarganegaraan} onChange={e => setForm(f => ({ ...f, kewarganegaraan: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary">
                    {KEWARGANEGARAAN.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Kode</label>
                    <select value={form.countryCode} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2.5 text-sm outline-none">
                      {COUNTRY_CODES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Nomor HP <span className="text-red-500">*</span></label>
                    <input value={form.mobileNumber} onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                      placeholder="81234567890"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tanggal Lahir <span className="text-red-500">*</span></label>
                  <input type="date" value={form.tanggalLahir} onChange={e => setForm(f => ({ ...f, tanggalLahir: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tier</label>
                  <select value={form.idTier} onChange={e => setForm(f => ({ ...f, idTier: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-secondary">
                    {TIERS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
                )}
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
              <h2 className="text-lg font-bold text-slate-900">Hapus Member?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Semua data terkait <span className="font-semibold">{deleteTarget.name}</span> (Identitas, Klaim, Transfer, Redeem) akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
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

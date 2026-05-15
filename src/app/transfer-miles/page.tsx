'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

type TransferRecord = {
  email_member_1: string
  email_member_2: string
  timestamp: string
  jumlah: number
  catatan: string | null
}

type MemberLookup = {
  email: string
  salutation: string
  first_mid_name: string
  last_name: string
}

type ModalMode = 'add' | null

const EMPTY_FORM = {
  email_member_2: '',
  jumlah: '',
  catatan: '',
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
  const { user, isHydrated, updateProfile } = useAuth()
  const [transfers, setTransfers] = useState<TransferRecord[]>([])
  const [memberByEmail, setMemberByEmail] = useState<Record<string, MemberLookup>>({})
  const [memberData, setMemberData] = useState<{ award_miles?: number; total_miles?: number } | null>(null)
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchTransfers = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/transfer?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const data = await res.json()
        setTransfers(data)
      }
    } catch (err) {
      console.error('Failed to fetch transfers', err)
    }
  }

  const loadSelf = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/member/${encodeURIComponent(user.email)}`)
      if (!res.ok) return
      const data = await res.json()
      setMemberData({ award_miles: data.award_miles, total_miles: data.total_miles })
      setMemberByEmail((prev) => ({
        ...prev,
        [user.email]: {
          email: user.email,
          salutation: user.salutation,
          first_mid_name: user.firstName,
          last_name: user.lastName,
        },
      }))
    } catch (err) {
      console.error('Failed to load member data', err)
    }
  }

  useEffect(() => {
    if (isHydrated && user) {
      fetchTransfers()
      loadSelf()
    }
  }, [isHydrated, user])

  useEffect(() => {
    if (!user?.email || transfers.length === 0) return
    const currentUser = user;

    let cancelled = false

    const loadMembers = async () => {
      const uniqueEmails = Array.from(
        new Set(
          transfers
            .filter((transfer) => transfer.email_member_1 === currentUser.email || transfer.email_member_2 === currentUser.email)
            .flatMap((transfer) => [transfer.email_member_1, transfer.email_member_2])
        )
      ).filter(email => email !== currentUser.email && !memberByEmail[email])

      if (uniqueEmails.length === 0) return

      const entries = await Promise.all(
        uniqueEmails.map(async (email) => {
          const response = await fetch(`/api/member/${encodeURIComponent(email)}`)
          if (!response.ok) {
            return null
          }

          const data = await response.json()
          return [
            email,
            {
              email: data.email,
              salutation: data.salutation,
              first_mid_name: data.first_mid_name,
              last_name: data.last_name,
            },
          ] as const
        })
      )

      if (cancelled) return

      const nextMap: Record<string, MemberLookup> = { ...memberByEmail }
      entries.forEach((entry) => {
        if (entry) {
          const [email, member] = entry
          nextMap[email] = member
        }
      })

      setMemberByEmail(nextMap)
    }

    loadMembers().catch((error) => console.error(error))

    return () => {
      cancelled = true
    }
  }, [transfers, user])

  // Saldo is taken directly from server memberData, trigger handles updates
  const sessionMiles = memberData?.award_miles ?? 0

  const filteredTransfers = useMemo(() => {
    if (!user) return []
    const userTransfers = transfers.filter(
      t => t.email_member_1 === user.email || t.email_member_2 === user.email
    )
    const q = search.toLowerCase()
    return userTransfers
      .filter(t => !q || [t.email_member_1, t.email_member_2].some(v => v.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [transfers, user, search])

  const getType = (t: TransferRecord) => (t.email_member_1 === user?.email ? 'Kirim' : 'Terima')

  const getMemberLabel = (email: string) => {
    const member = memberByEmail[email]
    if (!member) return email

    return `${member.salutation} ${member.first_mid_name} ${member.last_name}`.replace(/\s+/g, ' ').trim()
  }

  const getMemberEmailLine = (email: string) => {
    const member = memberByEmail[email]
    return member?.email || email
  }

  const getSignedAmount = (transfer: TransferRecord) => {
    const sign = transfer.email_member_1 === user?.email ? '-' : '+'
    return `${sign}${transfer.jumlah.toLocaleString('id-ID')} miles`
  }

  async function handleSave() {
    if (!form.email_member_2 || !form.jumlah) {
      setFormError('Semua field wajib diisi.')
      return
    }

    if (form.email_member_2.toLowerCase() === user?.email?.toLowerCase()) {
      setFormError('Member tidak dapat mentransfer miles ke dirinya sendiri.')
      return
    }

    const amount = Number(form.jumlah)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Jumlah miles harus lebih dari 0.')
      return
    }

    if (amount > sessionMiles) {
      setFormError('Saldo miles tidak mencukupi.')
      return
    }

    setIsLoading(true)
    setFormError('')
    try {
      // Validate recipient email exists in database
      const memberRes = await fetch(`/api/member/${encodeURIComponent(form.email_member_2)}`)
      if (!memberRes.ok) {
        setFormError('Email penerima tidak ditemukan dalam sistem.')
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_member_1: user?.email,
          email_member_2: form.email_member_2,
          jumlah: amount,
          catatan: form.catatan.trim() || null,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setFormError(result.error || 'Gagal melakukan transfer.')
        return
      }

      await fetchTransfers()
      await loadSelf() // refresh saldo
      updateProfile({ awardMiles: sessionMiles - amount }) // optimistic or just let next fetch handle it

      setModalMode(null)
      setForm(EMPTY_FORM)
      setFormError('')
    } catch (err) {
      console.error(err)
      setFormError('Gagal melakukan transfer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <p className="text-sm text-white/70">Memuat…</p>
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

  const stats = [
    { label: 'Saldo Miles', value: sessionMiles, accent: 'from-blue-500 to-cyan-500' },
    { label: 'Total Transfer', value: filteredTransfers.length, accent: 'from-emerald-500 to-green-500' },
    { label: 'Nominal Terkirim', value: transfers.filter(t => t.email_member_1 === user.email).reduce((acc, t) => acc + t.jumlah, 0), accent: 'from-violet-500 to-fuchsia-500' },
  ]

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transfer Miles</h1>
            <p className="mt-1 text-sm text-white/70">Kirim dan terima miles dengan member lain</p>
          </div>
          <button
            onClick={() => {
              setForm(EMPTY_FORM)
              setModalMode('add')
              setFormError('')
            }}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
          >
            + Transfer Miles
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {stats.map(s => (
            <div key={s.label} className="overflow-hidden rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10">
              <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${s.accent}`} />
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">{s.label}</div>
              <div className="mt-2 text-3xl font-bold">{s.value.toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-2xl bg-white/95 p-4 shadow-lg">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari email member…"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-xl shadow-slate-950/10 ring-1 ring-slate-200/70">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-800">Riwayat Transfer</h2>
            <p className="mt-1 text-sm text-slate-500">Daftar transaksi terbaru tampil dari yang paling baru.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Tipe</th>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Jumlah</th>
                  <th className="px-5 py-4">Catatan</th>
                  <th className="px-5 py-4">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-400">Belum ada transfer miles.</td>
                  </tr>
                ) : (
                  filteredTransfers.map((t, idx) => {
                    const otherEmail = t.email_member_1 === user?.email ? t.email_member_2 : t.email_member_1
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <span className={getType(t) === 'Kirim' ? 'font-bold text-red-500' : 'font-bold text-green-500'}>
                            {getType(t)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-slate-800">{getMemberLabel(otherEmail)}</div>
                          <div className="text-xs text-slate-500">{getMemberEmailLine(otherEmail)}</div>
                        </td>
                        <td className={`px-5 py-4 font-semibold ${t.email_member_1 === user?.email ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {getSignedAmount(t)}
                        </td>
                        <td className="px-5 py-4 text-slate-500">{t.catatan || '-'}</td>
                        <td className="px-5 py-4 text-slate-500">{formatDateTime(t.timestamp)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL ADD TRANSFER */}
      {modalMode === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-slate-800">Transfer Miles</h2>

            <div className="space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Pengirim (Email Anda)</span>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Penerima (Email Tujuan)</span>
                <input
                  type="email"
                  value={form.email_member_2}
                  onChange={e => setForm({ ...form, email_member_2: e.target.value })}
                  placeholder="Masukkan email member penerima"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Jumlah Miles</span>
                  <input
                    type="number"
                    min="1"
                    value={form.jumlah}
                    onChange={e => setForm({ ...form, jumlah: e.target.value })}
                    placeholder="Masukkan jumlah miles"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Saldo Anda</span>
                  <input
                    type="text"
                    value={`${sessionMiles.toLocaleString('id-ID')} miles`}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Catatan (Opsional)</span>
                <textarea
                  rows={3}
                  value={form.catatan}
                  onChange={e => setForm({ ...form, catatan: e.target.value })}
                  placeholder="Tambahkan catatan untuk penerima…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>

            {formError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalMode(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Memproses…' : 'Kirim Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
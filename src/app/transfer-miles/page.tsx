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
  const [transfers, setTransfers] = useState<TransferRecord[]>([])
  const [recipientEmail, setRecipientEmail] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [catatan, setCatatan] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const sessionMiles = user?.totalMiles ?? 0

  const fetchTransfers = async () => {
    if (!user?.email) return
    try {
      const res = await fetch(`/api/transfer?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const data = await res.json()
        setTransfers(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!isHydrated || !user?.email) return
    fetchTransfers()
  }, [isHydrated, user?.email])

  const filteredTransfers = useMemo(() => {
    return transfers
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [transfers])

  const getType = (t: TransferRecord) => {
    if (t.email_member_1 === user?.email) return 'Kirim'
    return 'Terima'
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-6">
        <p className="text-sm text-white/70">Memuat halaman transfer miles…</p>
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

  async function handleSubmit() {
    if (!recipientEmail || !jumlah) {
      setFormError('Semua field wajib diisi.')
      return
    }

    if (recipientEmail.toLowerCase() === user?.email?.toLowerCase()) {
      setFormError('Member tidak dapat mentransfer miles ke dirinya sendiri.')
      return
    }

    const amount = Number(jumlah)

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Jumlah miles harus lebih dari 0.')
      return
    }

    if (amount > sessionMiles) {
      setFormError('Saldo miles tidak mencukupi.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_member_1: user?.email,
          email_member_2: recipientEmail,
          jumlah: amount,
          catatan: catatan.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Gagal melakukan transfer.')
        return
      }

      setRecipientEmail('')
      setJumlah('')
      setCatatan('')
      setFormError('')
      await fetchTransfers()
    } catch (err) {
      console.error(err)
      setFormError('Gagal melakukan transfer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transfer Miles</h1>
            <p className="mt-1 text-sm text-white/70">Form transfer antar member</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: 'Saldo Miles (Session)', value: sessionMiles, accent: 'from-blue-500 to-cyan-500' },
            { label: 'Total Transfer', value: transfers.length, accent: 'from-emerald-500 to-green-500' },
            { label: 'Nominal Terkirim', value: transfers.reduce((acc, t) => acc + t.jumlah, 0), accent: 'from-violet-500 to-fuchsia-500' },
          ].map((stat) => (
            <div key={stat.label} className="overflow-hidden rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10">
              <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${stat.accent}`} />
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</div>
              <div className="mt-2 text-3xl font-bold">{stat.value.toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white/95 p-6 shadow-xl shadow-slate-950/10 ring-1 ring-slate-200/70">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">Form Transfer Miles</h2>
              <p className="mt-1 text-sm text-slate-500">Pastikan penerima bukan akun yang sama dan email tujuan valid.</p>
            </div>

            <div className="space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Pengirim</span>
                <input value={user?.email ?? '-'} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none" />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Penerima (Email)</span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="Masukkan email member tujuan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Jumlah Miles</span>
                  <input
                    type="number"
                    min="1"
                    value={jumlah}
                    onChange={(event) => setJumlah(event.target.value)}
                    placeholder="Masukkan jumlah miles"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Saldo Miles</span>
                  <input value={`${sessionMiles.toLocaleString('id-ID')} miles`} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none" />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Catatan</span>
                <textarea
                  rows={4}
                  value={catatan}
                  onChange={(event) => setCatatan(event.target.value)}
                  placeholder="Tambahkan catatan transfer jika diperlukan…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>

            {formError ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{formError}</p> : null}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Kirim Transfer'}
              </button>
            </div>
          </div>
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
                  <th className="px-5 py-4">Pengirim</th>
                  <th className="px-5 py-4">Penerima</th>
                  <th className="px-5 py-4">Jumlah</th>
                  <th className="px-5 py-4">Catatan</th>
                  <th className="px-5 py-4">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">Belum ada transfer miles yang tercatat.</td>
                  </tr>
                ) : (
                  filteredTransfers.map((transfer, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <span className={getType(transfer) === 'Kirim' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                          {getType(transfer)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{transfer.email_member_1}</td>
                      <td className="px-5 py-4 text-slate-700">{transfer.email_member_2}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{transfer.jumlah.toLocaleString('id-ID')} miles</td>
                      <td className="px-5 py-4 text-slate-500">{transfer.catatan || '-'}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDateTime(transfer.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
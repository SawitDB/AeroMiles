'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'

const COUNTRY_CODES = ['+62', '+1', '+44']
const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']
const MASKAPAI = [
  { code: 'GA', name: 'Garuda Indonesia' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'QR', name: 'Qatar Airways' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isHydrated } = useAuth()

  const [role, setRole] = useState<'member' | 'staf' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [salutation, setSalutation] = useState(SALUTATIONS[0])
  const [firstMid, setFirstMid] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [nationality, setNationality] = useState('')
  const [kodeMaskapai, setKodeMaskapai] = useState(MASKAPAI[0].code)
  const [error, setError] = useState<string | null>(null)

  function handleRegister(e?: FormEvent) {
    e?.preventDefault()

    if (!role) {
      setError('Pilih role terlebih dahulu')
      return
    }

    if (!email.trim() || !password || !confirm || !firstMid.trim() || !lastName.trim() || !phone.trim() || !birthDate || !nationality.trim()) {
      setError('Semua field wajib diisi')
      return
    }

    if (password !== confirm) {
      setError('Password dan konfirmasi tidak cocok')
      return
    }

    setError(null)
    register({
      email,
      password,
      salutation,
      firstMidName: firstMid,
      lastName,
      countryCode,
      mobileNumber: phone,
      tanggalLahir: birthDate,
      kewarganegaraan: nationality,
      role,
      kodeMaskapai: role === 'staf' ? kodeMaskapai : undefined,
    })
      .then(() => router.push('/dashboard'))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal registrasi'))
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-slate-500">Memuat...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-start justify-center p-6 py-12">
      <div className="w-full max-w-3xl rounded-2xl bg-white/70 backdrop-blur-lg p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-black">AEROMILES — Registrasi</h1>
        <p className="mt-1 text-center text-sm text-black/80">Pilih role dan lengkapi formulir pendaftaran.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setRole('member')}
              className={`flex-1 rounded-lg border p-4 text-left ${role === 'member' ? 'border-primary bg-primary/10' : 'border-white/10'}`}
            >
              <div className="text-lg font-semibold text-black">Daftar sebagai Member</div>
              <div className="mt-1 text-sm text-black/80">Akses program miles untuk pelanggan.</div>
            </button>

            <button
              onClick={() => setRole('staf')}
              className={`flex-1 rounded-lg border p-4 text-left ${role === 'staf' ? 'border-primary bg-primary/10' : 'border-white/10'}`}
            >
              <div className="text-lg font-semibold text-black">Daftar sebagai Staf</div>
              <div className="mt-1 text-sm text-black/80">Akun staf untuk mengelola sistem.</div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-black/80">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Salutation</label>
              <select value={salutation} onChange={(e) => setSalutation(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black">
                {SALUTATIONS.map((s) => (
                  <option key={s} value={s} className="bg-secondary">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-black/80">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Konfirmasi Password</label>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Nama Depan-Tengah</label>
              <input value={firstMid} onChange={(e) => setFirstMid(e.target.value)} type="text" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Nama Belakang</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Country Code</label>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black">
                {COUNTRY_CODES.map((c) => (
                  <option key={c} value={c} className="bg-secondary">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-black/80">Nomor HP</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Tanggal Lahir</label>
              <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" max={todayISO()} className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            <div>
              <label className="block text-sm text-black/80">Kewarganegaraan</label>
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} type="text" className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black" />
            </div>

            {role === 'staf' ? (
              <div>
                <label className="block text-sm text-black/80">Kode Maskapai</label>
                <select value={kodeMaskapai} onChange={(e) => setKodeMaskapai(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-black">
                  {MASKAPAI.map((m) => (
                    <option key={m.code} value={m.code} className="bg-secondary">
                      {m.code} — {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {error ? <p className="md:col-span-2 text-sm text-rose-500">{error}</p> : null}

            <div className="md:col-span-2 mt-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  Daftar
                </button>
              </div>
              <div>
                <Link href="/login" className="inline-flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-black">
                  Kembali ke Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
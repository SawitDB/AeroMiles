'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type UserRecord = Record<string, any>

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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const usersKey = 'aeromiles_users'

  const existingUsers = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(usersKey) : null
      return raw ? (JSON.parse(raw) as UserRecord[]) : []
    } catch {
      return []
    }
  }, [])

  function validateAll() {
    const e: Record<string, string> = {}
    if (!role) e.role = 'Pilih role pendaftaran'
    if (!email.trim()) e.email = 'Email wajib diisi'
    if (!password) e.password = 'Password wajib diisi'
    if (!confirm) e.confirm = 'Konfirmasi password wajib diisi'
    if (password && confirm && password !== confirm) e.confirm = 'Password tidak cocok'
    if (!firstMid) e.firstMid = 'Nama depan / tengah wajib diisi'
    if (!lastName) e.lastName = 'Nama belakang wajib diisi'
    if (!phone) e.phone = 'Nomor HP wajib diisi'
    if (!birthDate) e.birthDate = 'Tanggal lahir wajib diisi'
    else if (new Date(birthDate) >= new Date()) e.birthDate = 'Tanggal lahir harus di masa lalu'
    if (!nationality) e.nationality = 'Kewarganegaraan wajib diisi'

    // email uniqueness
    if (email) {
      const exists = existingUsers.some((u) => String(u.email).toLowerCase() === email.toLowerCase())
      if (exists) e.email = 'Email sudah terdaftar'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function genMemberNumber() {
    const count = existingUsers.filter((u) => u.role === 'member').length
    const next = count + 1
    return `M${String(next).padStart(4, '0')}`
  }

  function genStafId() {
    const count = existingUsers.filter((u) => u.role === 'staf').length
    const next = count + 1
    return `S${String(next).padStart(4, '0')}`
  }

  function saveUser(user: UserRecord) {
    try {
      const raw = window.localStorage.getItem(usersKey)
      const list = raw ? (JSON.parse(raw) as UserRecord[]) : []
      list.push(user)
      window.localStorage.setItem(usersKey, JSON.stringify(list))
    } catch {
      // ignore
    }
  }

  async function handleRegister(e?: FormEvent) {
    e?.preventDefault()
    if (!validateAll()) return
    setSubmitting(true)

    const hashed = 'hashed_' + password

    if (role === 'member') {
      const user: UserRecord = {
        email,
        password: hashed,
        role: 'member',
        salutation,
        first_mid_name: firstMid,
        last_name: lastName,
        country_code: countryCode,
        phone,
        tanggal_lahir: birthDate,
        kewarganegaraan: nationality,
        id_tier: 'BLUE',
        nomor_member: genMemberNumber(),
        tanggal_bergabung: todayISO(),
      }
      saveUser(user)
    } else if (role === 'staf') {
      const user: UserRecord = {
        email,
        password: hashed,
        role: 'staf',
        salutation,
        first_mid_name: firstMid,
        last_name: lastName,
        country_code: countryCode,
        phone,
        tanggal_lahir: birthDate,
        kewarganegaraan: nationality,
        kode_maskapai: kodeMaskapai,
        id_staf: genStafId(),
      }
      saveUser(user)
    }

    setSuccessMsg('Registrasi berhasil — mengarahkan ke halaman login...')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
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
              className={`flex-1 rounded-lg border p-4 text-left ${role === 'member' ? 'border-primary bg-primary/10' : 'border-white/10'}`}>
              <div className="text-lg font-semibold text-black">Daftar sebagai Member</div>
              <div className="mt-1 text-sm text-black/80">Akses program miles untuk pelanggan.</div>
            </button>

            <button
              onClick={() => setRole('staf')}
              className={`flex-1 rounded-lg border p-4 text-left ${role === 'staf' ? 'border-primary bg-primary/10' : 'border-white/10'}`}>
              <div className="text-lg font-semibold text-black">Daftar sebagai Staf</div>
              <div className="mt-1 text-sm text-black/80">Akun staf untuk mengelola sistem.</div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-black/80">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.email ? <p className="text-sm text-rose-400">{errors.email}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Salutation</label>
              <select value={salutation} onChange={(e) => setSalutation(e.target.value)} className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black">
                {SALUTATIONS.map((s) => (
                  <option key={s} value={s} className="bg-secondary">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-black/80">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.password ? <p className="text-sm text-rose-400">{errors.password}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Konfirmasi Password</label>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.confirm ? <p className="text-sm text-rose-400">{errors.confirm}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Nama Depan-Tengah</label>
              <input value={firstMid} onChange={(e) => setFirstMid(e.target.value)} type="text" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.firstMid ? <p className="text-sm text-rose-400">{errors.firstMid}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Nama Belakang</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.lastName ? <p className="text-sm text-rose-400">{errors.lastName}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Country Code</label>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black">
                {COUNTRY_CODES.map((c) => (
                  <option key={c} value={c} className="bg-secondary">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-black/80">Nomor HP</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.phone ? <p className="text-sm text-rose-400">{errors.phone}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Tanggal Lahir</label>
              <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" max={todayISO()} className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.birthDate ? <p className="text-sm text-rose-400">{errors.birthDate}</p> : null}
            </div>

            <div>
              <label className="block text-sm text-black/80">Kewarganegaraan</label>
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} type="text" className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black" />
              {errors.nationality ? <p className="text-sm text-rose-400">{errors.nationality}</p> : null}
            </div>

            {role === 'staf' ? (
              <div>
                <label className="block text-sm text-black/80">Kode Maskapai</label>
                <select value={kodeMaskapai} onChange={(e) => setKodeMaskapai(e.target.value)} className="mt-1 w-full rounded-md bg-transparent border border-white/10 px-3 py-2 text-black">
                  {MASKAPAI.map((m) => (
                    <option key={m.code} value={m.code} className="bg-secondary">{m.code} — {m.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="md:col-span-2 mt-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <button type="submit" onClick={handleRegister} disabled={submitting} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  {submitting ? 'MEMPROSES...' : 'Daftar'}
                </button>
              </div>
              <div>
                <Link href="/login" className="inline-flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-black">
                  Kembali ke Login
                </Link>
              </div>
            </div>
          </form>

          {successMsg ? <div className="mt-3 rounded-md bg-green-600/20 p-3 text-sm text-green-200">{successMsg}</div> : null}
        </div>
      </div>
    </main>
  )
}

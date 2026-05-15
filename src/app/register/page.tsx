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
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fc]">
        <p className="text-sm text-slate-500">Memuat...</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7fc]">
      {/* MAIN CONTENT */}
      <main className="flex justify-center py-12 px-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-sm border border-gray-100">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">AEROMILES</h1>
            <p className="mt-2 text-sm text-gray-500">Pilih peran Anda dan lengkapi formulir pendaftaran.</p>
          </header>

          {/* ROLE SELECTION */}
          <div className="flex gap-4 mb-10">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`flex-1 rounded-xl border-2 p-5 text-left transition-all ${
                role === 'member' 
                ? 'border-blue-600 bg-blue-50/30' 
                : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="text-lg font-bold text-blue-800">Daftar sebagai Member</div>
              <div className="text-sm text-gray-500">Akses program miles untuk pelanggan.</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('staf')}
              className={`flex-1 rounded-xl border-2 p-5 text-left transition-all ${
                role === 'staf' 
                ? 'border-blue-600 bg-blue-50/30' 
                : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="text-lg font-bold text-gray-800">Daftar sebagai Staf</div>
              <div className="text-sm text-gray-500">Akun staf untuk mengelola sistem.</div>
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                placeholder="Email"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Salutation</label>
              <select 
                value={salutation} 
                onChange={(e) => setSalutation(e.target.value)} 
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-blue-400 appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                {SALUTATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="Password"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Konfirmasi Password</label>
              <input 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                type="password" 
                placeholder="Konfirmasi Password"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Nama Depan-Tengah</label>
              <input 
                value={firstMid} 
                onChange={(e) => setFirstMid(e.target.value)} 
                type="text" 
                placeholder="First Mid Name"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Nama Belakang</label>
              <input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                type="text" 
                placeholder="Last Name"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Country Code</label>
              <select 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)} 
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-blue-400 appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Nomor HP</label>
              <input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                type="tel" 
                placeholder="8123456789"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Tanggal Lahir</label>
              <input 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                type="date" 
                max={todayISO()} 
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-400 outline-none focus:border-blue-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Kewarganegaraan</label>
              <input 
                value={nationality} 
                onChange={(e) => setNationality(e.target.value)} 
                type="text" 
                placeholder="Indonesia"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-[#edf2f9] px-4 py-2.5 outline-none focus:border-blue-400" 
              />
            </div>

            {role === 'staf' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">Kode Maskapai</label>
                <select 
                  value={kodeMaskapai} 
                  onChange={(e) => setKodeMaskapai(e.target.value)} 
                  className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-blue-400"
                >
                  {MASKAPAI.map((m) => (
                    <option key={m.code} value={m.code}>{m.code} — {m.name}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <p className="md:col-span-2 text-sm text-rose-500 font-medium">{error}</p>}

            <div className="md:col-span-2 mt-6 flex items-center justify-between">
              <Link href="/login" className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Kembali ke Login
              </Link>
              <button 
                type="submit" 
                className="rounded-xl bg-[#4c51bf] px-10 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-[#434190] transition-colors"
              >
                Daftar Sekarang
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
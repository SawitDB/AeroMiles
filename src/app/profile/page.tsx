'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { useAuth } from '@/components/AuthProvider'

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']
const COUNTRY_CODES = ['+62', '+1', '+44', '+81', '+65', '+60', '+61', '+49', '+33', '+86']
const KEWARGANEGARAAN = [
  'Indonesia', 'Malaysia', 'Singapura', 'Filipina', 'Thailand',
  'Vietnam', 'Australia', 'Amerika Serikat', 'Inggris', 'Jepang',
  'Korea Selatan', 'China', 'India', 'Jerman', 'Perancis',
]
const MASKAPAI_OPTIONS = [
  { kode: 'GA', nama: 'Garuda Indonesia' },
  { kode: 'SQ', nama: 'Singapore Airlines' },
  { kode: 'MH', nama: 'Malaysia Airlines' },
  { kode: 'TG', nama: 'Thai Airways' },
  { kode: 'CX', nama: 'Cathay Pacific' },
]

export default function ProfilePage() {
  const { user, isHydrated } = useRequireAuth()
  const { updateProfile, updatePassword } = useAuth()

  const [salutation, setSalutation] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState('+62')
  const [mobileNumber, setMobileNumber] = useState('')
  const [kewarganegaraan, setKewarganegaraan] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [kodeMaskapai, setKodeMaskapai] = useState('')

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setSalutation(user.salutation ?? 'Mr.')
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setCountryCode(user.countryCode ?? '+62')
    setMobileNumber(user.mobileNumber ?? '')
    setKewarganegaraan(user.kewarganegaraan ?? '')
    setTanggalLahir(user.tanggalLahir ?? '')
    setKodeMaskapai(user.kodeMaskapai ?? '')
  }, [user])

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    try {
      updateProfile({
        salutation,
        firstName,
        lastName,
        countryCode,
        mobileNumber,
        kewarganegaraan,
        tanggalLahir,
        ...(user?.role === 'staf' ? { kodeMaskapai } : {}),
        name: `${salutation} ${firstName} ${lastName}`,
      })
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui.' })
    } catch {
      setProfileMsg({ type: 'error', text: 'Gagal memperbarui profil.' })
    }
    setProfileLoading(false)
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok.' })
      return
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' })
      return
    }
    setPwLoading(true)
    if (oldPassword !== 'password123') {
      setPwMsg({ type: 'error', text: 'Password lama tidak sesuai.' })
      setPwLoading(false)
      return
    }
    updatePassword(newPassword)
    setPwMsg({ type: 'success', text: 'Password berhasil diubah.' })
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordForm(false)
    setPwLoading(false)
  }

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-slate-500">Memuat...</p>
      </main>
    )
  }

  const isMember = user.role === 'member'
  const isStaf = user.role === 'staf'

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Profil</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola informasi pribadi akun Anda</p>
        </div>

        {/* ── Form Profil ── */}
        <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Data Profil</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-600">Email</label>
              <input value={user.email} disabled
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
            </div>

            {isMember && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Nomor Member</label>
                  <input value={user.nomorMember ?? '-'} disabled
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Tanggal Bergabung</label>
                  <input value={user.tanggalBergabung ?? '-'} disabled
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                </div>
              </div>
            )}

            {isStaf && (
              <div>
                <label className="block text-sm font-medium text-slate-600">ID Staf</label>
                <input value={user.idStaf ?? '-'} disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Salutation <span className="text-red-500">*</span></label>
              <select value={salutation} onChange={e => setSalutation(e.target.value)} required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20">
                {SALUTATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Depan (& Tengah) <span className="text-red-500">*</span></label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                  placeholder="cth: John William"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Belakang <span className="text-red-500">*</span></label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} required
                  placeholder="cth: Doe"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Kewarganegaraan <span className="text-red-500">*</span></label>
              <select value={kewarganegaraan} onChange={e => setKewarganegaraan(e.target.value)} required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20">
                <option value="">Pilih negara</option>
                {KEWARGANEGARAAN.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Country Code <span className="text-red-500">*</span></label>
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary">
                  {COUNTRY_CODES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700">Nomor HP <span className="text-red-500">*</span></label>
                <input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required
                  placeholder="81234567890"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Tanggal Lahir <span className="text-red-500">*</span></label>
              <input type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
            </div>

            {isStaf && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Kode Maskapai <span className="text-red-500">*</span></label>
                <select value={kodeMaskapai} onChange={e => setKodeMaskapai(e.target.value)} required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20">
                  <option value="">Pilih maskapai</option>
                  {MASKAPAI_OPTIONS.map(m => (
                    <option key={m.kode} value={m.kode}>{m.kode} - {m.nama}</option>
                  ))}
                </select>
              </div>
            )}

            {profileMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                profileMsg.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <button type="submit" disabled={profileLoading}
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-white hover:bg-secondary/90 disabled:opacity-70">
              {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* ── Ubah Password ── */}
        <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Ubah Password</h2>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)}
                className="rounded-xl border border-secondary px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/5">
                Ubah Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Password Lama <span className="text-red-500">*</span></label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required
                  placeholder="Masukkan password lama"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password Baru <span className="text-red-500">*</span></label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                  placeholder="Minimal 6 karakter"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Konfirmasi Password Baru <span className="text-red-500">*</span></label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  placeholder="Ulangi password baru"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
              </div>

              {pwMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                  pwMsg.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {pwMsg.text}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowPasswordForm(false); setPwMsg(null) }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={pwLoading}
                  className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-bold text-white hover:bg-secondary/90 disabled:opacity-70">
                  {pwLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </main>
  )
}
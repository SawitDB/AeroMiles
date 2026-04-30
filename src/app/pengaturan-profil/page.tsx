'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type SessionData = {
  email: string
  role?: 'member' | 'staf'
  salutation?: string
  first_mid_name?: string
  last_name?: string
  country_code?: string
  mobile_number?: string
  kewarganegaraan?: string
  tanggal_lahir?: string
  nomor_member?: string
  tanggal_bergabung?: string
  id_staf?: string
  kode_maskapai?: string
}

type UserRecord = SessionData & { password?: string; id_tier?: string }

const COUNTRY_CODES = ['+62', '+1', '+44']
const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.']
const MASKAPAI = [
  { code: 'GA', name: 'Garuda Indonesia' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'QR', name: 'Qatar Airways' },
]

const SESSION_KEY = 'aeromiles_session'
const USERS_KEY = 'aeromiles_users'
const SESSION_CHANGED_EVENT = 'aeromiles_session_changed'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function seedUsersIfMissing() {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(USERS_KEY)) return

  const seed: UserRecord[] = [
    {
      email: 'member@aeromiles.com',
      password: 'member123',
      role: 'member',
      salutation: 'Mr.',
      first_mid_name: 'Aero',
      last_name: 'Miles',
      country_code: '+62',
      mobile_number: '81234567890',
      kewarganegaraan: 'Indonesia',
      tanggal_lahir: '1995-01-01',
      id_tier: 'BLUE',
      nomor_member: 'M0001',
      tanggal_bergabung: '2026-04-30',
    },
    {
      email: 'staf@aeromiles.com',
      password: 'staf123',
      role: 'staf',
      salutation: 'Ms.',
      first_mid_name: 'Aero',
      last_name: 'Staff',
      country_code: '+62',
      mobile_number: '81234567891',
      kewarganegaraan: 'Indonesia',
      tanggal_lahir: '1993-01-01',
      id_staf: 'S0001',
      kode_maskapai: 'GA',
    },
  ]

  window.localStorage.setItem(USERS_KEY, JSON.stringify(seed))
}

function readSession() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SessionData
  } catch {
    return null
  }
}

function loadUsers() {
  if (typeof window === 'undefined') return [] as UserRecord[]
  seedUsersIfMissing()

  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as UserRecord[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: UserRecord[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function emitSessionChange() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

export default function ProfilePage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [session, setSession] = useState<SessionData | null>(null)
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [salutation, setSalutation] = useState('Mr.')
  const [firstMidName, setFirstMidName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState('+62')
  const [mobileNumber, setMobileNumber] = useState('')
  const [kewarganegaraan, setKewarganegaraan] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [kodeMaskapai, setKodeMaskapai] = useState('GA')

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    seedUsersIfMissing()
    const currentSession = readSession()
    if (!currentSession) {
      router.replace('/login')
      return
    }

    const users = loadUsers()
    const matched = users.find((entry) => entry.email.toLowerCase() === currentSession.email.toLowerCase()) ?? null

    setSession(currentSession)
    setUserRecord(matched)
    setSalutation(matched?.salutation ?? currentSession.salutation ?? 'Mr.')
    setFirstMidName(matched?.first_mid_name ?? currentSession.first_mid_name ?? '')
    setLastName(matched?.last_name ?? currentSession.last_name ?? '')
    setCountryCode(matched?.country_code ?? currentSession.country_code ?? '+62')
    setMobileNumber(matched?.mobile_number ?? currentSession.mobile_number ?? '')
    setKewarganegaraan(matched?.kewarganegaraan ?? currentSession.kewarganegaraan ?? '')
    setTanggalLahir(matched?.tanggal_lahir ?? currentSession.tanggal_lahir ?? '')
    setKodeMaskapai(matched?.kode_maskapai ?? currentSession.kode_maskapai ?? 'GA')
    setLoaded(true)
  }, [router])

  const fullName = useMemo(() => {
    if (!session) return ''
    return [salutation, firstMidName, lastName].filter(Boolean).join(' ')
  }, [firstMidName, lastName, salutation, session])

  function showMessage(text: string, type: 'success' | 'error') {
    setMessage(text)
    setMessageType(type)
  }

  function validateProfile() {
    const nextErrors: Record<string, string> = {}

    if (!salutation) nextErrors.salutation = 'Salutation wajib diisi'
    if (!firstMidName.trim()) nextErrors.firstMidName = 'Nama depan-tengah wajib diisi'
    if (!lastName.trim()) nextErrors.lastName = 'Nama belakang wajib diisi'
    if (!countryCode) nextErrors.countryCode = 'Country code wajib diisi'
    if (!mobileNumber.trim()) nextErrors.mobileNumber = 'Nomor HP wajib diisi'
    if (!kewarganegaraan.trim()) nextErrors.kewarganegaraan = 'Kewarganegaraan wajib diisi'
    if (!tanggalLahir) nextErrors.tanggalLahir = 'Tanggal lahir wajib diisi'
    else if (new Date(tanggalLahir) >= new Date()) nextErrors.tanggalLahir = 'Tanggal lahir harus di masa lalu'
    if (session?.role === 'staf' && !kodeMaskapai) nextErrors.kodeMaskapai = 'Kode maskapai wajib diisi'

    setProfileErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    if (!session || !userRecord) return
    if (!validateProfile()) return

    setSaving(true)
    try {
      const users = loadUsers()
      const nextSession: SessionData = {
        ...session,
        salutation,
        first_mid_name: firstMidName,
        last_name: lastName,
        country_code: countryCode,
        mobile_number: mobileNumber,
        kewarganegaraan,
        tanggal_lahir: tanggalLahir,
        role: session.role,
        email: session.email,
      }

      const nextUser: UserRecord = {
        ...userRecord,
        ...nextSession,
        kode_maskapai: session.role === 'staf' ? kodeMaskapai : userRecord.kode_maskapai,
      }

      const nextUsers = users.map((entry) => (entry.email.toLowerCase() === session.email.toLowerCase() ? nextUser : entry))

      if (!nextUsers.some((entry) => entry.email.toLowerCase() === session.email.toLowerCase())) {
        nextUsers.push(nextUser)
      }

      saveUsers(nextUsers)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      setSession(nextSession)
      setUserRecord(nextUser)
      emitSessionChange()
      showMessage('Profil berhasil disimpan.', 'success')
    } catch {
      showMessage('Gagal menyimpan profil.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function validatePassword() {
    const nextErrors: Record<string, string> = {}
    const storedPassword = userRecord?.password ?? ''

    if (!oldPassword) nextErrors.oldPassword = 'Password lama wajib diisi'
    else if (oldPassword !== storedPassword) nextErrors.oldPassword = 'Password lama tidak sesuai'
    if (!newPassword) nextErrors.newPassword = 'Password baru wajib diisi'
    if (!confirmPassword) nextErrors.confirmPassword = 'Konfirmasi password baru wajib diisi'
    if (newPassword && confirmPassword && newPassword !== confirmPassword) nextErrors.confirmPassword = 'Password baru tidak cocok'
    if (oldPassword && newPassword && oldPassword === newPassword) nextErrors.newPassword = 'Password baru harus berbeda dari password lama'

    setPasswordErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (!session || !userRecord) return
    if (!validatePassword()) return

    setPasswordSaving(true)
    try {
      const users = loadUsers()
      const nextUsers = users.map((entry) => {
        if (entry.email.toLowerCase() !== session.email.toLowerCase()) return entry
        return { ...entry, password: newPassword }
      })

      saveUsers(nextUsers)
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...session,
          salutation,
          first_mid_name: firstMidName,
          last_name: lastName,
          country_code: countryCode,
          mobile_number: mobileNumber,
          kewarganegaraan,
          tanggal_lahir: tanggalLahir,
          kode_maskapai: session.role === 'staf' ? kodeMaskapai : session.kode_maskapai,
        }),
      )
      emitSessionChange()
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors({})
      showMessage('Password berhasil diperbarui.', 'success')
    } catch {
      showMessage('Gagal memperbarui password.', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!loaded || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-sm">
          <p className="text-center text-sm text-slate-600">Memuat...</p>
        </div>
      </main>
    )
  }

  const isMember = session.role === 'member'
  const isStaf = session.role === 'staf'

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-secondary-900">Pengaturan Profil</h1>
          <p className="mt-1 text-sm text-slate-600">Edit data profil dan password akun AeroMiles.</p>

          {message ? (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
              {message}
            </div>
          ) : null}

          <form className="mt-6 space-y-6" onSubmit={handleSaveProfile}>
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-800">Edit Profil</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">Salutation</label>
                  <select
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {SALUTATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {profileErrors.salutation ? <p className="mt-1 text-sm text-rose-600">{profileErrors.salutation}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Email</label>
                  <input
                    value={session.email}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Nama Depan-Tengah</label>
                  <input
                    value={firstMidName}
                    onChange={(e) => setFirstMidName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {profileErrors.firstMidName ? <p className="mt-1 text-sm text-rose-600">{profileErrors.firstMidName}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Nama Belakang</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {profileErrors.lastName ? <p className="mt-1 text-sm text-rose-600">{profileErrors.lastName}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Country Code</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {profileErrors.countryCode ? <p className="mt-1 text-sm text-rose-600">{profileErrors.countryCode}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Nomor HP</label>
                  <input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {profileErrors.mobileNumber ? <p className="mt-1 text-sm text-rose-600">{profileErrors.mobileNumber}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Kewarganegaraan</label>
                  <input
                    value={kewarganegaraan}
                    onChange={(e) => setKewarganegaraan(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {profileErrors.kewarganegaraan ? <p className="mt-1 text-sm text-rose-600">{profileErrors.kewarganegaraan}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Tanggal Lahir</label>
                  <input
                    type="date"
                    max={todayISO()}
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {profileErrors.tanggalLahir ? <p className="mt-1 text-sm text-rose-600">{profileErrors.tanggalLahir}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Nomor Member</label>
                  <input
                    value={isMember ? userRecord?.nomor_member ?? '-' : 'Tidak tersedia'}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Tanggal Bergabung</label>
                  <input
                    value={isMember ? userRecord?.tanggal_bergabung ?? '-' : 'Tidak tersedia'}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">ID Staf</label>
                  <input
                    value={isStaf ? userRecord?.id_staf ?? '-' : 'Tidak tersedia'}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                {isStaf ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-800">Kode Maskapai</label>
                    <select
                      value={kodeMaskapai}
                      onChange={(e) => setKodeMaskapai(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {MASKAPAI.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} — {item.name}
                        </option>
                      ))}
                    </select>
                    {profileErrors.kodeMaskapai ? <p className="mt-1 text-sm text-rose-600">{profileErrors.kodeMaskapai}</p> : null}
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary-900 hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'MENYIMPAN...' : 'Simpan Perubahan'}
              </button>
            </section>
          </form>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <button
              type="button"
              onClick={() => setPasswordOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="text-sm font-semibold text-slate-800">Ubah Password</h2>
              <span className="text-sm text-slate-500">{passwordOpen ? 'Tutup' : 'Buka'}</span>
            </button>

            {passwordOpen ? (
              <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">Password Lama</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {passwordErrors.oldPassword ? <p className="mt-1 text-sm text-rose-600">{passwordErrors.oldPassword}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {passwordErrors.newPassword ? <p className="mt-1 text-sm text-rose-600">{passwordErrors.newPassword}</p> : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {passwordErrors.confirmPassword ? <p className="mt-1 text-sm text-rose-600">{passwordErrors.confirmPassword}</p> : null}
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-white hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {passwordSaving ? 'MENYIMPAN...' : 'Ubah Password'}
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}

'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const HARD_CODED_USERS = [
  {
    email: 'member@aeromiles.com',
    password: 'member123',
    role: 'member' as const,
    first_mid_name: 'Aero',
    last_name: 'Miles',
    salutation: 'Mr.',
  },
  {
    email: 'staf@aeromiles.com',
    password: 'staf123',
    role: 'staf' as const,
    first_mid_name: 'Aero',
    last_name: 'Staff',
    salutation: 'Ms.',
  },
]

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    if (!email.trim() || !password) {
      setError('Email dan password harus diisi')
      return false
    }
    setError(null)
    return true
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      let found = null

      if (normalizedEmail === HARD_CODED_USERS[0].email && password === HARD_CODED_USERS[0].password) {
        found = HARD_CODED_USERS[0]
      }

      if (normalizedEmail === HARD_CODED_USERS[1].email && password === HARD_CODED_USERS[1].password) {
        found = HARD_CODED_USERS[1]
      }

      if (!found) {
        setError('Email atau password salah')
        setIsSubmitting(false)
        return
      }

      const session = {
        email: found.email,
        role: found.role,
        salutation: found.salutation,
        first_mid_name: found.first_mid_name,
        last_name: found.last_name,
        name: `${found.first_mid_name} ${found.last_name}`,
        mobile_number: '',
        country_code: '',
        kewarganegaraan: '',
        tanggal_lahir: '',
      }

      window.localStorage.setItem('aeromiles_session', JSON.stringify(session))
      window.dispatchEvent(new Event('aeromiles_session_changed'))
      setIsSubmitting(false)
      router.push('/dashboard')
    } catch (err) {
      setError('Terjadi kesalahan, coba lagi')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur-lg p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-black">AEROMILES</h1>
        <p className="mt-2 text-center text-sm text-black/80">Silakan masuk ke akun Anda</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm text-black/80">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-black/80">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mt-1 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-300 disabled:opacity-60"
            >
              {isSubmitting ? 'MEMPROSES...' : 'Login'}
            </button>

            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-black">
              Registrasi
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

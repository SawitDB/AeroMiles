'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // ensure mock users exist (AuthProvider also seeds, but guard here too)
    try {
      const raw = window.localStorage.getItem('aeromiles_users')
      if (!raw) {
        const seed = [
          { email: 'alice@example.com', password: 'hashed_password1', role: 'member', name: 'Alice Putri', first_mid_name: 'Alice' },
          { email: 'budi@example.com', password: 'hashed_password2', role: 'member', name: 'Budi Santoso', first_mid_name: 'Budi' },
          { email: 'citra@example.com', password: 'hashed_password3', role: 'member', name: 'Citra Dewi', first_mid_name: 'Citra' },
          { email: 'dedi.staf@example.com', password: 'hashed_staff1', role: 'staf', name: 'Dedi Kurnia', first_mid_name: 'Dedi' },
          { email: 'ela.staf@example.com', password: 'hashed_staff2', role: 'staf', name: 'Ela Mariana', first_mid_name: 'Ela' },
        ]
        window.localStorage.setItem('aeromiles_users', JSON.stringify(seed))
      }
    } catch {
      // ignore
    }
  }, [])

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
      const raw = window.localStorage.getItem('aeromiles_users')
      const users = raw ? (JSON.parse(raw) as any[]) : []
      const hashed = 'hashed_' + password
      const found = users.find((u) => u.email === email && u.password === hashed)
      if (!found) {
        setError('Email atau password salah')
        setIsSubmitting(false)
        return
      }

      const session = {
        email: found.email,
        role: found.role,
        name: found.name ?? found.first_mid_name ?? '',
        first_mid_name: found.first_mid_name ?? '',
      }

      window.localStorage.setItem('aeromiles_session', JSON.stringify(session))
      setIsSubmitting(false)
      router.push('/dashboard')
    } catch (err) {
      setError('Terjadi kesalahan, coba lagi')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white/70 backdrop-blur-lg p-6 shadow-sm">
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

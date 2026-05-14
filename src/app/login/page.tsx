'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { login, isHydrated } = useAuth()

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
    login(email, password)
      .then(() => router.push('/dashboard'))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi')
      })
      .finally(() => setIsSubmitting(false))
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-slate-500">Memuat...</p>
      </main>
    )
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
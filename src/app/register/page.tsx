'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { registerMock } = useAuth()

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    registerMock({ name, contact, username })

    setIsSubmitting(false)
    router.push('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-secondary-900">AEROMILES</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Buat Akun Member Baru</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
              Nama Lengkap (Sesuai KTP/Paspor)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-semibold text-slate-800">
              Nomor Telepon / Email
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Masukkan kontak aktif"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-800">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Buat username"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Buat password"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary-900 hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'MEMPROSES...' : 'DAFTAR MEMBER SEKARANG'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-700">
          Sudah punya akun member?{' '}
          <Link href="/login" className="font-semibold text-secondary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  )
}

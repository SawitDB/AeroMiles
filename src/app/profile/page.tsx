'use client'

import { FormEvent, useState } from 'react'

import { useAuth } from '@/components/AuthProvider'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'

export default function ProfilePage() {
  const { user, isHydrated } = useRequireAuth()
  const { updateName } = useAuth()

  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-sm">
          <p className="text-center text-sm text-slate-600">Memuat...</p>
        </div>
      </main>
    )
  }

  const initialName = name || user.name

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    updateName(initialName)

    setIsSubmitting(false)
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-secondary-900">Pengaturan Profil</h1>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-600">NPM (tidak dapat diubah)</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{user.npm}</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={initialName}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary-900 hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

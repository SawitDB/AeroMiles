import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME, verifyJwt } from '@/lib/auth/server'
import { getPublicUserByEmail } from '@/services/authService'

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyJwt(token)

  if (!payload?.email) {
    redirect('/login')
  }

  const user = await getPublicUserByEmail(payload.email)

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-white">
      <h1 className="text-2xl font-semibold">Identitas Saya</h1>

      <div className="mt-6 space-y-3 rounded-xl border border-white/20 p-6">
        <p>
          <strong>Nama:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <p>
          <strong>Nomor Member:</strong> {user.nomorMember ?? '-'}
        </p>

        <p>
          <strong>Tier:</strong> {user.idTier ?? '-'}
        </p>

        <p>
          <strong>Kewarganegaraan:</strong> {user.kewarganegaraan}
        </p>

        <p>
          <strong>No HP:</strong> {user.mobileNumber}
        </p>
      </div>
    </main>
  )
}
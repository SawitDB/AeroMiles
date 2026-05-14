import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, hashPassword, verifyJwt, verifyPassword } from '@/lib/auth/server'
import { query } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)

    const body = (await request.json()) as { oldPassword?: string; newPassword?: string }
    const oldPassword = body.oldPassword ?? ''
    const newPassword = body.newPassword ?? ''

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Password lama dan baru harus diisi' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    const result = await query('SELECT password FROM pengguna WHERE lower(email) = lower($1)', [payload.email])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    const currentHash = result.rows[0].password as string
    const isValid = await verifyPassword(oldPassword, currentHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 401 })
    }

    const newHash = await hashPassword(newPassword)
    await query('UPDATE pengguna SET password = $1 WHERE lower(email) = lower($2)', [newHash, payload.email])

    return NextResponse.json({ data: { message: 'Password berhasil diperbarui' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal mengubah password' }, { status: 500 })
  }
}

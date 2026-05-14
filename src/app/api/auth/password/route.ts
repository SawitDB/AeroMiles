import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, verifyJwt } from '@/lib/auth/server'
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

    const result = await query(
      'SELECT 1 FROM pengguna WHERE lower(email) = lower($1) AND password = crypt($2, password)',
      [payload.email, oldPassword],
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 401 })
    }

    await query(
      'UPDATE pengguna SET password = crypt($1, gen_salt(\'bf\', 10)) WHERE lower(email) = lower($2)',
      [newPassword, payload.email],
    )

    return NextResponse.json({ data: { message: 'Password berhasil diperbarui' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal mengubah password' }, { status: 500 })
  }
}

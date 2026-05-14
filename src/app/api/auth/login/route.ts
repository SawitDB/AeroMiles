import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, signJwt, verifyPassword } from '@/lib/auth/server'
import { getAuthenticatedUserByEmail } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase()
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
    }

    const authUser = await getAuthenticatedUserByEmail(email)
    if (!authUser) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, authUser.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const response = NextResponse.json({ data: authUser.user })
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: signJwt({ email: authUser.user.email, role: authUser.user.role }),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal login' }, { status: 500 })
  }
}
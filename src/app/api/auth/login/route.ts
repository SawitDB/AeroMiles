import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, signJwt } from '@/lib/auth/server'
import { loginUser } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase()
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
    }

    const user = await loginUser(email, password)

    const response = NextResponse.json({ data: user })
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: signJwt({ email: user.email, role: user.role }),
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
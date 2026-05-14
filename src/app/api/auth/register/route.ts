import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, signJwt } from '@/lib/auth/server'
import { createRegisteredUser } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      salutation?: string
      firstMidName?: string
      lastName?: string
      countryCode?: string
      mobileNumber?: string
      tanggalLahir?: string
      kewarganegaraan?: string
      role?: 'member' | 'staf'
      kodeMaskapai?: string
    }

    const email = body.email?.trim().toLowerCase()
    const password = body.password ?? ''
    const salutation = body.salutation?.trim()
    const firstMidName = body.firstMidName?.trim()
    const lastName = body.lastName?.trim()
    const countryCode = body.countryCode?.trim()
    const mobileNumber = body.mobileNumber?.trim()
    const tanggalLahir = body.tanggalLahir?.trim()
    const kewarganegaraan = body.kewarganegaraan?.trim()
    const role = body.role ?? 'member'

    if (!email || !password || !salutation || !firstMidName || !lastName || !countryCode || !mobileNumber || !tanggalLahir || !kewarganegaraan) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const user = await createRegisteredUser({
      email,
      password,
      salutation,
      firstMidName,
      lastName,
      countryCode,
      mobileNumber,
      tanggalLahir,
      kewarganegaraan,
      role,
      kodeMaskapai: body.kodeMaskapai,
    })

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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal registrasi' }, { status: 500 })
  }
}
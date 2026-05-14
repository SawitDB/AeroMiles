import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, verifyJwt } from '@/lib/auth/server'
import { getPublicUserByEmail } from '@/services/authService'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    const user = await getPublicUserByEmail(payload.email)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ data: user })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
import jwt from 'jsonwebtoken'

import type { UserRole } from '@/lib/auth/types'

export const AUTH_COOKIE_NAME = 'token'

type AuthTokenPayload = {
  email: string
  role: UserRole
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not set')
  }

  return secret
}

export function signJwt(payload: AuthTokenPayload, expiresIn: jwt.SignOptions['expiresIn'] = '1h') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

export function verifyJwt(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload & jwt.JwtPayload
}
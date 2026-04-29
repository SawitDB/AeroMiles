import type { AuthState } from './types'

const AUTH_KEY = 'aeromiles.auth'

export function loadAuthState(): AuthState {
  if (typeof window === 'undefined') return { user: null }

  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return { user: null }
    const parsed = JSON.parse(raw) as AuthState
    if (!parsed || typeof parsed !== 'object') return { user: null }
    return { user: parsed.user ?? null }
  } catch {
    return { user: null }
  }
}

export function saveAuthState(state: AuthState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(state))
}

export function clearAuthState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_KEY)
}

const REGISTERED_USERS_KEY = 'aeromiles.registeredUsers'

export type RegisteredUser = {
  name: string
  contact: string
  username: string
}

export function appendRegisteredUser(user: RegisteredUser) {
  if (typeof window === 'undefined') return

  const raw = window.localStorage.getItem(REGISTERED_USERS_KEY)
  const list = raw ? (JSON.parse(raw) as RegisteredUser[]) : []
  const next = Array.isArray(list) ? [...list, user] : [user]
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(next))
}

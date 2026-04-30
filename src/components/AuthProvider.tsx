'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { User } from '@/lib/auth/types'

type AuthContextValue = {
  user: User | null
  isHydrated: boolean
  logout: () => void
  updateName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type SessionData = {
  email: string
  role?: 'member' | 'staf'
  name?: string
  first_mid_name?: string
  last_name?: string
  salutation?: string
}

const SESSION_KEY = 'aeromiles_session'
const USERS_KEY = 'aeromiles_users'
const SESSION_CHANGED_EVENT = 'aeromiles_session_changed'

function seedUsersIfMissing() {
  if (typeof window === 'undefined') return

  const raw = window.localStorage.getItem(USERS_KEY)
  if (raw) return

  const seed = [
    {
      email: 'member@aeromiles.com',
      password: 'member123',
      role: 'member',
      salutation: 'Mr.',
      first_mid_name: 'Aero',
      last_name: 'Miles',
      country_code: '+62',
      mobile_number: '81234567890',
      kewarganegaraan: 'Indonesia',
      tanggal_lahir: '1995-01-01',
      id_tier: 'BLUE',
      nomor_member: 'M0001',
      tanggal_bergabung: '2026-04-30',
    },
    {
      email: 'staf@aeromiles.com',
      password: 'staf123',
      role: 'staf',
      salutation: 'Ms.',
      first_mid_name: 'Aero',
      last_name: 'Staff',
      country_code: '+62',
      mobile_number: '81234567891',
      kewarganegaraan: 'Indonesia',
      tanggal_lahir: '1993-01-01',
      id_staf: 'S0001',
      kode_maskapai: 'GA',
    },
  ]

  window.localStorage.setItem(USERS_KEY, JSON.stringify(seed))
}

function readSessionUser() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const session = JSON.parse(raw) as SessionData
    return {
      name: session.name ?? [session.first_mid_name, session.last_name].filter(Boolean).join(' '),
      npm: session.role === 'staf' ? 'STAFF' : 'MEMBER',
      miles: session.role === 'member' ? 5000 : 0,
    } satisfies User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    seedUsersIfMissing()
    setUser(readSessionUser())
    setIsHydrated(true)

    const handleSessionChanged = () => {
      setUser(readSessionUser())
    }

    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged)
    window.addEventListener('storage', handleSessionChanged)

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged)
      window.removeEventListener('storage', handleSessionChanged)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isHydrated,
      logout: () => {
        setUser(null)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(SESSION_KEY)
          window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
        }
      },
      updateName: (name: string) => {
        setUser((prev) => (prev ? { ...prev, name } : prev))
        if (typeof window !== 'undefined') {
          try {
            const raw = window.localStorage.getItem(SESSION_KEY)
            if (!raw) return
            const session = JSON.parse(raw) as SessionData
            const nextSession = { ...session, name }
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
            window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
          } catch {
            // ignore
          }
        }
      },
    }
  }, [isHydrated, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}

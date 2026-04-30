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
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('aeromiles_session')
        if (raw) {
          const session = JSON.parse(raw) as SessionData
          setUser({
            name: session.name ?? [session.first_mid_name, session.last_name].filter(Boolean).join(' '),
            npm: session.role === 'staf' ? 'STAFF' : 'MEMBER',
            miles: session.role === 'member' ? 5000 : 0,
          })
        }
      } catch {
        setUser(null)
      }
    }
    setIsHydrated(true)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isHydrated,
      logout: () => {
        setUser(null)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('aeromiles_session')
        }
      },
      updateName: (name: string) => {
        setUser((prev) => (prev ? { ...prev, name } : prev))
        if (typeof window !== 'undefined') {
          try {
            const raw = window.localStorage.getItem('aeromiles_session')
            if (!raw) return
            const session = JSON.parse(raw) as SessionData
            const nextSession = { ...session, name }
            window.localStorage.setItem('aeromiles_session', JSON.stringify(nextSession))
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

'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import type { User } from '@/lib/auth/types'
import { appendRegisteredUser, clearAuthState, loadAuthState, saveAuthState } from '@/lib/auth/storage'

type AuthContextValue = {
  user: User | null
  isHydrated: boolean
  loginMock: () => void
  logout: () => void
  updateName: (name: string) => void
  registerMock: (input: { name: string; contact: string; username: string }) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Seed mock users for frontend-only authentication if not present
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('aeromiles_users')
        if (!raw) {
          const seed = [
            { email: 'alice@example.com', password: 'hashed_password1', role: 'member', name: 'Alice Putri', first_mid_name: 'Alice' },
            { email: 'budi@example.com', password: 'hashed_password2', role: 'member', name: 'Budi Santoso', first_mid_name: 'Budi' },
            { email: 'citra@example.com', password: 'hashed_password3', role: 'member', name: 'Citra Dewi', first_mid_name: 'Citra' },
            { email: 'dedi.staf@example.com', password: 'hashed_staff1', role: 'staf', name: 'Dedi Kurnia', first_mid_name: 'Dedi' },
            { email: 'ela.staf@example.com', password: 'hashed_staff2', role: 'staf', name: 'Ela Mariana', first_mid_name: 'Ela' },
          ]
          window.localStorage.setItem('aeromiles_users', JSON.stringify(seed))
        }
      } catch {
        // ignore
      }
    }

    const state = loadAuthState()
    setUser(state.user)
    setIsHydrated(true)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isHydrated,
      loginMock: () => {
        const nextUser: User = { name: 'Sean Marcello', npm: '2406401792', miles: 5000 }
        setUser(nextUser)
        saveAuthState({ user: nextUser })
      },
      logout: () => {
        setUser(null)
        clearAuthState()
      },
      updateName: (name: string) => {
        setUser((prev) => {
          if (!prev) return prev
          const nextUser = { ...prev, name }
          saveAuthState({ user: nextUser })
          return nextUser
        })
      },
      registerMock: ({ name, contact, username }) => {
        appendRegisteredUser({ name, contact, username })
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

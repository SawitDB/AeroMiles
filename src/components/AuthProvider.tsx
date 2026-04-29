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

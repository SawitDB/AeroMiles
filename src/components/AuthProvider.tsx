'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@/lib/auth/types'
import { clearAuthState, loadAuthState, saveAuthState } from '@/lib/auth/storage'

type AuthContextValue = {
  user: User | null
  isHydrated: boolean
  loginMock: (email?: string, role?: 'member' | 'staf') => void
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  updatePassword: (newPassword: string) => void
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

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isHydrated,

    loginMock: (email = 'john@example.com', role = 'member') => {
      const nextUser: User =
        role === 'staf'
          ? {
              email: 'admin@aeromiles.com',
              name: 'Mr. Admin Aero',
              salutation: 'Mr.',
              firstName: 'Admin',
              lastName: 'Aero',
              countryCode: '+62',
              mobileNumber: '81111111111',
              tanggalLahir: '1988-01-01',
              kewarganegaraan: 'Indonesia',
              role: 'staf',
              idStaf: 'S0001',
              kodeMaskapai: 'GA',
            }
          : {
              email,
              name: 'Mr. John William Doe',
              salutation: 'Mr.',
              firstName: 'John William',
              lastName: 'Doe',
              countryCode: '+62',
              mobileNumber: '81234567890',
              tanggalLahir: '1990-05-15',
              kewarganegaraan: 'Indonesia',
              role: 'member',
              nomorMember: 'M0001',
              idTier: 'Gold',
              tanggalBergabung: '2024-01-15',
              awardMiles: 32000,
              totalMiles: 45000,
            }
      setUser(nextUser)
      saveAuthState({ user: nextUser })
    },

    logout: () => {
      setUser(null)
      clearAuthState()
    },

    updateProfile: (updates: Partial<User>) => {
      setUser(prev => {
        if (!prev) return prev
        const next = { ...prev, ...updates }
        saveAuthState({ user: next })
        return next
      })
    },

    updatePassword: (_newPassword: string) => {
      // Mock: password tidak benar-benar disimpan di localStorage
      console.log('Password updated (mock)')
    },

    registerMock: ({ name, contact, username }) => {
      console.log('Register mock:', { name, contact, username })
    },
  }), [isHydrated, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { User } from '@/lib/auth/types'

export type RegisterInput = {
  email: string
  password: string
  salutation: string
  firstMidName: string
  lastName: string
  countryCode: string
  mobileNumber: string
  tanggalLahir: string
  kewarganegaraan: string
  role: 'member' | 'staf'
  kodeMaskapai?: string
}

type AuthContextValue = {
  user: User | null
  isHydrated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)



async function readJsonResponse(response: Response) {
  const body = (await response.json().catch(() => null)) as { data?: User; error?: string } | null

  if (!response.ok) {
    throw new Error(body?.error ?? 'Terjadi kesalahan')
  }

  return body?.data ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!mounted) return

        if (response.ok) {
          const data = await readJsonResponse(response)
          setUser(data)
        } else {
          setUser(null)
        }
      } catch {
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) setIsHydrated(true)
      }
    }

    hydrate()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await readJsonResponse(response)
    setUser(data)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })

    const data = await readJsonResponse(response)
    setUser(data)
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      return { ...prev, ...updates }
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isHydrated,
    login,
    register,
    logout,
    updateProfile,
  }), [isHydrated, login, logout, register, updateProfile, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@/lib/auth/types'

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

type SessionData = {
  email: string
  role?: 'member' | 'staf'
  name?: string
  first_mid_name?: string
  last_name?: string
  salutation?: string
  country_code?: string
  mobile_number?: string
  kewarganegaraan?: string
  tanggal_lahir?: string
  nomor_member?: string
  id_tier?: string
  tanggal_bergabung?: string
  award_miles?: number
  total_miles?: number
  id_staf?: string
  kode_maskapai?: string
}

const SESSION_KEY = 'aeromiles_session'
const USERS_KEY = 'aeromiles_users'
const CLAIMS_KEY = 'aeromiles_claim_missing_miles'
const TRANSFERS_KEY = 'aeromiles_transfer'
const SESSION_CHANGED_EVENT = 'aeromiles_session_changed'

type StoredUser = {
  email: string
  password: string
  role: 'member' | 'staf'
  salutation: string
  first_mid_name: string
  last_name: string
  country_code: string
  mobile_number: string
  kewarganegaraan: string
  tanggal_lahir: string
  nomor_member?: string
  id_tier?: string
  tanggal_bergabung?: string
  award_miles?: number
  total_miles?: number
  id_staf?: string
  kode_maskapai?: string
}

function seedUsersIfMissing() {
  if (typeof window === 'undefined') return

  const raw = window.localStorage.getItem(USERS_KEY)
  if (raw) return

  const seed: StoredUser[] = [
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
    const name = session.name ?? [session.salutation, session.first_mid_name, session.last_name].filter(Boolean).join(' ')

    return {
      email: session.email,
      name,
      salutation: session.salutation ?? 'Mr.',
      firstName: session.first_mid_name ?? '',
      lastName: session.last_name ?? '',
      countryCode: session.country_code ?? '+62',
      mobileNumber: session.mobile_number ?? '',
      tanggalLahir: session.tanggal_lahir ?? '',
      kewarganegaraan: session.kewarganegaraan ?? '',
      role: session.role ?? 'member',
      nomorMember: session.nomor_member,
      idTier: session.id_tier,
      tanggalBergabung: session.tanggal_bergabung,
      awardMiles: session.award_miles,
      totalMiles: session.total_miles,
      idStaf: session.id_staf,
      kodeMaskapai: session.kode_maskapai,
      npm: session.role === 'staf' ? 'STAFF' : 'MEMBER',
      miles: session.role === 'member' ? (session.total_miles ?? 5000) : 0,
    }
  } catch {
    return null
  }
}

function readUsers() {
  if (typeof window === 'undefined') return [] as StoredUser[]

  seedUsersIfMissing()

  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionData) : null
  } catch {
    return null
  }
}

function writeSession(session: SessionData | null) {
  if (typeof window === 'undefined') return

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY)
  } else {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

function mapUserToSession(user: User): SessionData {
  return {
    email: user.email,
    role: user.role,
    name: user.name,
    first_mid_name: user.firstName,
    last_name: user.lastName,
    salutation: user.salutation,
    country_code: user.countryCode,
    mobile_number: user.mobileNumber,
    kewarganegaraan: user.kewarganegaraan,
    tanggal_lahir: user.tanggalLahir,
    nomor_member: user.nomorMember,
    id_tier: user.idTier,
    tanggal_bergabung: user.tanggalBergabung,
    award_miles: user.awardMiles,
    total_miles: user.totalMiles,
    id_staf: user.idStaf,
    kode_maskapai: user.kodeMaskapai,
  }
}

function mapSessionToStoredUser(session: SessionData, password: string): StoredUser {
  return {
    email: session.email,
    password,
    role: session.role ?? 'member',
    salutation: session.salutation ?? 'Mr.',
    first_mid_name: session.first_mid_name ?? '',
    last_name: session.last_name ?? '',
    country_code: session.country_code ?? '+62',
    mobile_number: session.mobile_number ?? '',
    kewarganegaraan: session.kewarganegaraan ?? '',
    tanggal_lahir: session.tanggal_lahir ?? '',
    nomor_member: session.nomor_member,
    id_tier: session.id_tier,
    tanggal_bergabung: session.tanggal_bergabung,
    award_miles: session.award_miles,
    total_miles: session.total_miles,
    id_staf: session.id_staf,
    kode_maskapai: session.kode_maskapai,
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

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isHydrated,

    loginMock: (email = 'john@example.com', role = 'member') => {
      const nextUser: User = role === 'staf'
        ? {
            email: 'staf@aeromiles.com',
            name: 'Ms. Aero Staff',
            salutation: 'Ms.',
            firstName: 'Aero',
            lastName: 'Staff',
            countryCode: '+62',
            mobileNumber: '81234567891',
            tanggalLahir: '1993-01-01',
            kewarganegaraan: 'Indonesia',
            role: 'staf',
            idStaf: 'S0001',
            kodeMaskapai: 'GA',
            npm: 'STAFF',
            miles: 0,
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
            npm: 'MEMBER',
            miles: 45000,
          }
      setUser(nextUser)
      writeSession(mapUserToSession(nextUser))
    },

    logout: () => {
      setUser(null)
      writeSession(null)
    },

    updateProfile: (updates: Partial<User>) => {
      setUser(prev => {
        if (!prev) return prev
        const next = { ...prev, ...updates }
        const currentSession = readSession()
        writeSession({ ...(currentSession ?? mapUserToSession(next)), ...mapUserToSession(next) })
        return next
      })
    },

    updatePassword: (newPassword: string) => {
      const currentSession = readSession()
      if (!currentSession) return

      const users = readUsers()
      const nextUsers = users.map((entry) => {
        if (entry.email.toLowerCase() !== currentSession.email.toLowerCase()) return entry
        return { ...entry, password: newPassword }
      })

      writeUsers(nextUsers)
    },

    registerMock: ({ name, contact, username }) => {
      const nextUser: StoredUser = {
        email: username,
        password: contact,
        role: 'member',
        salutation: 'Mr.',
        first_mid_name: name,
        last_name: '',
        country_code: '+62',
        mobile_number: contact,
        kewarganegaraan: 'Indonesia',
        tanggal_lahir: '1990-01-01',
        id_tier: 'BLUE',
        nomor_member: 'M0001',
        tanggal_bergabung: '2026-04-30',
      }
      const users = readUsers()
      writeUsers([...users, nextUser])
    },
  }), [isHydrated, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
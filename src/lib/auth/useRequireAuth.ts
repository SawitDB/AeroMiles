'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'

export function useRequireAuth() {
  const router = useRouter()
  const { user, isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    if (!user) router.replace('/login')
  }, [isHydrated, router, user])

  return { user, isHydrated }
}

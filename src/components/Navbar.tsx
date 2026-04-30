'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/components/AuthProvider'

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white'
          : 'rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white'
      }
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const { user, isHydrated } = useAuth()
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const [sessionRole, sessionName] = useMemo(() => {
    if (typeof window === 'undefined') return [null, null]
    try {
      const raw = window.localStorage.getItem('aeromiles_session')
      if (!raw) return [null, null]
      const parsed = JSON.parse(raw)
      const role = parsed?.role ?? null
      const name = parsed?.name ?? parsed?.user?.name ?? null
      return [role, name]
    } catch {
      return [null, null]
    }
  }, [isHydrated])

  useEffect(() => {
    setOpen(false)
  }, [usePathname()])

  function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('aeromiles_session')
    }
    router.push('/login')
  }

  const role = sessionRole ?? (user ? 'member' : null)
  const displayName = sessionName ?? (user?.name ?? '')

  const guestLinks = [
    { href: '/login', label: 'Login' },
    { href: '/register', label: 'Registrasi' },
  ]

  const memberLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Identitas Saya' },
    { href: '/klaim', label: 'Klaim Miles' },
    { href: '/transfer', label: 'Transfer Miles' },
    { href: '/redeem', label: 'Redeem Hadiah' },
    { href: '/beli-package', label: 'Beli Package' },
    { href: '/info-tier', label: 'Info Tier' },
    { href: '/settings', label: 'Pengaturan Profil' },
  ]

  const stafLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/kelola-member', label: 'Kelola Member' },
    { href: '/kelola-klaim', label: 'Kelola Klaim' },
    { href: '/kelola-hadiah', label: 'Kelola Hadiah & Penyedia' },
    { href: '/kelola-mitra', label: 'Kelola Mitra' },
    { href: '/laporan', label: 'Laporan Transaksi' },
    { href: '/settings', label: 'Pengaturan Profil' },
  ]

  if (!isHydrated) return null

  const linksToRender = role === 'staf' ? stafLinks : role === 'member' ? memberLinks : guestLinks

  const firstName = displayName ? String(displayName).split(' ')[0] : null

  return (
    <header className="sticky top-0 z-10 border-b border-white/15 bg-secondary/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-base font-semibold tracking-wide text-white">
            AEROMILES
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:gap-2">
          <nav className="flex items-center gap-1">
            {linksToRender.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}

            {role ? (
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-white/10">
                Logout
              </button>
            ) : null}
          </nav>

          {role ? (
            <div className="ml-3 rounded-full bg-white/8 px-3 py-1 text-sm font-medium text-white">
              Hai{firstName ? `, ${firstName}` : ''}
            </div>
          ) : null}
        </div>

        <div className="md:hidden flex items-center">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-white/10 bg-secondary/90 px-4 py-3">
          <nav className="flex flex-col gap-2">
            {linksToRender.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}

            {role ? (
              <button onClick={handleLogout} className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-white/10">
                Logout
              </button>
            ) : null}

            {role ? (
              <div className="mt-2 rounded-md bg-white/6 px-3 py-2 text-sm font-medium text-white">Hai{firstName ? `, ${firstName}` : ''}</div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

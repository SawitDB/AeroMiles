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

const MEMBER_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/identitas', label: 'Identitas Saya' },
  { href: '/klaim-miles', label: 'Klaim Miles' },
  { href: '/transfer-miles', label: 'Transfer Miles' },
  { href: '/redeem', label: 'Redeem Hadiah' },
  { href: '/beli-package', label: 'Beli Package' },
  { href: '/info-tier', label: 'Info Tier' },
  { href: '/profile', label: 'Pengaturan Profil' },
]

const STAF_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/kelola-member', label: 'Kelola Member' },
  { href: '/kelola-klaim', label: 'Kelola Klaim' },
  { href: '/kelola-hadiah', label: 'Kelola Hadiah & Penyedia' },
  { href: '/kelola-mitra', label: 'Kelola Mitra' },
  { href: '/laporan', label: 'Laporan Transaksi' },
  { href: '/profile', label: 'Pengaturan Profil' },
]

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
    { href: '/identitas-saya', label: 'Identitas Saya' },
    { href: '/klaim-miles', label: 'Klaim Miles' },
    { href: '/transfer-miles', label: 'Transfer Miles' },
    { href: '/redeem-hadiah', label: 'Redeem Hadiah' },
    { href: '/beli-package', label: 'Beli Package' },
    { href: '/info-tier', label: 'Info Tier' },
    { href: '/pengaturan-profil', label: 'Pengaturan Profil' },
  ]

  const stafLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/kelola-member', label: 'Kelola Member' },
    { href: '/kelola-klaim', label: 'Kelola Klaim' },
    { href: '/kelola-hadiah-penyedia', label: 'Kelola Hadiah & Penyedia' },
    { href: '/kelola-mitra', label: 'Kelola Mitra' },
    { href: '/laporan-transaksi', label: 'Laporan Transaksi' },
    { href: '/pengaturan-profil', label: 'Pengaturan Profil' },
  ]

  if (!isHydrated) return null

  const linksToRender = role === 'staf' ? stafLinks : role === 'member' ? memberLinks : guestLinks

  const firstName = displayName ? String(displayName).split(' ')[0] : null

  const links = user.role === 'staf' ? STAF_LINKS : MEMBER_LINKS
  const roleLabel = user.role === 'staf' ? 'Staf' : 'Member'

  return (
    <header className="sticky top-0 z-10 border-b border-white/15 bg-secondary/80 backdrop-blur">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-base font-bold tracking-widest text-white">
          ✈ AeroMiles
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map(l => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-white/60 sm:block">
            {user.name} · <span className="text-white/80">{roleLabel}</span>
          </span>
          <Link
            href="/logout"
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Logout
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {links.map(l => (
          <NavLink key={l.href} href={l.href} label={l.label} />
        ))}
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
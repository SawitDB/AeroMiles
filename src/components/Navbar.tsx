'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  if (!isHydrated || !user) return null

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
    </header>
  )
}
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

export function Navbar() {
  const { user, isHydrated } = useAuth()

  if (!isHydrated || !user) return null

  return (
    <header className="sticky top-0 z-10 border-b border-white/15 bg-secondary/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-base font-semibold tracking-wide text-white">
          AEROMILES
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/profile" label="Profil" />
          <Link
            href="/logout"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-white/10"
          >
            Logout
          </Link>
        </nav>
      </div>
    </header>
  )
}

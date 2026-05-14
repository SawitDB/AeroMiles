'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

const GUEST_LINKS = [
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Registrasi' },
]

const MEMBER_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/identitas-saya', label: 'Identitas Saya' },
  { href: '/klaim-miles', label: 'Klaim Miles' },
  { href: '/transfer-miles', label: 'Transfer Miles' },
  { href: '/redeem-hadiah', label: 'Redeem Hadiah' },
  { href: '/beli-package', label: 'Beli Package' },
  { href: '/info-tier', label: 'Info Tier' },
  { href: '/pengaturan-profil', label: 'Pengaturan Profil' },
]

const STAF_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/kelola-member', label: 'Kelola Member' },
  { href: '/kelola-klaim', label: 'Kelola Klaim' },
  { href: '/kelola-hadiah-penyedia', label: 'Kelola Hadiah & Penyedia' },
  { href: '/kelola-mitra', label: 'Kelola Mitra' },
  { href: '/laporan-transaksi', label: 'Laporan Transaksi' },
  { href: '/pengaturan-profil', label: 'Pengaturan Profil' },
]

export function Navbar() {
  const { user, isHydrated, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  if (!isHydrated) return null

  const role = user?.role ?? null
  const linksToRender = role === 'staf' ? STAF_LINKS : role === 'member' ? MEMBER_LINKS : GUEST_LINKS
  const firstName = user?.name ? user.name.split(' ')[0] : user?.firstName ?? ''
  const roleLabel = role === 'staf' ? 'Staf' : role === 'member' ? 'Member' : 'Tamu'

  return (
    <header className="sticky top-0 z-10 border-b border-white/15 bg-secondary/80 backdrop-blur">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
        <Link href={role ? '/dashboard' : '/login'} className="text-base font-bold tracking-widest text-white">
          ✈ AeroMiles
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {linksToRender.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {role ? (
            <>
              <span className="hidden text-xs text-white/60 sm:block">
                {user?.name || ''} · <span className="text-white/80">{roleLabel}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {linksToRender.map((l) => (
          <NavLink key={l.href} href={l.href} label={l.label} />
        ))}
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-secondary/90 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {linksToRender.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}

            {role ? (
              <button onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-white/10">
                Logout
              </button>
            ) : null}

            {role ? (
              <div className="mt-2 rounded-md bg-white/6 px-3 py-2 text-sm font-medium text-white">
                Hai{firstName ? `, ${firstName}` : ''} · {roleLabel}
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
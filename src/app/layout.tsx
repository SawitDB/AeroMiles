import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar.tsx'

export const metadata: Metadata = {
  title: 'AeroMiles',
  description: 'Aplikasi AeroMiles (migrasi ke Next.js + Tailwind)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gradient-to-br from-secondary-700 to-secondary-500 text-slate-900">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}

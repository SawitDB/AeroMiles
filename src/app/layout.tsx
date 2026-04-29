import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'

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
      <body className="min-h-screen bg-gradient-to-br from-secondary to-secondary-50 text-slate-900">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}

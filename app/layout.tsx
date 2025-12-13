import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { CookieConsent } from './components/CookieConsent'
import { TermsAcceptance } from './components/TermsAcceptance'
import PWARegister from './components/PWARegister'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Алихан - Портфолио и Школьный Парламент',
  description: 'Личное портфолио и система управления школьным парламентом',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SCH1',
  },
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          {children}
          <CookieConsent />
          <TermsAcceptance />
          <PWARegister />
        </Providers>
      </body>
    </html>
  )
}


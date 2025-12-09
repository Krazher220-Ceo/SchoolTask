import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { CookieConsent } from './components/CookieConsent'
import { TermsAcceptance } from './components/TermsAcceptance'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Алихан - Портфолио и Школьный Парламент',
  description: 'Личное портфолио и система управления школьным парламентом',
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
        </Providers>
      </body>
    </html>
  )
}


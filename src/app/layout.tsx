import type { Metadata } from 'next'
import { Archivo, Inter, Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import './globals.css'

// Self-hosted at build time so visitors' browsers never call Google Fonts.
const archivo = Archivo({ subsets: ['latin', 'latin-ext'], variable: '--font-archivo', display: 'swap' })
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' })
const robotoMono = Roboto_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-roboto-mono', display: 'swap' })

export const metadata: Metadata = {
  title: '4Hope — Play For Keeps',
  description: "We're a gaming crew built on good vibes, camaraderie, and a little luck.",
  icons: {
    icon: [
      {
        url: '/brand/favicon.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/brand/favicon.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
      { url: '/brand/favicon.ico', sizes: 'any' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${robotoMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0c0c0d" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
          <Footer />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

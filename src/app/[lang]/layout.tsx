import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archivo, Inter, Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { LangProvider } from '@/components/LangProvider'
import { htmlLang, isLang, languages, t, type Lang } from '@/i18n/utils'
import '../globals.css'

// Self-hosted at build time so visitors' browsers never call Google Fonts.
const archivo = Archivo({ subsets: ['latin', 'latin-ext'], variable: '--font-archivo', display: 'swap' })
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' })
const robotoMono = Roboto_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-roboto-mono', display: 'swap' })

const icons: Metadata['icons'] = {
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
}

export function generateStaticParams() {
  return (Object.keys(languages) as Lang[]).map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const d = t(lang)
  return {
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    title: d.meta.title,
    description: d.meta.description,
    icons,
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  return (
    <html lang={htmlLang[lang]} className={`${archivo.variable} ${inter.variable} ${robotoMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0c0c0d" />
      </head>
      <body>
        <LangProvider lang={lang}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
            <Footer />
          </AuthProvider>
        </LangProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

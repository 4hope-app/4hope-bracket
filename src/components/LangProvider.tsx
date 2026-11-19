'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { localizePath, t, type Dictionary, type Lang } from '@/i18n/utils'

const LangContext = createContext<Lang>('es')

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

/** Current language, set by the [lang] layout. */
export const useLang = (): Lang => useContext(LangContext)

/** Dictionary for the current language (client components). */
export const useT = (): Dictionary => t(useLang())

/** Returns a function that prefixes internal paths with the current language. */
export function useLocalizePath(): (path: string) => string {
  const lang = useLang()
  return (path) => localizePath(path, lang)
}

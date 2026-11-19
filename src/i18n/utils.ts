import es from './es.json'
import en from './en.json'

export const languages = { es: 'Español', en: 'English' } as const
export type Lang = keyof typeof languages
/** Default language: served without a URL prefix. English lives under /en. */
export const defaultLang: Lang = 'es'

export type Dictionary = typeof es
const dictionaries: Record<Lang, Dictionary> = { es, en }

/** BCP 47 tags for <html lang> and hreflang. Spanish targets Latin America. */
export const htmlLang: Record<Lang, string> = { es: 'es-419', en: 'en' }

export const isLang = (value: string): value is Lang => value in languages

/** Returns the dictionary for a language: `const d = t(lang); d.hero.line1`. */
export function t(lang: Lang): Dictionary {
  return dictionaries[lang]
}

/** Replaces `{name}` placeholders: format('Hi {name}', { name: 'Ana' }) -> 'Hi Ana'. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}

/**
 * Localized internal path: localizePath('/lobbies', 'en') -> '/en/lobbies'.
 * Keeps query strings and hashes; external URLs are returned untouched.
 */
export function localizePath(path: string, lang: Lang): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return path
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang === defaultLang) return clean
  if (clean === '/' ) return `/${lang}`
  if (clean.startsWith('/#') || clean.startsWith('/?')) return `/${lang}${clean.slice(1)}`
  return `/${lang}${clean}`
}

/** Splits a browser pathname into its language and the language-less path. */
export function parsePathname(pathname: string): { lang: Lang; path: string } {
  const [, first = '', ...rest] = pathname.split('/')
  if (first !== defaultLang && isLang(first)) {
    return { lang: first, path: `/${rest.join('/')}` }
  }
  return { lang: defaultLang, path: pathname || '/' }
}

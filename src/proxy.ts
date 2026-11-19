import { NextResponse, type NextRequest } from 'next/server'

/**
 * Language routing. Spanish (default) has no URL prefix and English lives under /en:
 *   /lobbies    -> rewritten to /es/lobbies (the URL in the browser stays /lobbies)
 *   /en/lobbies -> served as is
 *   /es/lobbies -> redirected to /lobbies (one canonical URL per page)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/es${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip the API, Next internals and any file with an extension (images, fonts, robots.txt, sitemap.xml…).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}

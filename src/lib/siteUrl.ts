/**
 * Absolute origin used for canonical URLs, the sitemap and Open Graph tags.
 * Set NEXT_PUBLIC_SITE_URL in production; Vercel's production URL is the
 * fallback, then localhost for dev.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  if (process.env.APP_ENV === "production") return "https://bracket.4hope.app";
  return "http://localhost:3000";
}

/** Only the production deployment should be indexed — UAT/dev stay out of Google. */
export function isIndexableEnv(): boolean {
  return process.env.APP_ENV === "production";
}

import { localizePath, type Lang } from "@/i18n/utils";

/** Origin of the home site, which owns the Google login. */
export function getHomeUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_HOME_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return "https://4hope.app";
}

/**
 * The home site's /logout page: it clears the shared session cookie, then returns to bracket's
 * own home page (home only follows a callbackUrl that points back at bracket.4hope.app, and only
 * when the user came from there). `origin` is bracket's origin in the browser.
 */
export function getLogoutUrl(lang: Lang, origin: string): string {
  const back = `${origin}${localizePath("/", lang)}`;
  return `${getHomeUrl()}${localizePath("/logout", lang)}?callbackUrl=${encodeURIComponent(back)}`;
}

import type { MetadataRoute } from "next";
import { listPublicLobbyUrls } from "@/lib/publicLobbies";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

/** The Spanish and English URLs of one page, each pointing at the other as hreflang alternate. */
function localized(base: string, path: string, rest: Omit<Entry, "url" | "alternates">): Entry[] {
  const es = `${base}${path}` || base;
  const en = `${base}/en${path}`;
  const alternates = { languages: { es, en } };
  return [
    { url: es, alternates, ...rest },
    { url: en, alternates, ...rest },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lobbies = await listPublicLobbyUrls();
  return [
    // Every page exists in Spanish (no prefix) and English (/en), linked to each other as alternates.
    ...localized(base, "", { changeFrequency: "weekly", priority: 1 }),
    ...localized(base, "/lobbies", { changeFrequency: "hourly", priority: 0.8 }),
    ...localized(base, "/privacy", { changeFrequency: "yearly", priority: 0.3 }),
    ...localized(base, "/terms", { changeFrequency: "yearly", priority: 0.3 }),
    ...lobbies.flatMap((l) =>
      localized(base, `/lobbies/${l.id}`, {
        lastModified: l.lastModified ?? undefined,
        changeFrequency: "daily",
        priority: 0.6,
      }),
    ),
  ];
}

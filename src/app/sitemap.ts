import type { MetadataRoute } from "next";
import { listPublicLobbyUrls } from "@/lib/publicLobbies";
import { countrySlug } from "@/lib/countries";
import { MIN_INDEXABLE_PLAYERS } from "@/lib/ladder";
import { getCountryCounts } from "@/lib/ladderData";
import { getRankedSquadSlugs } from "@/lib/squadData";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [lobbies, counts, squadSlugs] = await Promise.all([listPublicLobbyUrls(), getCountryCounts(), getRankedSquadSlugs()]);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/lobbies`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/ladder`, changeFrequency: "daily", priority: 0.8 },
    ...Object.entries(counts)
      .filter(([, n]) => n >= MIN_INDEXABLE_PLAYERS)
      .map(([code]) => ({ url: `${base}/ladder/${countrySlug(code)}`, changeFrequency: "daily" as const, priority: 0.6 })),
    { url: `${base}/squads`, changeFrequency: "daily", priority: 0.8 },
    ...squadSlugs.map((slug) => ({ url: `${base}/squads/${slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...lobbies.map((l) => ({
      url: `${base}/lobbies/${l.id}`,
      lastModified: l.lastModified ?? undefined,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}

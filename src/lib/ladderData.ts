import { revalidateTag, unstable_cache } from "next/cache";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { resolveAvatarBytes } from "@/lib/avatar";
import { isCountryCode } from "@/lib/countries";
import { isRanked, LADDER_PAGE_SIZE, rankScore } from "@/lib/ladder";

export interface LadderRow {
  id: string;
  position: number;
  name: string;
  gameName: string;
  tagLine: string;
  tier: string;
  rank: string;
  lp: number;
  country: string | null;
  photoURL: string | null;
  checkedAt: string | null;
}

export interface LadderPage {
  rows: LadderRow[];
  total: number;
  updatedAt: string | null;
}

/** Every linked, verified, ranked TFT account, best first. Read from the `riot` snapshot on each profile — no Riot call. */
async function readRanked(): Promise<LadderRow[]> {
  const snap = await getAdminDb().collection(envCollection("users")).where("riot.verified", "==", true).get();
  return snap.docs
    .map((doc) => ({ id: doc.id, data: doc.data() }))
    .filter(({ data }) => isRanked(data.riot?.tier))
    .map(({ id, data }) => ({
      id,
      score: rankScore(data.riot.tier, data.riot.rank ?? "", data.riot.lp ?? 0),
      name: (data.displayName || data.username) as string,
      gameName: data.riot.gameName as string,
      tagLine: data.riot.tagLine as string,
      tier: String(data.riot.tier).toUpperCase(),
      rank: (data.riot.rank ?? "") as string,
      lp: (data.riot.lp ?? 0) as number,
      country: isCountryCode(data.country) ? (data.country as string) : null,
      // Served by /api/users/[id]/photo (own upload -> Riot icon -> clover) so rows stay light and cacheable.
      photoURL: resolveAvatarBytes(data) ? `/api/users/${id}/photo` : null,
      checkedAt: (data.riot.lastCheckedAt ?? null) as string | null,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map(({ score: _score, ...row }, i) => {
      void _score;
      return { ...row, position: i + 1 };
    });
}

const LADDER_TAG = "ladder";

/** Shared by home, /ladder, the API and the sitemap, so they cost one Firestore read per window instead of one each. */
const loadRanked = unstable_cache(readRanked, ["ladder-ranked"], { tags: [LADDER_TAG], revalidate: 300 });

/** Call when anything the ladder shows changes (Riot link/refresh/unlink, country, name, photo) so it updates right away. */
export function invalidateLadder() {
  revalidateTag(LADDER_TAG, { expire: 0 });
}

/** Ranked-player count per country (only players who chose to show one). */
export async function getCountryCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const r of await loadRanked()) if (r.country) counts[r.country] = (counts[r.country] ?? 0) + 1;
  return counts;
}

/**
 * One page of the ladder. `country` narrows it; `q` matches display name or Riot ID. Positions are always
 * the rank inside the filtered list (country ladder #1 is the country's best), unaffected by the search.
 */
export async function getLadder(opts: { country?: string | null; q?: string; offset?: number; limit?: number } = {}) {
  const { country = null, q = "", offset = 0, limit = LADDER_PAGE_SIZE } = opts;
  let rows = await loadRanked();
  if (country) rows = rows.filter((r) => r.country === country).map((r, i) => ({ ...r, position: i + 1 }));
  const updatedAt = rows.reduce<string | null>((m, r) => (r.checkedAt && (!m || r.checkedAt > m) ? r.checkedAt : m), null);

  const needle = q.trim().toLowerCase();
  if (needle) {
    rows = rows.filter((r) => `${r.name} ${r.gameName}#${r.tagLine}`.toLowerCase().includes(needle));
  }
  const total = rows.length;
  return { rows: rows.slice(offset, offset + limit), total, updatedAt } satisfies LadderPage;
}

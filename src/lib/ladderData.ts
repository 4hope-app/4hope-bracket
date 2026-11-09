import { revalidateTag, unstable_cache } from "next/cache";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { isCountryCode } from "@/lib/countries";
import { LADDER_PAGE_SIZE } from "@/lib/ladder";
import { PLAYERS } from "@/lib/playerDoc";

export interface LadderRow {
  /** Public handle (lowercase username) — the only identifier that leaves the server. Never the account id. */
  username: string;
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
  teamName: string | null;
  teamSlug: string | null;
}

export interface LadderPage {
  rows: LadderRow[];
  total: number;
  updatedAt: string | null;
}

const LADDER_TAG = "ladder";
const SEARCH_LIMIT = 10;

/** Call when anything the ladder shows changes so cached pages refresh right away. */
export function invalidateLadder() {
  revalidateTag(LADDER_TAG, { expire: 0 });
}

function toRow(doc: FirebaseFirestore.QueryDocumentSnapshot, position: number): LadderRow {
  const d = doc.data();
  return {
    username: d.usernameKey,
    position,
    name: d.displayName,
    gameName: d.riot?.gameName ?? "",
    tagLine: d.riot?.tagLine ?? "",
    tier: d.riot?.tier ?? "",
    rank: d.riot?.rank ?? "",
    lp: d.riot?.lp ?? 0,
    country: isCountryCode(d.country) ? d.country : null,
    // Own upload -> Riot icon -> clover, resolved by the photo route; null means go straight to the clover.
    photoURL: d.hasPhoto ? `/api/players/${d.usernameKey}/photo` : null,
    checkedAt: d.riot?.checkedAt ?? null,
    teamName: d.teamName ?? null,
    teamSlug: d.teamSlug ?? null,
  };
}

function base(country: string | null) {
  const col = getAdminDb().collection(envCollection(PLAYERS));
  return country ? col.where("country", "==", country) : col;
}

interface Opts {
  country?: string | null;
  q?: string;
  /** username of the last row already shown — the next page starts right after it. */
  after?: string | null;
  /** How many rows are already shown; only used to number the new ones. */
  offset?: number;
  limit?: number;
}

async function readLadder({ country = null, q = "", after = null, offset = 0, limit = LADDER_PAGE_SIZE }: Opts): Promise<LadderPage> {
  const needle = q.trim().toLowerCase();

  if (needle) {
    // Prefix search on the Riot name. Each hit's rank is the number of players above it, via a count query.
    const snap = await base(country)
      .orderBy("gameNameKey")
      .startAt(needle)
      .endAt(needle + "")
      .limit(SEARCH_LIMIT * 3)
      .get();
    const hits = snap.docs.filter((d) => typeof d.data().score === "number").slice(0, SEARCH_LIMIT);
    const rows = await Promise.all(
      hits.map(async (doc) => {
        const above = await base(country).where("score", ">", doc.data().score).count().get();
        return toRow(doc, above.data().count + 1);
      }),
    );
    return { rows, total: rows.length, updatedAt: null };
  }

  let query = base(country).orderBy("score", "desc").limit(limit);
  if (after) {
    const found = await getAdminDb().collection(envCollection(PLAYERS)).where("usernameKey", "==", after).limit(1).get();
    if (!found.empty) query = query.startAfter(found.docs[0]);
  }
  const [snap, count] = await Promise.all([query.get(), base(country).orderBy("score", "desc").count().get()]);
  const rows = snap.docs.map((doc, i) => toRow(doc, offset + i + 1));
  const updatedAt = rows.reduce<string | null>((m, r) => (r.checkedAt && (!m || r.checkedAt > m) ? r.checkedAt : m), null);
  return { rows, total: count.data().count, updatedAt };
}

const cachedLadder = unstable_cache(readLadder, ["ladder-page"], { tags: [LADDER_TAG], revalidate: 300 });

/** One page of the ladder: `players` ordered by score (best first), optionally for one country. Cursor-paginated. */
export function getLadder(opts: Opts = {}): Promise<LadderPage> {
  return cachedLadder({ ...opts, country: opts.country ?? null, q: opts.q ?? "", after: opts.after ?? null });
}

/** Ranked-player count per country (players who chose to show one). Light read, shared and cached. */
export const getCountryCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const snap = await getAdminDb().collection(envCollection(PLAYERS)).orderBy("score").select("country").get();
    const counts: Record<string, number> = {};
    for (const d of snap.docs) {
      const c = d.data().country;
      if (isCountryCode(c)) counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
  },
  ["ladder-country-counts"],
  { tags: [LADDER_TAG], revalidate: 300 },
);

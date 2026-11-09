import { unstable_cache } from "next/cache";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { isCountryCode } from "@/lib/countries";
import { LADDER_PAGE_SIZE } from "@/lib/ladder";
import { PLAYERS } from "@/lib/playerDoc";

export interface SquadRow {
  slug: string;
  position: number;
  name: string;
  code: string;
  logoURL: string | null;
  tier: string;
  rank: string;
  lp: number;
  memberCount: number;
  rankedCount: number;
}

export interface SquadMember {
  username: string;
  name: string;
  tier: string | null;
  rank: string;
  lp: number;
  country: string | null;
  photoURL: string | null;
  isManager: boolean;
  /** One of the best 5 ranked members, i.e. counts toward the squad's score. */
  counts: boolean;
}

export interface SquadDetail extends Omit<SquadRow, "position"> {
  country: string | null;
  members: SquadMember[];
  /** Position on /squads, or null while the squad isn't ranked yet. */
  position: number | null;
}

const TAG = "ladder"; // same tag as the player ladder: syncPlayer invalidates both
const SEARCH_LIMIT = 10;

const teams = () => getAdminDb().collection(envCollection("teams"));

function toRow(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot, position: number): SquadRow {
  const d = doc.data()!;
  return {
    slug: d.slug,
    position,
    name: d.name,
    code: d.code ?? "",
    logoURL: d.logoBytes ? `/api/squads/${d.slug}/logo` : null,
    tier: d.avg?.tier ?? "",
    rank: d.avg?.rank ?? "",
    lp: d.avg?.lp ?? 0,
    memberCount: d.memberCount ?? 0,
    rankedCount: d.rankedCount ?? 0,
  };
}

interface Opts {
  q?: string;
  /** slug of the last squad already shown. */
  after?: string | null;
  offset?: number;
  limit?: number;
}

async function readSquads({ q = "", after = null, offset = 0, limit = LADDER_PAGE_SIZE }: Opts) {
  const needle = q.trim().toLowerCase();
  if (needle) {
    const snap = await teams().orderBy("nameKey").startAt(needle).endAt(needle + "").limit(SEARCH_LIMIT * 3).get();
    const hits = snap.docs.filter((d) => typeof d.data().score === "number").slice(0, SEARCH_LIMIT);
    const rows = await Promise.all(
      hits.map(async (doc) => {
        const above = await teams().where("score", ">", doc.data().score).count().get();
        return toRow(doc, above.data().count + 1);
      }),
    );
    return { rows, total: rows.length };
  }

  let query = teams().orderBy("score", "desc").limit(limit);
  if (after) {
    const found = await teams().where("slug", "==", after).limit(1).get();
    if (!found.empty) query = query.startAfter(found.docs[0]);
  }
  const [snap, count] = await Promise.all([query.get(), teams().orderBy("score", "desc").count().get()]);
  return { rows: snap.docs.map((doc, i) => toRow(doc, offset + i + 1)), total: count.data().count };
}

const cachedSquads = unstable_cache(readSquads, ["squads-page"], { tags: [TAG], revalidate: 300 });

/** Ranked squads (≥2 ranked members), best average first. Cursor-paginated by slug. */
export function getSquads(opts: Opts = {}) {
  return cachedSquads({ q: opts.q ?? "", after: opts.after ?? null, offset: opts.offset ?? 0, limit: opts.limit ?? LADDER_PAGE_SIZE });
}

export type SquadLookup = { kind: "found"; squad: SquadDetail } | { kind: "redirect"; slug: string } | { kind: "none" };

async function readSquad(slug: string): Promise<SquadLookup> {
  const snap = await teams().where("slug", "==", slug).limit(1).get();
  if (snap.empty) {
    // A squad that was renamed: send the old URL to the new one.
    const old = await teams().where("oldSlugs", "array-contains", slug).limit(1).get();
    if (old.empty) return { kind: "none" };
    return { kind: "redirect", slug: old.docs[0].data().slug };
  }
  const doc = snap.docs[0];
  const t = doc.data();

  const players = await getAdminDb().collection(envCollection(PLAYERS)).where("teamId", "==", doc.id).get();
  const sorted = players.docs
    .map((p) => ({ id: p.id, d: p.data() }))
    .sort((a, b) => (b.d.score ?? -1) - (a.d.score ?? -1) || String(a.d.displayName).localeCompare(String(b.d.displayName)));
  const countingUsernames = new Set(sorted.filter((p) => typeof p.d.score === "number").slice(0, 5).map((p) => p.d.usernameKey));

  const members: SquadMember[] = sorted.map(({ id, d }) => ({
    username: d.usernameKey,
    name: d.displayName,
    tier: d.riot?.tier ?? null,
    rank: d.riot?.rank ?? "",
    lp: d.riot?.lp ?? 0,
    country: isCountryCode(d.country) ? d.country : null,
    photoURL: d.hasPhoto ? `/api/players/${d.usernameKey}/photo` : null,
    isManager: id === t.ownerId,
    counts: countingUsernames.has(d.usernameKey),
  }));

  let position: number | null = null;
  if (typeof t.score === "number") {
    const above = await teams().where("score", ">", t.score).count().get();
    position = above.data().count + 1;
  }

  return { kind: "found", squad: { ...toRow(doc, 0), country: isCountryCode(t.country) ? t.country : null, members, position } };
}

export const getSquad = unstable_cache(readSquad, ["squad-detail"], { tags: [TAG], revalidate: 300 });

/** Slugs of squads on the ranking, for the sitemap. */
export const getRankedSquadSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const snap = await teams().orderBy("score", "desc").select("slug").get();
    return snap.docs.map((d) => d.data().slug as string).filter(Boolean);
  },
  ["squads-slugs"],
  { tags: [TAG], revalidate: 300 },
);

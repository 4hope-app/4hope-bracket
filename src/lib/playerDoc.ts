import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { envCollection } from "@/lib/firebaseAdmin";
import { resolveAvatarBytes } from "@/lib/avatar";
import { isCountryCode } from "@/lib/countries";
import { describeScore, isRanked, MIN_SQUAD_RANKED_MEMBERS, rankScore, SQUAD_SCORE_MEMBERS } from "@/lib/ladder";
import { teamSlug } from "@/lib/team";

export const PLAYERS = "players";

/**
 * `players/{userId}` is the public, read-only copy of a registered player (users/{userId} stays the source of
 * truth and keeps the private data). The ladder is just this collection ordered by `score`; `teamId` links to `teams`.
 * No Next.js imports here so the backfill script can use it too.
 */
/** Returns the squad ids whose membership/score may have changed (the one the player was on, and the one they are on now). */
export async function writePlayer(db: Firestore, userId: string): Promise<string[]> {
  const ref = db.collection(envCollection(PLAYERS)).doc(userId);
  const userDoc = await db.collection(envCollection("users")).doc(userId).get();
  const u = userDoc.data();
  const previousTeamId = (await ref.get()).data()?.teamId as string | null | undefined;
  if (!userDoc.exists || !u?.username) {
    await ref.delete();
    return previousTeamId ? [previousTeamId] : [];
  }

  let team: { name: string; slug: string } | null = null;
  if (typeof u.teamId === "string" && u.teamId) {
    const t = (await db.collection(envCollection("teams")).doc(u.teamId).get()).data();
    if (t?.name) team = { name: t.name, slug: t.slug || teamSlug(t.name) };
  }

  const riot = u.riot?.verified === true && isRanked(u.riot?.tier) ? u.riot : null;
  const country = isCountryCode(u.country) ? u.country : null;

  await ref.set({
    userId,
    username: u.username,
    usernameKey: String(u.username).toLowerCase(),
    displayName: u.displayName || u.username,
    country, // null for "prefer not to say" or unset — they only appear on the global ladder
    hasPhoto: resolveAvatarBytes(u) !== null,
    teamId: team ? u.teamId : null,
    teamName: team?.name ?? null,
    teamSlug: team?.slug ?? null,
    riot: u.riot?.gameName
      ? {
          gameName: u.riot.gameName,
          tagLine: u.riot.tagLine ?? "",
          server: u.riot.server ?? null,
          verified: u.riot.verified === true,
          tier: riot ? String(riot.tier).toUpperCase() : null,
          rank: riot?.rank ?? "",
          lp: riot?.lp ?? 0,
          checkedAt: u.riot.lastCheckedAt ?? null,
        }
      : null,
    gameNameKey: u.riot?.gameName ? String(u.riot.gameName).toLowerCase() : null,
    // Only ranked, verified players get a score. Firestore leaves docs without the field out of `orderBy("score")`,
    // which is what keeps everyone else off the ladder.
    ...(riot ? { score: rankScore(String(riot.tier), riot.rank ?? "", riot.lp ?? 0) } : {}),
    updatedAt: new Date().toISOString(),
  });

  return [...new Set([previousTeamId, team ? (u.teamId as string) : null].filter((x): x is string => !!x))];
}

/**
 * Recomputes a squad's ranking fields from its `players`: `score` = average of its best 5 ranked members, set only
 * once it has at least 2 ranked members (a squad without `score` stays off /squads), plus counts and the majority country.
 */
export async function recomputeTeam(db: Firestore, teamId: string): Promise<void> {
  const teamRef = db.collection(envCollection("teams")).doc(teamId);
  if (!(await teamRef.get()).exists) return;

  const members = await db.collection(envCollection(PLAYERS)).where("teamId", "==", teamId).get();
  const scores = members.docs
    .map((d) => d.data().score)
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => b - a);
  const top = scores.slice(0, SQUAD_SCORE_MEMBERS);

  const tally = new Map<string, number>();
  for (const d of members.docs) {
    const c = d.data().country as string | null;
    if (c) tally.set(c, (tally.get(c) ?? 0) + 1);
  }
  const country = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const ranked = scores.length >= MIN_SQUAD_RANKED_MEMBERS;
  const avg = ranked ? Math.round(top.reduce((s, n) => s + n, 0) / top.length) : null;
  await teamRef.set(
    {
      memberCount: members.size,
      rankedCount: scores.length,
      country: country ?? FieldValue.delete(),
      score: avg ?? FieldValue.delete(),
      avg: avg !== null ? describeScore(avg) : FieldValue.delete(),
      scoreUpdatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/** Re-sync every member of a squad (after it's renamed). */
export async function writeTeamMembers(db: Firestore, teamId: string): Promise<void> {
  const members = await db.collection(envCollection("users")).where("teamId", "==", teamId).get();
  await Promise.all(members.docs.map((d) => writePlayer(db, d.id)));
  await recomputeTeam(db, teamId);
}

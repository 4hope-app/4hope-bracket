import type { Firestore } from "firebase-admin/firestore";
import { envCollection } from "@/lib/firebaseAdmin";
import { resolveAvatarBytes } from "@/lib/avatar";
import { isCountryCode } from "@/lib/countries";
import { isRanked, rankScore } from "@/lib/ladder";
import { teamSlug } from "@/lib/team";

export const PLAYERS = "players";

/**
 * `players/{userId}` is the public, read-only copy of a registered player (users/{userId} stays the source of
 * truth and keeps the private data). The ladder is just this collection ordered by `score`; `teamId` links to `teams`.
 * No Next.js imports here so the backfill script can use it too.
 */
export async function writePlayer(db: Firestore, userId: string): Promise<void> {
  const ref = db.collection(envCollection(PLAYERS)).doc(userId);
  const userDoc = await db.collection(envCollection("users")).doc(userId).get();
  const u = userDoc.data();
  if (!userDoc.exists || !u?.username) {
    await ref.delete();
    return;
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
}

/** Re-sync every member of a squad (after it's renamed). */
export async function writeTeamMembers(db: Firestore, teamId: string): Promise<void> {
  const members = await db.collection(envCollection("users")).where("teamId", "==", teamId).get();
  await Promise.all(members.docs.map((d) => writePlayer(db, d.id)));
}

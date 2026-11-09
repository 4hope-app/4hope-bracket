import { getAdminDb } from "@/lib/firebaseAdmin";
import { invalidateLadder } from "@/lib/ladderData";
import { recomputeTeam, writePlayer, writeTeamMembers } from "@/lib/playerDoc";

/** Keeps `players/{userId}` in step with the user's profile, Riot link, country and squad. Call after any of those change. */
export async function syncPlayer(userId: string): Promise<void> {
  try {
    const db = getAdminDb();
    const teamIds = await writePlayer(db, userId);
    await Promise.all(teamIds.map((id) => recomputeTeam(db, id)));
  } catch (err) {
    // The profile change itself already succeeded; a failed mirror must not fail the request. The backfill repairs it.
    console.error("syncPlayer failed", userId, err);
  }
  invalidateLadder();
}

export async function syncTeamMembers(teamId: string): Promise<void> {
  try {
    await writeTeamMembers(getAdminDb(), teamId);
  } catch (err) {
    console.error("syncTeamMembers failed", teamId, err);
  }
  invalidateLadder();
}

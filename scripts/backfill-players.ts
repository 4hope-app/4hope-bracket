/**
 * One-off: builds `players/*` from the existing users, and gives existing squads a `slug`.
 * Idempotent — safe to re-run. Uses the same env as the app (Firebase credentials + APP_ENV, which picks the
 * `-uat` suffix), e.g.:
 *   APP_ENV=uat npx tsx --env-file=.env.local scripts/backfill-players.ts
 */
import { envCollection, getAdminDb } from "../src/lib/firebaseAdmin";
import { writePlayer } from "../src/lib/playerDoc";
import { teamSlug } from "../src/lib/team";

async function main() {
  const db = getAdminDb();

  const teams = await db.collection(envCollection("teams")).get();
  const seen = new Map<string, string>();
  for (const t of teams.docs) {
    const name = t.data().name as string | undefined;
    if (!name) continue;
    const slug = teamSlug(name);
    if (seen.has(slug)) console.warn(`Slug collision "${slug}": teams ${seen.get(slug)} and ${t.id} — rename one.`);
    seen.set(slug, t.id);
    if (t.data().slug !== slug) await t.ref.set({ slug }, { merge: true });
  }
  console.log(`teams: ${teams.size}`);

  const users = await db.collection(envCollection("users")).get();
  let n = 0;
  for (const u of users.docs) {
    await writePlayer(db, u.id);
    n++;
  }
  console.log(`players synced: ${n} (APP_ENV=${process.env.APP_ENV ?? "unset"})`);
}

main().then(() => process.exit(0), (e) => (console.error(e), process.exit(1)));

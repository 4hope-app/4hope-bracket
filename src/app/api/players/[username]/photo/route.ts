import { NextResponse } from "next/server";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { AVATAR_CONTENT_TYPE, resolveAvatarBytes } from "@/lib/avatar";
import { PLAYERS } from "@/lib/playerDoc";

const USERNAME_RE = /^[a-z0-9_-]{1,24}$/;

/**
 * A player's picture by public username (never the account id): their own upload, else their Riot icon.
 * With neither it's a 404 and the <Avatar> shows the default clover mark. Browser/CDN-cached.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const key = username.toLowerCase();
  const notFound = () => new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  if (!USERNAME_RE.test(key)) return new NextResponse(null, { status: 404 });

  const db = getAdminDb();
  const player = await db.collection(envCollection(PLAYERS)).where("usernameKey", "==", key).limit(1).get();
  if (player.empty) return notFound();

  const user = await db.collection(envCollection("users")).doc(player.docs[0].id).get();
  const bytes = user.exists ? resolveAvatarBytes(user.data()!) : null;
  if (!bytes) return notFound();

  return new NextResponse(new Uint8Array(bytes), {
    headers: { "Content-Type": AVATAR_CONTENT_TYPE, "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
  });
}

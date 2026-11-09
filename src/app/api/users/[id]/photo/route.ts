import { NextResponse } from "next/server";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { AVATAR_CONTENT_TYPE, resolveAvatarBytes } from "@/lib/avatar";

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * A player's picture as an image: their own upload, else their Riot icon. With neither it's a 404 and the
 * <Avatar> shows the default clover mark. Browser/CDN-cached so ladder rows don't re-download it.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_RE.test(id)) return new NextResponse(null, { status: 404 });

  const doc = await getAdminDb().collection(envCollection("users")).doc(id).get();
  const bytes = doc.exists ? resolveAvatarBytes(doc.data()!) : null;
  if (!bytes) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": AVATAR_CONTENT_TYPE,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}

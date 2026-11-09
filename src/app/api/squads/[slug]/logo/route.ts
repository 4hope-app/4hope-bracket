import { NextResponse } from "next/server";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { TEAM_LOGO_CONTENT_TYPE } from "@/lib/avatar";

const SLUG_RE = /^[a-z0-9_-]{1,40}$/;

/** A squad's logo by slug. 404 when it has none, so <Avatar> shows the clover. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug.toLowerCase();
  if (!SLUG_RE.test(slug)) return new NextResponse(null, { status: 404 });
  const snap = await getAdminDb().collection(envCollection("teams")).where("slug", "==", slug).limit(1).get();
  const bytes = snap.docs[0]?.data().logoBytes;
  if (!Buffer.isBuffer(bytes)) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  return new NextResponse(new Uint8Array(bytes), {
    headers: { "Content-Type": TEAM_LOGO_CONTENT_TYPE, "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
  });
}

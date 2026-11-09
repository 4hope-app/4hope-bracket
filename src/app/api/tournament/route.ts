import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

const MAX_NAME = 80;
const MAX_TOURNAMENTS_PER_OWNER = 10;

/** Public tournament directory, newest first. */
export async function GET() {
  const snap = await getAdminDb()
    .collection(envCollection("tournaments"))
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const tournaments = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      authorName: d.authorName,
      playerCount: Array.isArray(d.players) ? d.players.length : 0,
      dayCount: Array.isArray(d.days) ? d.days.length : 0,
      createdAt: d.createdAt,
    };
  });
  return NextResponse.json({ tournaments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > MAX_NAME) {
    return NextResponse.json({ error: `name is required (max ${MAX_NAME} chars)` }, { status: 400 });
  }

  const col = getAdminDb().collection(envCollection("tournaments"));
  const mine = await col.where("ownerUserId", "==", session.user.id).count().get();
  if (mine.data().count >= MAX_TOURNAMENTS_PER_OWNER) {
    return NextResponse.json({ error: "tournament limit reached" }, { status: 429 });
  }

  const ref = col.doc(crypto.randomUUID());
  await ref.set({
    name,
    ownerUserId: session.user.id,
    authorName: session.user.name ?? "",
    players: [],
    days: [],
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ id: ref.id }, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { COUNTRY_HIDDEN, isCountryCode } from "@/lib/countries";
import { syncPlayer } from "@/lib/players";

/** Sets the signed-in player's country (for accounts created before it was asked at sign-up). */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { country } = await request.json().catch(() => ({}));
  if (!isCountryCode(country) && country !== COUNTRY_HIDDEN) return NextResponse.json({ error: "Choose a valid country." }, { status: 400 });

  const ref = getAdminDb().collection(envCollection("users")).doc(session.user.id);
  if (!(await ref.get()).exists) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  await ref.set({ country }, { merge: true });
  await syncPlayer(session.user.id);
  return NextResponse.json({ ok: true });
}

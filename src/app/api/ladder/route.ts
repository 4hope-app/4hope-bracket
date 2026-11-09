import { NextRequest, NextResponse } from "next/server";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { resolvePhotoSrc } from "@/lib/avatar";
import { isCountryCode } from "@/lib/countries";
import { isRanked, rankScore } from "@/lib/ladder";

export const dynamic = "force-dynamic";

const MAX_ROWS = 100;

/**
 * Ladder of linked, verified TFT accounts ordered by Riot rank (tier -> division -> LP), read from the
 * `riot` snapshot saved on each profile (no Riot call per visit). Global by default; `?country=DO` narrows it.
 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country");
  if (country && !isCountryCode(country)) {
    return NextResponse.json({ error: "invalid country" }, { status: 400 });
  }

  const snap = await getAdminDb().collection(envCollection("users")).where("riot.verified", "==", true).get();

  const all = snap.docs
    .map((doc) => ({ data: doc.data(), id: doc.id }))
    .filter(({ data }) => isRanked(data.riot?.tier));

  const counts: Record<string, number> = {};
  for (const { data } of all) if (isCountryCode(data.country)) counts[data.country] = (counts[data.country] ?? 0) + 1;

  const rows = all
    .filter(({ data }) => !country || data.country === country)
    .map(({ data, id }) => ({
      id,
      score: rankScore(data.riot.tier, data.riot.rank ?? "", data.riot.lp ?? 0),
      name: data.displayName || data.username,
      gameName: data.riot.gameName,
      tagLine: data.riot.tagLine,
      tier: String(data.riot.tier).toUpperCase(),
      rank: data.riot.rank ?? "",
      lp: data.riot.lp ?? 0,
      country: isCountryCode(data.country) ? data.country : null,
      photoURL: resolvePhotoSrc(data),
      checkedAt: data.riot.lastCheckedAt ?? null,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, MAX_ROWS)
    .map((r, i) => ({ ...r, position: i + 1 }));

  const updatedAt = rows.reduce<string | null>((m, r) => (r.checkedAt && (!m || r.checkedAt > m) ? r.checkedAt : m), null);
  return NextResponse.json({ rows, updatedAt, countries: counts });
}

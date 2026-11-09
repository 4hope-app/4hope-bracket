import { NextRequest, NextResponse } from "next/server";
import { isCountryCode } from "@/lib/countries";
import { LADDER_PAGE_SIZE } from "@/lib/ladder";
import { getLadder } from "@/lib/ladderData";

export const dynamic = "force-dynamic";

/** Powers "See more" and search on the ladder pages. `?country=DO&q=nono&offset=25`. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const country = sp.get("country");
  if (country && !isCountryCode(country)) return NextResponse.json({ error: "invalid country" }, { status: 400 });
  const offset = Math.max(0, Number(sp.get("offset")) || 0);
  const limit = Math.min(50, Number(sp.get("limit")) || LADDER_PAGE_SIZE);
  const q = (sp.get("q") ?? "").slice(0, 40);
  const after = /^[A-Za-z0-9_-]{1,64}$/.test(sp.get("after") ?? "") ? sp.get("after") : null;
  return NextResponse.json(await getLadder({ country, q, after, offset, limit }));
}

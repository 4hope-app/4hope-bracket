import { NextRequest, NextResponse } from "next/server";
import { LADDER_PAGE_SIZE } from "@/lib/ladder";
import { getSquads } from "@/lib/squadData";

export const dynamic = "force-dynamic";

/** "See more" and search for /squads. `?after=<slug>&offset=25&q=night`. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const slug = sp.get("after") ?? "";
  return NextResponse.json(
    await getSquads({
      q: (sp.get("q") ?? "").slice(0, 24),
      after: /^[a-z0-9_-]{1,40}$/.test(slug) ? slug : null,
      offset: Math.max(0, Number(sp.get("offset")) || 0),
      limit: Math.min(50, Number(sp.get("limit")) || LADDER_PAGE_SIZE),
    }),
  );
}

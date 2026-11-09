/** Riot rank ordering for the ladder: tier, then division (I best), then LP. Apex tiers have no division, so LP decides. */
const TIER_ORDER = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
const DIVISION_ORDER: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 };

export function isRanked(tier: unknown): tier is string {
  return typeof tier === "string" && TIER_ORDER.includes(tier.toUpperCase());
}

/** Single sortable number — higher is better. */
export function rankScore(tier: string, rank: string, lp: number): number {
  const t = TIER_ORDER.indexOf(tier.toUpperCase());
  const d = DIVISION_ORDER[rank] ?? 0;
  return t * 100_000 + d * 10_000 + Math.min(Math.max(lp, 0), 9_999);
}

export function tierLabel(tier: string, rank: string): string {
  const name = tier.charAt(0) + tier.slice(1).toLowerCase();
  return ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase()) || !rank ? name : `${name} ${rank}`;
}

export const LADDER_PAGE_SIZE = 25;

/** Countries with at least this many ranked players are indexable and listed in the sitemap. */
export const MIN_INDEXABLE_PLAYERS = 1;

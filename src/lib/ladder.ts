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

/** A squad is ranked once it has this many members with a verified rank; its score is the average of its best 5. */
export const MIN_SQUAD_RANKED_MEMBERS = 2;
export const SQUAD_SCORE_MEMBERS = 5;

const DIVISIONS = ["IV", "III", "II", "I"];

/** Inverse of rankScore, for showing an averaged score as a tier / division / LP. */
export function describeScore(score: number): { tier: string; rank: string; lp: number } {
  const t = Math.min(TIER_ORDER.length - 1, Math.max(0, Math.floor(score / 100_000)));
  const rem = score - t * 100_000;
  const apex = t >= TIER_ORDER.indexOf("MASTER");
  const d = Math.min(3, Math.floor(rem / 10_000));
  return { tier: TIER_ORDER[t], rank: apex ? "" : DIVISIONS[d], lp: Math.round(rem - d * 10_000) };
}

/**
 * Multi-day tournament model + pure helpers (shared by API routes and UI).
 *
 * Flow: Player List -> Day N Lobbies (groups of LOBBY_SIZE, several games each)
 * -> Day N Standings -> top `cut` players advance and are zigzag-seeded into
 * Day N+1 lobbies.
 */

export const LOBBY_SIZE = 8;
/** Placement points: 1st = 8 ... 8th = 1. A game cell stores the points directly (as in the Sheet). */
export const MAX_POINTS = 8;
export const POINTS_SCALE = [8, 7, 6, 5, 4, 3, 2, 1];
export const MAX_PLAYERS = 512;
export const MAX_DAYS = 10;
export const MAX_GAMES = 12;

export interface TournamentPlayer {
  id: string;
  name: string;
}

export interface TournamentDay {
  /** Number of games played this day. */
  games: number;
  /** Lobbies in order; each holds its player ids (objects, not nested arrays — Firestore rejects those). */
  lobbies: { playerIds: string[] }[];
  /** points[playerId][gameIndex] — missing/null = not played yet. */
  points: Record<string, (number | null)[]>;
  /** How many top players advance to the next day (null = not set yet). */
  cut: number | null;
}

export interface StandingRow {
  playerId: string;
  name: string;
  total: number;
  wins: number;
  games: (number | null)[];
  lobby: number;
  rank: number;
}

/**
 * Zigzag (snake) distribution of seeded players into lobbies.
 * With 3 lobbies: seeds 1,2,3 -> L1,L2,L3; seeds 4,5,6 -> L3,L2,L1; and so on,
 * so every lobby ends up with a balanced mix of strong and weak seeds.
 */
export function zigzagLobbies(seededIds: string[], lobbySize = LOBBY_SIZE): string[][] {
  const count = Math.max(1, Math.ceil(seededIds.length / lobbySize));
  const lobbies: string[][] = Array.from({ length: count }, () => []);
  seededIds.forEach((id, i) => {
    const row = Math.floor(i / count);
    const pos = i % count;
    lobbies[row % 2 === 0 ? pos : count - 1 - pos].push(id);
  });
  return lobbies;
}

/**
 * Ranks a day: total points desc, then most 1st-place finishes, then the best
 * (latest) game as a last resort, then name for a stable order.
 */
export function computeStandings(day: TournamentDay, players: TournamentPlayer[]): StandingRow[] {
  const byId = new Map(players.map((p) => [p.id, p]));
  const lobbyOf = new Map<string, number>();
  day.lobbies.forEach((l, i) => l.playerIds.forEach((id) => lobbyOf.set(id, i + 1)));

  const rows = [...lobbyOf.keys()].map((playerId) => {
    const games = Array.from({ length: day.games }, (_, g) => day.points[playerId]?.[g] ?? null);
    const total = games.reduce<number>((s, v) => s + (v ?? 0), 0);
    const wins = games.filter((v) => v === MAX_POINTS).length;
    return { playerId, name: byId.get(playerId)?.name ?? "?", total, wins, games, lobby: lobbyOf.get(playerId)!, rank: 0 };
  });

  const lastScore = (r: { games: (number | null)[] }) => {
    for (let i = r.games.length - 1; i >= 0; i--) if (r.games[i] != null) return r.games[i]!;
    return 0;
  };
  rows.sort(
    (a, b) =>
      b.total - a.total || b.wins - a.wins || lastScore(b) - lastScore(a) || a.name.localeCompare(b.name),
  );
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** Player ids entering the next day: the top `cut` of this day's standings, in rank order (= the seed order). */
export function advancingIds(day: TournamentDay, players: TournamentPlayer[]): string[] {
  const cut = day.cut ?? 0;
  return computeStandings(day, players)
    .slice(0, cut)
    .map((r) => r.playerId);
}

export function newDay(seededIds: string[], games: number, cut: number | null = null): TournamentDay {
  return { games, lobbies: zigzagLobbies(seededIds).map((playerIds) => ({ playerIds })), points: {}, cut };
}

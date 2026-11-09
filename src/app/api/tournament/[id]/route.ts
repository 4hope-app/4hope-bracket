import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import {
  advancingIds, MAX_DAYS, MAX_GAMES, MAX_PLAYERS, MAX_POINTS, newDay,
  type TournamentDay, type TournamentPlayer,
} from "@/lib/tournament";

export const dynamic = "force-dynamic";

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 100_000;
const MAX_NAME = 80;
const MAX_PLAYER_NAME = 40;

type Ctx = { params: Promise<{ id: string }> };

interface TournamentDoc {
  name: string;
  ownerUserId: string;
  authorName: string;
  players: TournamentPlayer[];
  days: TournamentDay[];
  createdAt: string;
}

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

function publicView(id: string, d: TournamentDoc, isOwner: boolean) {
  return { id, name: d.name, authorName: d.authorName, players: d.players, days: d.days, createdAt: d.createdAt, isOwner };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!GUID_RE.test(id)) return bad("not found", 404);
  const snap = await getAdminDb().collection(envCollection("tournaments")).doc(id).get();
  if (!snap.exists) return bad("not found", 404);
  const session = await auth();
  const d = snap.data() as TournamentDoc;
  return NextResponse.json(publicView(id, d, !!session?.user?.id && session.user.id === d.ownerUserId));
}

/** Owner-only mutations. One `action` per request keeps every rule server-side. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!GUID_RE.test(id)) return bad("not found", 404);
  const session = await auth();
  if (!session?.user?.id) return bad("not signed in", 401);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return bad("body too large", 413);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad("invalid json");
  }

  const ref = getAdminDb().collection(envCollection("tournaments")).doc(id);
  try {
    const result = await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpError("not found", 404);
      const d = snap.data() as TournamentDoc;
      if (d.ownerUserId !== session.user!.id) throw new HttpError("forbidden", 403);

      apply(d, body);
      tx.set(ref, d);
      return d;
    });
    return NextResponse.json(publicView(id, result, true));
  } catch (e) {
    if (e instanceof HttpError) return bad(e.message, e.status);
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!GUID_RE.test(id)) return bad("not found", 404);
  const session = await auth();
  if (!session?.user?.id) return bad("not signed in", 401);
  const ref = getAdminDb().collection(envCollection("tournaments")).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return bad("not found", 404);
  if (snap.data()?.ownerUserId !== session.user.id) return bad("forbidden", 403);
  await ref.delete();
  return NextResponse.json({ ok: true });
}

class HttpError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dayAt(d: TournamentDoc, index: unknown): TournamentDay {
  if (!isInt(index, 0, MAX_DAYS - 1) || !d.days[index]) throw new HttpError("unknown day");
  return d.days[index];
}

/** Mutates `d` in place for one validated action. */
function apply(d: TournamentDoc, body: Record<string, unknown>) {
  switch (body.action) {
    case "rename": {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > MAX_NAME) throw new HttpError("invalid name");
      d.name = name;
      return;
    }

    // Replaces the Player List. Order = seed order for Day 1. Locked once Day 1 exists.
    case "setPlayers": {
      if (d.days.length) throw new HttpError("players are locked once Day 1 is created", 409);
      if (!Array.isArray(body.names)) throw new HttpError("names required");
      const names = body.names
        .map((n) => (typeof n === "string" ? n.trim() : ""))
        .filter(Boolean);
      if (names.length > MAX_PLAYERS) throw new HttpError(`max ${MAX_PLAYERS} players`);
      if (names.some((n) => n.length > MAX_PLAYER_NAME)) throw new HttpError(`player names max ${MAX_PLAYER_NAME} chars`);
      const seen = new Set<string>();
      for (const n of names) {
        const k = n.toLowerCase();
        if (seen.has(k)) throw new HttpError(`duplicate player: ${n}`);
        seen.add(k);
      }
      d.players = names.map((name, i) => ({ id: `p${i + 1}`, name }));
      return;
    }

    // Creates the next day. Day 1 = whole Player List (list order, or shuffled); Day N+1 = previous day's top `cut`.
    case "createDay": {
      if (d.days.length >= MAX_DAYS) throw new HttpError("max days reached");
      const games = body.games ?? 4;
      if (!isInt(games, 1, MAX_GAMES)) throw new HttpError("invalid games");
      let seeded: string[];
      if (!d.days.length) {
        if (d.players.length < 2) throw new HttpError("add at least 2 players first");
        seeded = d.players.map((p) => p.id);
        if (body.shuffle === true) seeded = shuffle(seeded);
      } else {
        const prev = d.days[d.days.length - 1];
        if (prev.cut == null) throw new HttpError("set the cut on the previous day first");
        seeded = advancingIds(prev, d.players);
        if (seeded.length < 2) throw new HttpError("fewer than 2 players advance");
      }
      d.days.push(newDay(seeded, games));
      return;
    }

    // Only the latest day can be removed (undo), so later days never reference deleted data.
    case "deleteLastDay": {
      if (!d.days.length) throw new HttpError("no days");
      d.days.pop();
      return;
    }

    case "setScore": {
      const day = dayAt(d, body.day);
      const { playerId, game, points } = body as { playerId?: unknown; game?: unknown; points?: unknown };
      if (typeof playerId !== "string" || !day.lobbies.some((l) => l.playerIds.includes(playerId))) throw new HttpError("player not in this day");
      if (!isInt(game, 0, day.games - 1)) throw new HttpError("invalid game");
      if (points !== null && !isInt(points, 0, MAX_POINTS)) throw new HttpError(`points must be 0-${MAX_POINTS} or empty`);
      const row = day.points[playerId] ?? Array.from({ length: day.games }, () => null as number | null);
      while (row.length < day.games) row.push(null);
      row[game] = points as number | null;
      day.points[playerId] = row;
      return;
    }

    case "setGames": {
      const day = dayAt(d, body.day);
      if (!isInt(body.games, 1, MAX_GAMES)) throw new HttpError("invalid games");
      day.games = body.games;
      for (const k of Object.keys(day.points)) day.points[k] = day.points[k].slice(0, body.games);
      return;
    }

    case "setCut": {
      const i = body.day;
      const day = dayAt(d, i);
      if ((i as number) !== d.days.length - 1) throw new HttpError("the cut can only change on the latest day", 409);
      const total = day.lobbies.reduce((s, l) => s + l.playerIds.length, 0);
      if (!isInt(body.cut, 2, total)) throw new HttpError(`cut must be between 2 and ${total}`);
      day.cut = body.cut;
      return;
    }

    default:
      throw new HttpError("unknown action");
  }
}

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button, Tabs, Textarea } from "@/components/ui";
import { Leaderboard } from "@/components/data/Leaderboard";
import { MAX_POINTS, POINTS_SCALE, type TournamentDay, type TournamentPlayer } from "@/lib/tournament";

interface Tournament {
  id: string;
  name: string;
  authorName: string;
  players: TournamentPlayer[];
  days: TournamentDay[];
  isOwner: boolean;
}

type Act = (body: Record<string, unknown>) => Promise<boolean>;

const MONO = "var(--font-mono, 'Roboto Mono', monospace)";
const TH = "px-2 py-1.5 text-left text-xs font-bold uppercase tracking-wide text-white/60";
const TD = "px-2 py-1.5 text-sm";
const NUM_INPUT = "h-9 rounded-lg border border-white/15 bg-ink-900 px-2 text-white";

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = React.useState<Tournament | null>(null);
  const [missing, setMissing] = React.useState(false);
  const [tab, setTab] = React.useState("Player List");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/tournament/${id}`)
      .then(async (r) => (r.ok ? setT(await r.json()) : setMissing(true)))
      .catch(() => setMissing(true));
  }, [id]);

  // Spectators poll so scores land without a refresh; the owner's saves already return fresh state.
  const isOwner = t?.isOwner;
  const loaded = !!t;
  React.useEffect(() => {
    if (!loaded || isOwner) return;
    const h = setInterval(() => {
      fetch(`/api/tournament/${id}`).then(async (r) => r.ok && setT(await r.json())).catch(() => {});
    }, 15_000);
    return () => clearInterval(h);
  }, [id, loaded, isOwner]);

  const act: Act = async (body) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tournament/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Something broke. Try again.");
      return false;
    }
    setT(data);
    return true;
  };

  if (missing) return <Shell><p className="text-white/70">Tournament not found.</p></Shell>;
  if (!t) return <Shell><p className="text-white/50">Loading…</p></Shell>;

  const tabs = ["Player List", ...t.days.flatMap((_, i) => [`Day ${i + 1} Lobbies`, `Day ${i + 1} Standings`])];
  const active = tabs.includes(tab) ? tab : "Player List";
  const m = /^Day (\d+) (Lobbies|Standings)$/.exec(active);
  const dayIdx = m ? Number(m[1]) - 1 : -1;
  const day = dayIdx >= 0 ? t.days[dayIdx] : null;

  return (
    <Shell>
      <p className="text-xs tracking-[0.2em] text-gold-500 uppercase" style={{ fontFamily: MONO }}>{"// Tournament · by " + (t.authorName || "—")}</p>
      <h1 className="font-display mt-2 text-4xl font-black uppercase tracking-[-0.02em]">{t.name}</h1>

      <Tabs tabs={tabs} value={active} onChange={setTab} className="mt-6 overflow-x-auto" />
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-6">
        {active === "Player List" && <PlayerList t={t} busy={busy} act={act} onCreatedDay={() => setTab("Day 1 Lobbies")} />}
        {day && m![2] === "Lobbies" && <Lobbies t={t} day={day} dayIdx={dayIdx} act={act} />}
        {day && m![2] === "Standings" && (
          <Standings
            t={t} day={day} dayIdx={dayIdx} busy={busy} act={act}
            isLast={dayIdx === t.days.length - 1}
            onNextDay={() => setTab(`Day ${dayIdx + 2} Lobbies`)}
          />
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="arena mx-auto min-h-screen max-w-6xl px-4 pt-28 pb-16">{children}</main>;
}

function PlayerList({ t, busy, act, onCreatedDay }: { t: Tournament; busy: boolean; act: Act; onCreatedDay: () => void }) {
  const [text, setText] = React.useState(t.players.map((p) => p.name).join("\n"));
  const [games, setGames] = React.useState(4);

  if (!t.isOwner || t.days.length > 0) {
    return (
      <div>
        <p className="mb-3 text-sm text-white/60" style={{ fontFamily: MONO }}>{t.players.length} PLAYERS · SEED ORDER</p>
        <ol className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.players.map((p, i) => (
            <li key={p.id} className="flex gap-3 border-b border-white/10 py-1.5 text-sm">
              <span className="w-8 text-white/40" style={{ fontFamily: MONO }}>{i + 1}</span>{p.name}
            </li>
          ))}
        </ol>
        {t.players.length === 0 && <p className="text-white/50">No players yet.</p>}
      </div>
    );
  }

  const names = text.split("\n");
  const count = names.filter((l) => l.trim()).length;
  return (
    <div className="max-w-xl">
      <p className="mb-2 text-sm text-white/70">One player per line, best seed first. Paste straight from your Sheet. The list locks once Day 1 is created.</p>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="subtle" disabled={busy} onClick={() => act({ action: "setPlayers", names })}>
          Save list ({count})
        </Button>
        <label className="flex items-center gap-2 text-sm text-white/70">
          Games per day
          <input type="number" min={1} max={12} value={games} onChange={(e) => setGames(Number(e.target.value))} className={`${NUM_INPUT} w-16`} />
        </label>
        <Button
          disabled={busy || count < 2}
          onClick={async () => {
            if (!(await act({ action: "setPlayers", names }))) return;
            if (await act({ action: "createDay", games })) onCreatedDay();
          }}
        >
          Create Day 1
        </Button>
      </div>
    </div>
  );
}

function Lobbies({ t, day, dayIdx, act }: { t: Tournament; day: TournamentDay; dayIdx: number; act: Act }) {
  const name = new Map(t.players.map((p) => [p.id, p.name]));
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {day.lobbies.map((lobby, li) => (
        <div key={li} className="overflow-x-auto rounded-[14px] border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className={TH}>Lobby {li + 1}</th>
                {Array.from({ length: day.games }, (_, g) => <th key={g} className={`${TH} text-center`}>G{g + 1}</th>)}
                <th className={`${TH} text-right`}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {lobby.playerIds.map((pid) => {
                const row = day.points[pid] ?? [];
                const total = row.reduce<number>((s, v) => s + (v ?? 0), 0);
                return (
                  <tr key={pid} className="border-t border-white/10">
                    <td className={TD}>{name.get(pid) ?? "?"}</td>
                    {Array.from({ length: day.games }, (_, g) => (
                      <td key={g} className="px-1 py-1 text-center">
                        <ScoreCell
                          key={String(row[g] ?? "")}
                          value={row[g] ?? null}
                          editable={t.isOwner}
                          onCommit={(v) => act({ action: "setScore", day: dayIdx, playerId: pid, game: g, points: v })}
                        />
                      </td>
                    ))}
                    <td className={`${TD} text-right font-bold text-gold-500`}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ScoreCell({ value, editable, onCommit }: { value: number | null; editable: boolean; onCommit: (v: number | null) => void }) {
  const [draft, setDraft] = React.useState(value == null ? "" : String(value));
  if (!editable) return <span className="text-sm">{value ?? "–"}</span>;
  return (
    <input
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 1))}
      onBlur={() => {
        const next = draft === "" ? null : Math.min(MAX_POINTS, Number(draft));
        if (next !== value) onCommit(next);
        else setDraft(value == null ? "" : String(value));
      }}
      className="h-8 w-9 rounded-md border border-white/15 bg-ink-900 text-center text-sm text-white focus:border-gold-500 focus:outline-none"
      aria-label="Points"
    />
  );
}

function Standings({ t, day, dayIdx, busy, act, isLast, onNextDay }: {
  t: Tournament; day: TournamentDay; dayIdx: number; busy: boolean; act: Act; isLast: boolean; onNextDay: () => void;
}) {
  const name = new Map(t.players.map((p) => [p.id, p.name]));
  const ids = day.lobbies.flatMap((l) => l.playerIds);
  const players = ids.map((id) => ({ id, name: name.get(id) ?? "?" }));
  const scores: Record<string, Record<number, number | null>> = {};
  for (const id of ids) scores[id] = Object.fromEntries((day.points[id] ?? []).map((v, g) => [g, v]));
  const rows = ids;
  const [cut, setCut] = React.useState(String(day.cut ?? ""));
  const [games, setGames] = React.useState(4);

  return (
    <div>
      {t.isOwner && isLast && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-white/10 p-3">
          <label className="flex items-center gap-2 text-sm text-white/70">
            Top
            <input type="number" min={2} max={rows.length} value={cut} onChange={(e) => setCut(e.target.value)} className={`${NUM_INPUT} w-20`} />
            advance
          </label>
          <Button variant="subtle" disabled={busy || !cut} onClick={() => act({ action: "setCut", day: dayIdx, cut: Number(cut) })}>Save cut</Button>
          <label className="flex items-center gap-2 text-sm text-white/70">
            Games next day
            <input type="number" min={1} max={12} value={games} onChange={(e) => setGames(Number(e.target.value))} className={`${NUM_INPUT} w-16`} />
          </label>
          <Button disabled={busy || day.cut == null || String(day.cut) !== cut} onClick={async () => { if (await act({ action: "createDay", games })) onNextDay(); }}>
            Create Day {dayIdx + 2}
          </Button>
          <Button
            variant="danger" disabled={busy}
            onClick={() => { if (confirm(`Delete Day ${dayIdx + 1} and its scores?`)) act({ action: "deleteLastDay" }); }}
          >
            Delete day
          </Button>
        </div>
      )}
      <Leaderboard
        players={players}
        roundCount={day.games}
        scores={scores}
        pointsScale={POINTS_SCALE}
        entryMode="points"
        rankMode="auto"
        cutoffRank={day.cut}
        cutoffLabel={`ADVANCE TO DAY ${dayIdx + 2}`}
        readOnly
      />
      {day.cut != null && <p className="mt-2 text-xs text-white/50" style={{ fontFamily: MONO }}>{`// TOP ${day.cut} ADVANCE`}</p>}
    </div>
  );
}

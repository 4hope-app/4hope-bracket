"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Input } from "@/components/ui";

interface Row {
  id: string;
  name: string;
  authorName: string;
  playerCount: number;
  dayCount: number;
}

const MONO = "var(--font-mono, 'Roboto Mono', monospace)";

export default function TournamentsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/tournament")
      .then((r) => r.json())
      .then((d) => setRows(d.tournaments ?? []))
      .catch(() => setRows([]));
  }, []);

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something broke. Try again.");
    router.push(`/tournaments/${data.id}`);
  }

  return (
    <main className="arena mx-auto min-h-screen max-w-3xl px-4 pt-28 pb-16">
      <p className="text-xs tracking-[0.2em] text-gold-500 uppercase" style={{ fontFamily: MONO }}>{"// Tournaments"}</p>
      <h1 className="font-display mt-2 text-4xl font-black uppercase tracking-[-0.02em]">Run it back, day by day</h1>

      <section className="mt-8 rounded-[14px] border border-white/10 p-4">
        {status === "authenticated" ? (
          <div className="flex gap-2">
            <Input placeholder="Tournament name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} wrapperClassName="flex-1" />
            <Button onClick={create} disabled={busy || !name.trim()}>Create tournament</Button>
          </div>
        ) : (
          <p className="text-white/70">
            <Link href="/login?callbackUrl=/tournaments" className="text-gold-500 underline">Sign in</Link> to host a tournament.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </section>

      <ul className="mt-6 space-y-2">
        {rows === null && <li className="text-white/50">Loading…</li>}
        {rows?.length === 0 && <li className="text-white/50">No tournaments yet. Be the first.</li>}
        {rows?.map((t) => (
          <li key={t.id}>
            <Link href={`/tournaments/${t.id}`} className="flex items-center justify-between rounded-[14px] border border-white/10 p-4 transition hover:border-gold-500">
              <span>
                <span className="font-display block text-lg font-bold uppercase">{t.name}</span>
                <span className="text-sm text-white/50">by {t.authorName || "—"}</span>
              </span>
              <span className="text-xs text-white/60 uppercase" style={{ fontFamily: MONO }}>
                {t.playerCount} players · {t.dayCount} day{t.dayCount === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

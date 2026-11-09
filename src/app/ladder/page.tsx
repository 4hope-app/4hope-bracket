"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, Button } from "@/components/ui";
import { CountrySelect } from "@/components/CountrySelect";
import { countryName } from "@/lib/countries";
import { tierLabel } from "@/lib/ladder";

interface Row {
  id: string;
  position: number;
  name: string;
  gameName: string;
  tagLine: string;
  tier: string;
  rank: string;
  lp: number;
  country: string | null;
  photoURL: string | null;
}

interface LadderData {
  rows: Row[];
  updatedAt: string | null;
  countries: Record<string, number>;
}

const MONO = "var(--font-mono, 'Roboto Mono', monospace)";
const PODIUM_RING = { 1: "ring-gold-500", 2: "ring-white/60", 3: "ring-[#B4763A]" } as const;

export default function LadderPage() {
  const { status } = useSession();
  const [country, setCountry] = React.useState("");
  const [data, setData] = React.useState<LadderData | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [myCountry, setMyCountry] = React.useState<string | null | undefined>(undefined);
  const [pick, setPick] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let live = true;
    fetch(`/api/ladder${country ? `?country=${country}` : ""}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => live && (setData(d), setFailed(false)))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [country]);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile/me")
      .then((r) => r.json())
      .then((d) => setMyCountry(d.exists ? d.profile?.country ?? null : undefined))
      .catch(() => {});
  }, [status]);

  async function saveCountry() {
    setSaving(true);
    const res = await fetch("/api/profile/country", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: pick }),
    });
    setSaving(false);
    if (res.ok) setMyCountry(pick);
  }

  const rows = data?.rows ?? [];
  const podium = [rows[1], rows[0], rows[2]].filter(Boolean) as Row[];
  const rest = rows.slice(3);
  const title = country ? `Ladder · ${countryName(country)}` : "Ladder global";

  return (
    <main className="arena mx-auto min-h-screen max-w-5xl px-4 pt-28 pb-16">
      <p className="text-xs tracking-[0.2em] text-gold-500 uppercase" style={{ fontFamily: MONO }}>{"// TFT ranked"}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-black uppercase tracking-[-0.02em]">{title}</h1>
        <div className="w-full sm:w-64">
          <CountrySelect
            value={country}
            onChange={setCountry}
            allLabel="Global"
            only={data ? Object.keys(data.countries).concat(country ? [country] : []) : undefined}
          />
        </div>
      </div>
      <p className="mt-2 text-sm text-white/50">
        Ordered by Riot tier, division and LP.
        {data?.updatedAt && ` Last update: ${new Date(data.updatedAt).toLocaleString()}.`}
      </p>

      {status === "authenticated" && myCountry === null && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-gold-500/40 p-4">
          <p className="text-sm text-white/80">Pick your country so you show up in your country&apos;s ladder.</p>
          <div className="w-56"><CountrySelect value={pick} onChange={setPick} /></div>
          <Button disabled={!pick || saving} onClick={saveCountry}>Save country</Button>
        </div>
      )}
      {status === "unauthenticated" && (
        <p className="mt-6 text-sm text-white/70">
          <Link href="/login?callbackUrl=/profile" className="text-gold-500 underline">Sign in</Link> and link your Riot ID to join the ladder.
        </p>
      )}

      {failed && <p className="mt-8 text-white/60">Couldn&apos;t load the ladder. Try again in a minute.</p>}
      {!data && !failed && <p className="mt-8 text-white/50">Loading…</p>}
      {data && rows.length === 0 && <p className="mt-8 text-white/60">Nobody ranked here yet. Link your Riot ID and be the first.</p>}

      {podium.length > 0 && (
        <div className="mt-8 grid grid-cols-3 items-end gap-3">
          {podium.map((r) => {
            const first = r.position === 1;
            return (
              <div
                key={r.id}
                className={`flex flex-col items-center rounded-[14px] border p-4 text-center ${first ? "border-gold-500 bg-gold-500/10 pb-8" : "border-white/10 bg-white/5"}`}
              >
                <Avatar src={r.photoURL} name={r.name} size="xl" className={`ring-4 ${PODIUM_RING[r.position as 1 | 2 | 3]}`} />
                <p className="font-display mt-3 max-w-full truncate text-lg font-black uppercase">
                  {r.gameName}<span className="text-sm text-white/50">#{r.tagLine}</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-white/80">{tierLabel(r.tier, r.rank)}</p>
                <p className="text-sm text-white/60"><span className="font-bold text-white">{r.lp.toLocaleString()}</span> LP</p>
                {r.country && <p className="mt-1 text-xs text-white/40" style={{ fontFamily: MONO }}>{r.country}</p>}
                <p className={`font-display mt-3 text-4xl font-black ${first ? "text-gold-500" : "text-white/70"}`}>{r.position}</p>
              </div>
            );
          })}
        </div>
      )}

      <ol className="mt-4 space-y-2">
        {rest.map((r) => (
          <li key={r.id} className="flex items-center gap-4 rounded-[14px] border border-white/10 px-4 py-2.5">
            <span className="font-display w-8 text-xl font-black text-white/50">{r.position}</span>
            <Avatar src={r.photoURL} name={r.name} size="md" />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {r.gameName}<span className="text-white/50">#{r.tagLine}</span>
            </span>
            {r.country && <span className="hidden text-xs text-white/40 sm:block" style={{ fontFamily: MONO }}>{r.country}</span>}
            <span className="w-28 text-right text-sm text-white/80">{tierLabel(r.tier, r.rank)}</span>
            <span className="w-24 text-right text-sm"><span className="font-bold">{r.lp.toLocaleString()}</span> <span className="text-white/50">LP</span></span>
          </li>
        ))}
      </ol>
    </main>
  );
}

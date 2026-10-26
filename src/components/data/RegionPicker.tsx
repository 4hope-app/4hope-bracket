"use client";

import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

export interface RegionOption {
  value: string;
  label?: string;
  group?: string;
}

interface RegionPickerProps {
  value: string;
  options: RegionOption[];
  /** [background, text] for the pill, so the cell keeps its per-region color. Ignored by the "field" variant. */
  colors?: [string, string];
  /** "pill" is the compact leaderboard cell; "field" matches the form inputs. */
  variant?: "pill" | "field";
  placeholder?: string;
  clearLabel?: string;
  /** Whether the clear action is offered. Defaults to "there is a value". */
  canClear?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
  /** Fires right after a change — lets the caller save immediately, like blurring a text cell. */
  onCommit?: () => void;
}

const mono = "var(--font-mono, 'Roboto Mono', monospace)";
const MAX_LENGTH = 20;

/**
 * Per-row Region cell: type straight into it, or open the grouped list. The list filters as you
 * type, and anything that isn't in the list can still be used (Enter or click away keeps it).
 */
export function RegionPicker({
  value, options, colors = ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.6)"], variant = "pill", placeholder = "—",
  clearLabel = "Clear region", canClear, readOnly = false, onChange, onCommit,
}: RegionPickerProps) {
  const [open, setOpen] = React.useState(false);
  // null = not editing (the box shows `value`); a string = what's being typed.
  const [draft, setDraft] = React.useState<string | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // A pick (or Enter) already saved the value, so the blur that follows must not save the draft again.
  const handledRef = React.useRef(false);
  const [bg, fg] = colors;
  const isField = variant === "field";

  const pillStyle: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
    background: bg, color: fg, border: "none", borderRadius: 5, fontFamily: mono, fontSize: 10,
    fontWeight: 700, letterSpacing: "0.06em", padding: "3px 2px", minHeight: 22,
  };

  if (readOnly) return <span style={pillStyle}>{value || "—"}</span>;

  const dirty = draft !== null && draft !== value;
  const q = dirty ? draft.trim().toLowerCase() : "";
  const matches = options.filter((o) => !q || o.value.toLowerCase().includes(q) || (o.label ?? "").toLowerCase().includes(q));
  const groups = Array.from(new Set(matches.map((o) => o.group ?? "")));
  const typed = (draft ?? "").trim().slice(0, MAX_LENGTH);
  const canUseTyped = dirty && typed !== "" && !options.some((o) => o.value.toLowerCase() === typed.toLowerCase());
  const showClear = canClear ?? Boolean(value);

  const finish = (next: string | null) => {
    handledRef.current = true;
    if (next !== null) {
      onChange(next);
      // Let the change land before the caller flushes its pending save.
      queueMicrotask(() => onCommit?.());
    }
    setDraft(null);
    setOpen(false);
    inputRef.current?.blur();
  };

  const inputClass = isField
    ? "min-w-0 flex-1 border-none bg-transparent text-[15px] text-white outline-none placeholder:text-white/40"
    : "min-w-0 flex-1 border-none bg-transparent text-center outline-none placeholder:text-current/60";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={wrapperRef}
          style={isField ? undefined : pillStyle}
          className={
            isField
              ? "flex h-[42px] w-full items-center gap-2 rounded-lg border border-white/15 bg-ink-900 px-3.5 hover:border-white/25 focus-within:border-gold-500 focus-within:ring-[3px] focus-within:ring-gold-500/26"
              : undefined
          }
        >
          <input
            ref={inputRef}
            value={draft ?? value}
            placeholder={placeholder}
            maxLength={MAX_LENGTH}
            spellCheck={false}
            autoComplete="off"
            title={isField ? undefined : "Type a region or pick one"}
            className={inputClass}
            style={isField ? undefined : { color: "inherit", font: "inherit", letterSpacing: "inherit", width: "100%", minWidth: 0 }}
            onFocus={(e) => {
              handledRef.current = false;
              setDraft(value);
              setOpen(true);
              e.currentTarget.select();
            }}
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (dirty && matches.length) finish(matches[0].value);
                else if (dirty && canUseTyped) finish(typed);
                else if (dirty) finish(typed);
                else finish(null);
              } else if (e.key === "Escape") {
                e.preventDefault();
                finish(null);
              }
            }}
            onBlur={() => {
              if (handledRef.current) return;
              // Clicking an option doesn't blur (its mousedown is cancelled), so this is a plain click-away.
              if (dirty) {
                onChange(typed);
                queueMicrotask(() => onCommit?.());
              }
              setDraft(null);
              setOpen(false);
            }}
          />
          <ChevronDown
            size={isField ? 16 : 10}
            className={isField ? "shrink-0 text-white/40" : "shrink-0"}
            style={isField ? undefined : { opacity: 0.7 }}
            aria-hidden="true"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align={isField ? "start" : "center"}
        collisionPadding={8}
        className={isField ? "w-(--radix-popover-trigger-width) min-w-56 p-2" : "w-64 p-2"}
        // Focus stays in the cell so typing keeps filtering the list.
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (wrapperRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        // Keeps the input focused (and un-blurred) while an option is clicked.
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="max-h-64 overflow-y-auto overscroll-contain pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-track]:bg-transparent">
          {groups.map((group) => (
            <div key={group || "all"} className="mb-1">
              {group ? (
                <div className="px-2 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">{group}</div>
              ) : null}
              {matches.filter((o) => (o.group ?? "") === group).map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => finish(o.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/8"
                >
                  <span className="w-12 shrink-0 font-mono text-[12px] font-bold text-white">{o.value}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-white/60">{o.label}</span>
                  {o.value === value ? <Check size={14} className="shrink-0 text-gold-500" /> : null}
                </button>
              ))}
            </div>
          ))}
          {canUseTyped ? (
            <button
              type="button"
              onClick={() => finish(typed)}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] text-gold-500 hover:bg-white/8"
            >
              Use &ldquo;{typed}&rdquo;
            </button>
          ) : null}
          {!matches.length && !canUseTyped ? <p className="m-0 px-2 py-3 text-center text-xs text-white/50">No matches.</p> : null}
        </div>
        {showClear ? (
          <button
            type="button"
            onClick={() => finish("")}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-white/55 hover:bg-white/8 hover:text-white"
          >
            {clearLabel}
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

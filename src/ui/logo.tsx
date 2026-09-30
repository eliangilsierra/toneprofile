import { cn } from "./cn";

/** Wordmark: a signal node on a line — the Signal Rail in miniature. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-sans text-[1.0625rem] font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 28 12" width="28" height="12" aria-hidden className="text-signal">
        <path d="M0 6h9M19 6h9" stroke="currentColor" strokeWidth="1.5" className="text-line-strong" />
        <circle cx="14" cy="6" r="4.5" fill="currentColor" />
      </svg>
      {/* compact: mark only on phones; the wrapping link carries the accessible name */}
      <span className={cn(compact && "max-sm:hidden")}>
        tone<span className="text-ink-muted">profile</span>
      </span>
    </span>
  );
}

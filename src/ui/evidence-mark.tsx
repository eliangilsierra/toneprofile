import { useTranslations } from "next-intl";
import type { EvidenceLevel } from "@/lib/api/types";
import { cn } from "./cn";

/*
 * Evidence glyphs are distinguishable by shape and fill, not only colour:
 * confirmed ● filled · reported ◉ ring + dot · likely ◐ half · inferred ◌ dashed · unknown ○ + "?"
 */
export function EvidenceGlyph({ level, className }: { level: EvidenceLevel; className?: string }) {
  const tone = level === "confirmed" || level === "reported" || level === "likely" ? "text-signal" : "text-ink-muted";
  return (
    <svg viewBox="0 0 12 12" width="0.8em" height="0.8em" className={cn("shrink-0", tone, className)} aria-hidden>
      {level === "confirmed" && <circle cx="6" cy="6" r="5" fill="currentColor" />}
      {level === "reported" && (
        <>
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6" cy="6" r="2" fill="currentColor" />
        </>
      )}
      {level === "likely" && (
        <>
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 1.5a4.5 4.5 0 010 9z" fill="currentColor" />
        </>
      )}
      {level === "inferred" && (
        <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 1.6" />
      )}
      {level === "unknown" && (
        <>
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M4.7 4.6a1.4 1.4 0 112 1.2c-.5.3-.7.6-.7 1.1M6 8.6v.1" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Glyph + label, with the level description available on hover and to assistive tech. */
export function EvidenceMark({ level, className }: { level: EvidenceLevel; className?: string }) {
  const t = useTranslations("Evidence");
  return (
    <span
      className={cn("label inline-flex items-center gap-1.5 !text-ink-muted", className)}
      title={t(`descriptions.${level}`)}
    >
      <EvidenceGlyph level={level} />
      {t(`levels.${level}`)}
    </span>
  );
}

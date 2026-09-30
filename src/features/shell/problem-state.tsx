"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { ClientErrorCode } from "@/lib/api/errors";
import { cn } from "@/ui/cn";
import { Alert } from "@/ui/icons";

const KNOWN = new Set<string>([
  "unsupported_format",
  "invalid_audio",
  "audio_too_short",
  "audio_too_long",
  "file_too_large",
  "no_guitar_detected",
  "multiple_guitars",
  "low_quality_audio",
  "song_not_found",
  "research_unavailable",
  "ai_unavailable",
  "mapping_failed",
  "preset_generation_failed",
  "unsupported_device",
  "job_timeout",
  "rate_limited",
  "not_found",
  "unauthorized",
  "validation_error",
  "conflict",
  "internal",
  "network",
  "unknown",
]);

type ProblemKey = Parameters<ReturnType<typeof useTranslations<"Problems">>>[0];

/** Maps any error code to its localized title/body keys (unknown codes fall back safely). */
export function useProblemCopy() {
  const t = useTranslations("Problems");
  return (code: ClientErrorCode | string) => {
    const key = KNOWN.has(code) ? code : "unknown";
    return {
      title: t(`${key}.title` as ProblemKey),
      body: t(`${key}.body` as ProblemKey),
    };
  };
}

/** Errors as product states: what happened, why, and what to do next. */
export function ProblemState({
  code,
  actions,
  tone = "danger",
  className,
  headingLevel = 2,
}: {
  code: ClientErrorCode | string;
  actions?: ReactNode;
  tone?: "danger" | "warn";
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const copy = useProblemCopy()(code);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border bg-surface-1 p-5 md:p-6",
        tone === "danger" ? "border-danger/40" : "border-warn/40",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Alert className={cn("mt-0.5 size-5 shrink-0", tone === "danger" ? "text-danger" : "text-warn")} />
        <div className="min-w-0">
          <Heading className="text-lg font-medium text-ink">{copy.title}</Heading>
          <p className="mt-1.5 max-w-prose text-ink-muted">{copy.body}</p>
          {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
          <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-faint">{code}</p>
        </div>
      </div>
    </div>
  );
}

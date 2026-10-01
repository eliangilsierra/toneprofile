"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";
import type { PerceptualTargets } from "@/lib/api/types";
import { cn } from "@/ui/cn";
import { Meter } from "@/ui/meter";
import { TARGET_ORDER, type TargetKey } from "@/visualization/tone-signature/geometry";

/**
 * Perceptual character of the tone, each with where the value came from and how sure we are.
 * Hovering or focusing a row highlights it in the Tone Signature, the chain and the fingerprint;
 * activating it pins the highlight (aria-pressed).
 */
export const Targets = memo(function Targets({
  targets,
  active = null,
  pinned = null,
  onHover,
  onTogglePin,
}: {
  targets: PerceptualTargets;
  active?: TargetKey | null;
  pinned?: TargetKey | null;
  onHover?: (key: TargetKey | null) => void;
  onTogglePin?: (key: TargetKey) => void;
}) {
  const t = useTranslations("Profile.targets");
  const te = useTranslations("Evidence.basis");
  const tc = useTranslations("Common");
  const interactive = Boolean(onTogglePin);

  return (
    <dl className="flex flex-col divide-y divide-line" onMouseLeave={() => onHover?.(null)}>
      {TARGET_ORDER.map((key) => {
        const target = targets[key];
        const name = t(`names.${key}`);
        return (
          <div
            key={key}
            onMouseEnter={() => onHover?.(key)}
            className={cn(
              "-mx-2 grid grid-cols-[minmax(7rem,9rem)_1fr] items-center gap-x-4 gap-y-1.5 rounded-xs px-2 py-3 transition-colors duration-[var(--duration-fast)] sm:grid-cols-[9rem_1fr_7.5rem]",
              active === key && "bg-surface-2",
            )}
          >
            <dt className="text-sm text-ink">
              {interactive ? (
                <button
                  type="button"
                  aria-pressed={pinned === key}
                  onClick={() => onTogglePin?.(key)}
                  onFocus={() => onHover?.(key)}
                  onBlur={() => onHover?.(null)}
                  className={cn("text-left underline-offset-4 hover:underline", pinned === key && "text-signal")}
                >
                  {name}
                </button>
              ) : (
                name
              )}
            </dt>
            <dd>
              <Meter
                value={target.value}
                label={name}
                valueText={t("value", { value: target.value })}
                tone={target.basis === "measured" ? "signal" : target.basis === "research" ? "measure" : "muted"}
              />
            </dd>
            <dd className="col-start-2 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-muted sm:col-start-3 sm:justify-end">
              <span>{te(target.basis)}</span>
              {/* On the highlighted row's background the faint ink would drop below AA: use muted. */}
              <span className={active === key ? "text-ink-muted" : "text-ink-faint"} title={tc("confidence")}>
                {Math.round(target.confidence * 100)}%
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
});

"use client";

import { useTranslations } from "next-intl";
import type { PerceptualTargets } from "@/lib/api/types";
import { Meter } from "@/ui/meter";

const ORDER = ["saturation", "low_end", "mid_emphasis", "brightness", "tightness", "compression", "ambience"] as const;

/** Perceptual character of the tone, each with where the value came from and how sure we are. */
export function Targets({ targets }: { targets: PerceptualTargets }) {
  const t = useTranslations("Profile.targets");
  const te = useTranslations("Evidence.basis");
  const tc = useTranslations("Common");

  return (
    <dl className="flex flex-col divide-y divide-line">
      {ORDER.map((key) => {
        const target = targets[key];
        const name = t(`names.${key}`);
        return (
          <div key={key} className="grid grid-cols-[minmax(7rem,9rem)_1fr] items-center gap-x-4 gap-y-1.5 py-3 sm:grid-cols-[9rem_1fr_7.5rem]">
            <dt className="text-sm text-ink">{name}</dt>
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
              <span className="text-ink-faint" title={tc("confidence")}>
                {Math.round(target.confidence * 100)}%
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

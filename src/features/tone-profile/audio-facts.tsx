"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";
import type { AudioEvidence } from "@/lib/api/types";

/** What the analyzer measured in the excerpt, stated plainly. */
export const AudioFacts = memo(function AudioFacts({ audio }: { audio: AudioEvidence }) {
  const t = useTranslations("Profile.audio");
  const tax = useTranslations("Taxonomy");
  const tc = useTranslations("Common");
  const delay = audio.ambience.delay;
  const modulation = audio.ambience.modulation;

  const rows: [string, string][] = [
    [t("gain"), `${tax(`gainClass.${audio.gain_class.value}`)} · ${tc("percent", { value: audio.gain_class.p })}`],
    [
      t("delay"),
      delay?.time_ms
        ? t("delayValue", {
            ms: delay.time_ms,
            subdivision: delay.subdivision ? tax(`subdivision.${delay.subdivision}`) : "—",
          })
        : t("delayNone"),
    ],
    [
      t("modulation"),
      modulation?.kind
        ? t("modulationValue", { kind: tax(`modulation.${modulation.kind}`), rate: modulation.rate_hz ?? 0 })
        : t("modulationNone"),
    ],
    [t("reverb"), tax(`reverbAmount.${audio.ambience.reverb}`)],
    [t("dominance"), tc("percent", { value: audio.guitar_dominance })],
  ];

  return (
    <div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <dt className="text-sm text-ink-muted">{label}</dt>
            <dd className="text-right font-mono text-sm text-ink tabular">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-ink-faint">
        {audio.separation === "stem_model" ? t("separated") : t("notSeparated")} · {Math.round(audio.analyzed_s)} s
      </p>
    </div>
  );
});

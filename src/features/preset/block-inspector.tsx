"use client";

import { useTranslations } from "next-intl";
import type { DeviceBlock, IntentBlock } from "@/lib/api/types";
import { formatParamValue, paramFraction } from "@/lib/format/params";
import { EvidenceMark } from "@/ui/evidence-mark";

/** Detail of one device block: every parameter as a readout, plus provenance and alternatives. */
export function BlockInspector({ block, intent }: { block: DeviceBlock; intent?: IntentBlock }) {
  const t = useTranslations("Preset");
  const tax = useTranslations("Taxonomy");
  const tc = useTranslations("Common");

  return (
    <div className="rounded-md border border-line-strong bg-surface-1 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label !text-signal">{block.slot}</p>
          <h3 className="mt-1 text-2xl font-medium">{block.model.name}</h3>
          {block.model.based_on && <p className="mt-1 text-sm text-ink-muted">{t("basedOn", { name: block.model.based_on })}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {intent && <EvidenceMark level={intent.evidence_level} />}
          <span className="font-mono text-xs text-ink-muted">{tc("confidenceValue", { value: block.confidence })}</span>
        </div>
      </div>

      {intent && (
        <p className="mt-3 text-sm text-ink-muted">
          {tax(`roles.${intent.role}`)} · {tax(`archetypes.${intent.archetype}`)}
        </p>
      )}

      {block.params.length > 0 && (
        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {block.params.map((param) => {
            const fraction = Math.min(1, Math.max(0, paramFraction(param)));
            return (
              <div key={param.key} className="flex flex-wrap items-baseline justify-between gap-x-3">
                <dt className="label !text-ink-muted">{param.label}</dt>
                <dd className="font-mono text-lg text-ink tabular">{formatParamValue(param)}</dd>
                <dd aria-hidden className="relative mt-2 h-1.5 w-full rounded-full bg-surface-3">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-signal/35" style={{ width: `${fraction * 100}%` }} />
                  <span
                    className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-signal bg-canvas"
                    style={{ left: `${fraction * 100}%` }}
                  />
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      <div className="mt-6 border-t border-line pt-4">
        <p className="label">{t("alternatives")}</p>
        {block.alternatives.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {block.alternatives.map((alternative) => (
              <li key={alternative.model_key} className="rounded-xs border border-line-strong px-2 py-1 text-sm text-ink-muted">
                {alternative.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-faint">{t("noAlternatives")}</p>
        )}
      </div>
    </div>
  );
}

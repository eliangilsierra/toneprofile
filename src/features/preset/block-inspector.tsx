"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";
import type { DeviceBlock, IntentBlock } from "@/lib/api/types";
import { formatParamValue, paramFraction } from "@/lib/format/params";
import { EvidenceMark } from "@/ui/evidence-mark";
import { Knob } from "@/visualization/knob";

/** Detail of one device block: every parameter as a readout, plus provenance and alternatives. */
export const BlockInspector = memo(function BlockInspector({ block, intent }: { block: DeviceBlock; intent?: IntentBlock }) {
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
        // Keyed by block: selecting another block remounts the knobs, so they sweep to their values.
        <dl key={block.slot} className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {block.params.map((param) => (
            // Visual order: knob · label · value. DOM order keeps term before its descriptions.
            <div key={param.key} className="flex items-center gap-3">
              <dt className="label order-2 min-w-0 flex-1 !text-ink-muted">{param.label}</dt>
              <dd className="order-3 font-mono text-lg text-ink tabular">{formatParamValue(param)}</dd>
              <dd aria-hidden className="order-1">
                <Knob fraction={paramFraction(param)} />
              </dd>
            </div>
          ))}
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
});

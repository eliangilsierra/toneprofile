"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import * as m from "motion/react-m";
import type { EvidenceLevel } from "@/lib/api/types";
import { duration, ease, spring } from "@/motion/tokens";
import { cn } from "@/ui/cn";
import { EvidenceGlyph } from "@/ui/evidence-mark";

export type TranslationMode = "universal" | "device";

export interface TranslationItem {
  id: string;
  /** Localized role, e.g. "Amp". */
  role: string;
  /** Localized archetype for the tone-profile view; null for device-only blocks (e.g. VOL). */
  archetype: string | null;
  evidence?: EvidenceLevel;
  confidenceLabel?: string;
  device: { slot: string; model: string; summary: string } | null;
}

/**
 * The translation: the same signal chain shown as a device-independent tone profile or as the
 * target device's modules. Blocks keep their identity (shared layout) while their content changes,
 * so the user sees each archetype *become* a device model.
 */
export function ChainTranslation({
  items,
  mode,
  selectedId,
  onSelect,
  label,
  className,
}: {
  items: TranslationItem[];
  mode: TranslationMode;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  label: string;
  className?: string;
}) {
  const visible = items.filter((item) => (mode === "universal" ? item.archetype !== null : item.device !== null));

  return (
    <LayoutGroup id="chain-translation">
      <ol aria-label={label} className={cn("flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-0", className)}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item, index) => {
            const selectable = Boolean(onSelect);
            const selected = selectedId === item.id;
            const content =
              mode === "universal" ? (
                <>
                  <span className="label">{item.role}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-snug text-ink">{item.archetype}</span>
                  {item.evidence && (
                    <span className="mt-2 flex items-center gap-1.5 font-mono text-xs text-ink-muted">
                      <EvidenceGlyph level={item.evidence} />
                      {item.confidenceLabel}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="label !text-signal">{item.device!.slot}</span>
                  <span className="mt-1 block text-[0.9375rem] font-medium leading-snug text-ink">{item.device!.model}</span>
                  <span className="mt-2 block font-mono text-xs leading-snug text-ink-muted tabular">{item.device!.summary}</span>
                </>
              );

            return (
              <m.li
                key={item.id}
                layout="position"
                layoutId={`chain-${item.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ ...spring.soft, opacity: { duration: duration.base, ease: ease.standard } }}
                className="relative flex md:w-[clamp(9.5rem,15vw,12rem)] md:pr-3"
              >
                {index < visible.length - 1 && (
                  <span aria-hidden className="absolute right-0 top-1/2 hidden h-px w-3 bg-signal/60 md:block" />
                )}
                <m.div
                  layout
                  transition={spring.soft}
                  className={cn(
                    "w-full rounded-sm border bg-surface-1 text-left",
                    mode === "device" ? "border-signal/35" : "border-line-strong",
                    selected && "border-signal bg-surface-2 ring-1 ring-signal",
                  )}
                >
                  {selectable ? (
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect?.(item.id)}
                      className="block w-full rounded-sm p-3 text-left hover:bg-surface-2"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <m.span
                          key={mode}
                          className="block"
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: duration.fast, ease: ease.standard }}
                        >
                          {content}
                        </m.span>
                      </AnimatePresence>
                    </button>
                  ) : (
                    <div className="p-3">
                      <AnimatePresence mode="wait" initial={false}>
                        <m.span
                          key={mode}
                          className="block"
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: duration.fast, ease: ease.standard }}
                        >
                          {content}
                        </m.span>
                      </AnimatePresence>
                    </div>
                  )}
                </m.div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </LayoutGroup>
  );
}

/** Two-state toggle for the translation view (native radios for keyboard + screen readers). */
export function TranslationToggle({
  mode,
  onChange,
  labels,
  name,
}: {
  mode: TranslationMode;
  onChange: (mode: TranslationMode) => void;
  labels: { group: string; universal: string; device: string };
  name: string;
}) {
  return (
    <fieldset className="inline-flex rounded-sm border border-line-strong bg-surface-1 p-0.5">
      <legend className="sr-only">{labels.group}</legend>
      {(["universal", "device"] as const).map((value) => (
        <label
          key={value}
          className={cn(
            "relative cursor-pointer rounded-xs px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors",
            "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
            mode === value ? "bg-surface-3 text-ink" : "text-ink-muted hover:text-ink",
          )}
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={mode === value}
            onChange={() => onChange(value)}
            className="sr-only"
          />
          {value === "universal" ? labels.universal : labels.device}
        </label>
      ))}
    </fieldset>
  );
}

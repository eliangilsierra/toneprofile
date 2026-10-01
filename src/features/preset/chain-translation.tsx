"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import type { EvidenceLevel, Role } from "@/lib/api/types";
import { signalHop } from "@/motion/presets";
import { duration, ease, spring, staggers } from "@/motion/tokens";
import { cn } from "@/ui/cn";
import { EvidenceGlyph } from "@/ui/evidence-mark";

export type TranslationMode = "universal" | "device";

export interface TranslationItem {
  id: string;
  /** Role in the signal chain (for cross-highlighting); null for device-only blocks. */
  roleKey?: Role | null;
  /** Localized role, e.g. "Amp". */
  role: string;
  /** Localized archetype for the tone-profile view; null for device-only blocks (e.g. VOL). */
  archetype: string | null;
  evidence?: EvidenceLevel;
  confidenceLabel?: string;
  device: { slot: string; model: string; summary: string } | null;
}

/** Counts live mode changes (derived state), so the first render never animates. */
function useModeChanges(mode: TranslationMode) {
  const [previous, setPrevious] = useState(mode);
  const [changes, setChanges] = useState(0);
  if (mode !== previous) {
    setPrevious(mode);
    setChanges((count) => count + 1);
  }
  return changes;
}

/**
 * The translation: the same signal chain shown as a device-independent tone profile or as the
 * target device's modules. Blocks keep their identity (shared layout) while their content changes
 * one after another along the signal path, and a sweep of light crosses the chain — the user sees
 * the signal *become* the device. Device-agnostic: everything comes from `items`.
 */
export function ChainTranslation({
  items,
  mode,
  selectedId,
  onSelect,
  highlightIds = null,
  label,
  className,
}: {
  items: TranslationItem[];
  mode: TranslationMode;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Blocks related to the highlighted characteristic (lifted, with an amber edge). */
  highlightIds?: Set<string> | null;
  label: string;
  className?: string;
}) {
  const visible = items.filter((item) => (mode === "universal" ? item.archetype !== null : item.device !== null));
  const changes = useModeChanges(mode);
  const sweepDuration = duration.slow + visible.length * staggers.signalHop;

  return (
    <LayoutGroup id="chain-translation">
      <div className="relative">
        {/* One sweep of light along the chain per translation (horizontal layout only). */}
        {changes > 0 && (
          <m.span
            key={changes}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 hidden bg-linear-to-r from-transparent via-signal/12 to-transparent md:block"
            initial={{ x: "-100%", opacity: 1 }}
            animate={{ x: "100%", opacity: [1, 1, 0] }}
            transition={{ duration: sweepDuration, ease: ease.linear }}
          />
        )}
        <ol aria-label={label} className={cn("flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-0", className)}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((item, index) => {
              const selectable = Boolean(onSelect);
              const selected = selectedId === item.id;
              // Highlight without dimming the others: their text must keep AA contrast.
              const related = highlightIds?.has(item.id) ?? false;
              const hop = signalHop(index);
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
              // Each block swaps after the previous one, in signal order.
              const swapped = (
                <AnimatePresence mode="wait" initial={false}>
                  <m.span
                    key={mode}
                    className="block"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: duration.fast, ease: ease.out } }}
                    exit={{ opacity: 0, y: -3, transition: { duration: duration.fast, ease: ease.in, delay: hop } }}
                  >
                    {content}
                  </m.span>
                </AnimatePresence>
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
                      // `translate` (CSS property) never conflicts with Motion's layout transforms.
                      "w-full rounded-sm border bg-surface-1 text-left transition-[border-color,box-shadow,translate] duration-[var(--duration-base)]",
                      mode === "device" ? "border-signal/35" : "border-line-strong",
                      related && "-translate-y-0.5 border-signal/70 shadow-[0_0_0_1px_rgb(255_178_63_/_0.25)]",
                      selected && "border-signal bg-surface-2 ring-1 ring-signal",
                    )}
                  >
                    {selectable ? (
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect?.(item.id)}
                        className="pressable block w-full rounded-sm p-3 text-left hover:bg-surface-2"
                      >
                        {swapped}
                      </button>
                    ) : (
                      <div className="p-3">{swapped}</div>
                    )}
                  </m.div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
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
            "relative cursor-pointer rounded-xs px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors duration-[var(--duration-fast)]",
            "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
            mode === value ? "text-ink" : "text-ink-muted hover:text-ink",
          )}
        >
          {/* The indicator slides between the two positions (shared layout within this toggle). */}
          {mode === value && (
            <m.span layoutId={`${name}-indicator`} transition={spring.snappy} aria-hidden className="absolute inset-0 rounded-xs bg-surface-3" />
          )}
          <input
            type="radio"
            name={name}
            value={value}
            checked={mode === value}
            onChange={() => onChange(value)}
            className="sr-only"
          />
          <span className="relative">{value === "universal" ? labels.universal : labels.device}</span>
        </label>
      ))}
    </fieldset>
  );
}

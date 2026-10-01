"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { memo, useMemo, useRef } from "react";
import type { PerceptualTargets, Spectrum } from "@/lib/api/types";
import { useSeenOnce } from "@/motion/hooks";
import { drawTransition, signalHop } from "@/motion/presets";
import { duration, ease } from "@/motion/tokens";
import { cn } from "@/ui/cn";
import { bandArc, GEOMETRY, SIZE, spectrumPath, targetSectors, type TargetKey } from "./geometry";

const BASIS_STROKE = {
  measured: "var(--color-signal)",
  research: "var(--color-measure)",
  inferred: "var(--color-ink-faint)",
} as const;

export interface ToneSignatureProps {
  spectrum: Spectrum | null;
  targets: PerceptualTargets;
  /** Accessible summary; the full data is on the page as text (targets list, spectrum table). */
  label: string;
  /** Short mono label in the centre (e.g. the measured gain class). */
  centerLabel?: string | null;
  activeTarget?: TargetKey | null;
  onActiveTarget?: (key: TargetKey | null) => void;
  /** Frequency range to mark on the spectrum's guide ring (from the fingerprint band). */
  activeBand?: { from: number; to: number } | null;
  className?: string;
}

/**
 * Tone Signature: the measured spectrum as a closed curve, wrapped by seven arcs for the
 * perceptual targets (colour + dash = where the value came from). It draws itself the first time
 * it is seen; with reduced motion it is simply there.
 */
export const ToneSignature = memo(function ToneSignature({
  spectrum,
  targets,
  label,
  centerLabel,
  activeTarget = null,
  onActiveTarget,
  activeBand = null,
  className,
}: ToneSignatureProps) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useSeenOnce(ref, 0.35);
  const reduce = useReducedMotion();
  const drawn = seen || Boolean(reduce);
  const sectors = useMemo(() => targetSectors(targets), [targets]);
  const curve = useMemo(() => (spectrum ? spectrumPath(spectrum) : null), [spectrum]);
  const { CENTER, SPECTRUM_INNER, SPECTRUM_OUTER } = GEOMETRY;
  const initial = reduce ? false : { pathLength: 0, opacity: 0 };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full max-w-[22rem] overflow-visible", className)}
      onPointerLeave={() => onActiveTarget?.(null)}
    >
      {/* Guides: spectrum range and the ring track. */}
      <circle cx={CENTER} cy={CENTER} r={SPECTRUM_OUTER} fill="none" stroke="var(--color-line)" strokeDasharray="2 5" />
      <circle cx={CENTER} cy={CENTER} r={SPECTRUM_INNER - 10} fill="none" stroke="var(--color-line)" />
      {activeBand && (
        <m.path
          key={`${activeBand.from}-${activeBand.to}`}
          d={bandArc(activeBand.from, activeBand.to)}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: duration.slow, ease: ease.settle }}
        />
      )}

      {/* Measured spectrum. */}
      {curve && (
        <g transform={`translate(${CENTER} ${CENTER})`}>
          <m.path
            d={curve}
            fill="var(--color-signal)"
            fillOpacity={0}
            stroke="var(--color-signal)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            initial={initial}
            animate={drawn ? { pathLength: 1, opacity: 1, fillOpacity: 0.07 } : undefined}
            transition={{ ...drawTransition, duration: duration.deliberate * 1.6, fillOpacity: { delay: duration.deliberate, duration: duration.slow } }}
          />
        </g>
      )}

      {/* Perceptual targets. */}
      {sectors.map((sector, index) => {
        const active = activeTarget === sector.key;
        const dimmed = activeTarget !== null && !active;
        return (
          <g
            key={sector.key}
            className="transition-opacity duration-[var(--duration-base)]"
            opacity={dimmed ? 0.35 : 1}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") onActiveTarget?.(sector.key);
            }}
          >
            <path d={sector.track} fill="none" stroke="var(--color-surface-3)" strokeWidth={8} strokeLinecap="butt" />
            {sector.fill && (
              <m.path
                d={sector.fill}
                fill="none"
                stroke={BASIS_STROKE[sector.basis]}
                strokeWidth={active ? 11 : 8}
                strokeLinecap="butt"
                strokeDasharray={sector.basis === "inferred" ? "3 3" : undefined}
                initial={reduce ? false : { pathLength: 0 }}
                animate={drawn ? { pathLength: 1 } : undefined}
                transition={{ ...drawTransition, delay: signalHop(index, duration.slow) }}
                style={{ transition: "stroke-width var(--duration-fast) var(--ease-standard)" }}
              />
            )}
            {active && <circle cx={sector.anchor[0]} cy={sector.anchor[1]} r={3} fill={BASIS_STROKE[sector.basis]} />}
          </g>
        );
      })}

      <circle cx={CENTER} cy={CENTER} r={2.5} fill="var(--color-ink-faint)" />
      {centerLabel && (
        <text x={CENTER} y={CENTER + 18} textAnchor="middle" className="fill-ink-muted font-mono text-[9px] uppercase tracking-[0.12em]">
          {centerLabel}
        </text>
      )}
    </svg>
  );
});

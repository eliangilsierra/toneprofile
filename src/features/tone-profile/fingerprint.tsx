"use client";

import { scaleLinear, scaleLog } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useFormatter, useTranslations } from "next-intl";
import { memo, type PointerEvent as ReactPointerEvent, useId, useMemo, useRef, useState } from "react";
import type { Spectrum } from "@/lib/api/types";
import { formatHz } from "@/lib/format/time";
import { useSeenOnce } from "@/motion/hooks";
import { drawTransition } from "@/motion/presets";
import { duration, ease, spring } from "@/motion/tokens";
import { cn } from "@/ui/cn";
import { PERCEPTUAL_BANDS, type BandKey } from "@/visualization/tone-signature/geometry";

export { PERCEPTUAL_BANDS };

const W = 800;
const H = 260;
const M = { top: 14, right: 12, bottom: 30, left: 40 };
const X_TICKS = [100, 250, 500, 1000, 2500, 5000, 10000];

/** Mean level of the 1/3-octave bands that fall inside a perceptual band. */
export function bandLevel(spectrum: Spectrum, from: number, to: number): number {
  const values = spectrum.bands_hz.flatMap((hz, index) => (hz >= from && hz < to ? [spectrum.db[index] ?? 0] : []));
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

/**
 * Tone fingerprint: loudness-normalised long-term spectrum of the guitar on a log-frequency axis,
 * with perceptual bands a guitarist can reason about. The chart is decorative for screen readers;
 * the band buttons and the table carry the same information as text.
 */
export const Fingerprint = memo(function Fingerprint({ spectrum, focusBand = null }: { spectrum: Spectrum; focusBand?: BandKey | null }) {
  const t = useTranslations("Profile.fingerprint");
  const format = useFormatter();
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const seen = useSeenOnce(svgRef, 0.4);
  const reduce = useReducedMotion();
  const drawn = seen || Boolean(reduce);
  const [hover, setHover] = useState<number | null>(null);
  const levels = useMemo(
    () => Object.fromEntries(PERCEPTUAL_BANDS.map((band) => [band.key, bandLevel(spectrum, band.from, band.to)])) as Record<BandKey, number>,
    [spectrum],
  );
  const loudest = PERCEPTUAL_BANDS.reduce((best, band) => (levels[band.key] > levels[best.key] ? band : best));
  const [chosen, setChosen] = useState<BandKey>(loudest.key);
  // A character selected in the targets list takes over while it's highlighted.
  const active = focusBand ?? chosen;

  const { x, y, linePath, areaPath, yTicks } = useMemo(() => {
    const min = Math.min(-12, Math.floor(Math.min(...spectrum.db) - 2));
    const max = Math.max(6, Math.ceil(Math.max(...spectrum.db) + 2));
    const x = scaleLog().domain([70, 14000]).range([M.left, W - M.right]);
    const y = scaleLinear().domain([min, max]).range([H - M.bottom, M.top]);
    const points = spectrum.bands_hz.map((hz, index) => [hz, spectrum.db[index] ?? 0] as [number, number]);
    const linePath = line<[number, number]>()
      .x((point) => x(point[0]))
      .y((point) => y(point[1]))
      .curve(curveMonotoneX)(points);
    const areaPath = area<[number, number]>()
      .x((point) => x(point[0]))
      .y0(H - M.bottom)
      .y1((point) => y(point[1]))
      .curve(curveMonotoneX)(points);
    const yTicks: number[] = [];
    for (let tick = Math.ceil(min / 6) * 6; tick <= max; tick += 6) yTicks.push(tick);
    return { x, y, linePath: linePath ?? "", areaPath: areaPath ?? "", yTicks };
  }, [spectrum]);

  const activeBand = PERCEPTUAL_BANDS.find((band) => band.key === active)!;

  // Crosshair: nearest measured band under the pointer (decorative; the table has the values).
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const hz = x.invert(((event.clientX - rect.left) / rect.width) * W);
    let nearest = 0;
    spectrum.bands_hz.forEach((band, index) => {
      const best = spectrum.bands_hz[nearest] ?? band;
      if (Math.abs(Math.log(band / hz)) < Math.abs(Math.log(best / hz))) nearest = index;
    });
    setHover(nearest);
  };
  const hoverHz = hover !== null ? spectrum.bands_hz[hover] : undefined;
  const hoverDb = hover !== null ? spectrum.db[hover] : undefined;

  return (
    <div>
      <div className="overflow-hidden rounded-sm border border-line bg-surface-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={t("chartLabel")}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Active band: slides to the new band instead of jumping. */}
          <m.rect
            initial={false}
            animate={{ x: x(activeBand.from), width: x(activeBand.to) - x(activeBand.from) }}
            transition={spring.soft}
            y={M.top}
            height={H - M.top - M.bottom}
            fill="var(--color-signal)"
            opacity="0.07"
          />
          {/* Grid */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--color-line)"
                strokeDasharray={tick === 0 ? undefined : "2 4"}
              />
              <text x={M.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-ink-faint font-mono text-[11px]">
                {tick > 0 ? `+${tick}` : tick}
              </text>
            </g>
          ))}
          {X_TICKS.map((tick) => (
            <text key={tick} x={x(tick)} y={H - 10} textAnchor="middle" className="fill-ink-faint font-mono text-[11px]">
              {formatHz(tick)}
            </text>
          ))}
          {PERCEPTUAL_BANDS.slice(1).map((band) => (
            <line key={band.key} x1={x(band.from)} x2={x(band.from)} y1={M.top} y2={H - M.bottom} stroke="var(--color-line-strong)" strokeDasharray="1 5" />
          ))}
          {/* The measured curve draws itself low → high frequency the first time it's seen. */}
          <m.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={reduce ? false : { opacity: 0 }}
            animate={drawn ? { opacity: 1 } : undefined}
            transition={{ duration: duration.slow, ease: ease.standard, delay: duration.deliberate }}
          />
          <m.path
            d={linePath}
            fill="none"
            stroke="var(--color-signal)"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={drawn ? { pathLength: 1 } : undefined}
            transition={{ ...drawTransition, duration: duration.deliberate * 1.6 }}
          />
          {spectrum.bands_hz.map((hz, index) => (
            <circle
              key={hz}
              cx={x(hz)}
              cy={y(spectrum.db[index] ?? 0)}
              r={hover === index ? 4 : 2}
              fill={hover === index ? "var(--color-signal)" : "var(--color-canvas)"}
              stroke="var(--color-signal)"
              strokeWidth="1.2"
              className={cn("transition-opacity duration-[var(--duration-slow)]", drawn ? "opacity-100" : "opacity-0")}
            />
          ))}
          {hoverHz !== undefined && hoverDb !== undefined && (
            <g aria-hidden className="pointer-events-none">
              <line x1={x(hoverHz)} x2={x(hoverHz)} y1={M.top} y2={H - M.bottom} stroke="var(--color-ink-faint)" strokeDasharray="2 3" />
              <text
                x={Math.min(W - M.right - 4, Math.max(M.left + 4, x(hoverHz)))}
                y={M.top + 12}
                textAnchor={x(hoverHz) > W * 0.8 ? "end" : x(hoverHz) < W * 0.2 ? "start" : "middle"}
                className="fill-ink font-mono text-[12px]"
              >
                {`${formatHz(hoverHz)}Hz · ${hoverDb > 0 ? "+" : ""}${hoverDb.toFixed(1)} dB`}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div role="group" aria-label={t("title")} className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {PERCEPTUAL_BANDS.map((band) => {
          const level = levels[band.key];
          return (
            <button
              key={band.key}
              type="button"
              aria-pressed={active === band.key}
              onClick={() => setChosen(band.key)}
              className={cn(
                "pressable relative flex flex-col items-start gap-0.5 rounded-sm border px-3 py-2 text-left",
                active === band.key ? "border-signal" : "border-line hover:border-line-strong",
              )}
            >
              {/* The selected fill slides between bands (shared layout). */}
              {active === band.key && (
                <m.span layoutId={`${gradientId}-band`} transition={spring.snappy} aria-hidden className="absolute inset-0 rounded-sm bg-signal-soft" />
              )}
              <span className="relative text-sm text-ink">{t(`bands.${band.key}`)}</span>
              <span className="relative font-mono text-xs text-ink-muted tabular">
                {level > 0 ? "+" : ""}
                {level.toFixed(1)} dB
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-3 rounded-sm border border-line bg-surface-1/60 p-4">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-medium text-ink">{t(`bands.${active}`)}</span>
          <span className="font-mono text-xs text-ink-muted">
            {t("bandRange", { from: formatHz(activeBand.from), to: `${formatHz(activeBand.to)}Hz` })} ·{" "}
            {t("bandLevel", { value: levels[active] })}
          </span>
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{t(`bandInfo.${active}`)}</p>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-muted hover:text-ink">{t("showTable")}</summary>
        <table className="mt-3 w-full max-w-md font-mono text-xs">
          <caption className="sr-only">{t("tableCaption")}</caption>
          <thead>
            <tr className="text-left text-ink-faint">
              <th scope="col" className="py-1 font-normal">
                {t("bandHeader")}
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                {t("levelHeader")}
              </th>
            </tr>
          </thead>
          <tbody>
            {spectrum.bands_hz.map((hz, index) => (
              <tr key={hz} className="border-t border-line">
                <td className="py-1 text-ink-muted">{format.number(hz)}</td>
                <td className="py-1 text-right text-ink tabular">{(spectrum.db[index] ?? 0).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
});

"use client";

import { scaleLinear, scaleLog } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import type { Spectrum } from "@/lib/api/types";
import { formatHz } from "@/lib/format/time";
import { cn } from "@/ui/cn";

export const PERCEPTUAL_BANDS = [
  { key: "body", from: 70, to: 250 },
  { key: "warmth", from: 250, to: 500 },
  { key: "mids", from: 500, to: 1500 },
  { key: "bite", from: 1500, to: 4000 },
  { key: "air", from: 4000, to: 14000 },
] as const;
type BandKey = (typeof PERCEPTUAL_BANDS)[number]["key"];

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
export function Fingerprint({ spectrum }: { spectrum: Spectrum }) {
  const t = useTranslations("Profile.fingerprint");
  const format = useFormatter();
  const gradientId = useId();
  const levels = useMemo(
    () => Object.fromEntries(PERCEPTUAL_BANDS.map((band) => [band.key, bandLevel(spectrum, band.from, band.to)])) as Record<BandKey, number>,
    [spectrum],
  );
  const loudest = PERCEPTUAL_BANDS.reduce((best, band) => (levels[band.key] > levels[best.key] ? band : best));
  const [active, setActive] = useState<BandKey>(loudest.key);

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

  return (
    <div>
      <div className="overflow-hidden rounded-sm border border-line bg-surface-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={t("chartLabel")}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Active band */}
          <rect
            x={x(activeBand.from)}
            y={M.top}
            width={x(activeBand.to) - x(activeBand.from)}
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
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke="var(--color-signal)" strokeWidth="2" strokeLinejoin="round" />
          {spectrum.bands_hz.map((hz, index) => (
            <circle key={hz} cx={x(hz)} cy={y(spectrum.db[index] ?? 0)} r="2" fill="var(--color-canvas)" stroke="var(--color-signal)" strokeWidth="1.2" />
          ))}
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
              onClick={() => setActive(band.key)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-sm border px-3 py-2 text-left transition-colors",
                active === band.key ? "border-signal bg-signal-soft" : "border-line hover:border-line-strong",
              )}
            >
              <span className="text-sm text-ink">{t(`bands.${band.key}`)}</span>
              <span className="font-mono text-xs text-ink-muted tabular">
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
}

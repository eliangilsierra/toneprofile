import { curveCatmullRomClosed, lineRadial } from "d3-shape";
import type { PerceptualTargets, Role, Spectrum } from "@/lib/api/types";

/*
 * Tone Signature geometry (pure; unit-tested). The signature is ToneProfile's visual identity for
 * a tone:
 * - an inner closed curve: the measured 1/3-octave spectrum wrapped around the circle
 *   (log-frequency → angle, level → radius), so two tones with different EQ look different;
 * - an outer ring of 7 arcs: the perceptual targets, each filling its sector by its value.
 * Everything is derived from API data; nothing is decorative noise.
 */

export const TARGET_ORDER = ["saturation", "low_end", "mid_emphasis", "brightness", "tightness", "compression", "ambience"] as const;
export type TargetKey = (typeof TARGET_ORDER)[number];

/** Chain roles most responsible for each perceptual target (for cross-highlighting the chain). */
export const TARGET_ROLES: Record<TargetKey, readonly Role[]> = {
  saturation: ["boost", "drive", "fuzz", "amp"],
  low_end: ["amp", "cab", "eq"],
  mid_emphasis: ["drive", "amp", "eq"],
  brightness: ["amp", "cab", "eq"],
  tightness: ["gate", "boost", "drive", "amp"],
  compression: ["compressor", "amp"],
  ambience: ["modulation", "delay", "reverb"],
};

/** Perceptual bands a guitarist can reason about (shared by the fingerprint and the signature). */
export const PERCEPTUAL_BANDS = [
  { key: "body", from: 70, to: 250 },
  { key: "warmth", from: 250, to: 500 },
  { key: "mids", from: 500, to: 1500 },
  { key: "bite", from: 1500, to: 4000 },
  { key: "air", from: 4000, to: 14000 },
] as const;
export type BandKey = (typeof PERCEPTUAL_BANDS)[number]["key"];

/** Fingerprint band most related to a target (null when the spectrum doesn't show it). */
export const TARGET_BAND: Record<TargetKey, BandKey | null> = {
  saturation: null,
  low_end: "body",
  mid_emphasis: "mids",
  brightness: "bite",
  tightness: null,
  compression: null,
  ambience: null,
};

export const SIZE = 320;
const CENTER = SIZE / 2;
const SPECTRUM_INNER = 54;
const SPECTRUM_OUTER = 104;
export const RING_RADIUS = 128;
/** Gap between target sectors, in radians. */
const SECTOR_GAP = 0.11;
/** Angles start at 12 o'clock and run clockwise. */
const START = -Math.PI / 2;

const LOG_MIN = Math.log10(70);
const LOG_MAX = Math.log10(14000);

/** Angle (radians, 0 = 12 o'clock, clockwise) for a frequency on the log axis. */
export function angleForHz(hz: number): number {
  const t = (Math.log10(Math.min(14000, Math.max(70, hz))) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return t * Math.PI * 2;
}

/** Closed smooth path of the spectrum around the centre, in a SIZE × SIZE viewBox. */
export function spectrumPath(spectrum: Spectrum): string {
  const min = Math.min(...spectrum.db);
  const max = Math.max(...spectrum.db);
  const span = Math.max(6, max - min);
  const points = spectrum.bands_hz.map((hz, index) => {
    const level = ((spectrum.db[index] ?? min) - min) / span;
    return [angleForHz(hz), SPECTRUM_INNER + level * (SPECTRUM_OUTER - SPECTRUM_INNER)] as [number, number];
  });
  const path = lineRadial<[number, number]>()
    .angle((point) => point[0])
    .radius((point) => point[1])
    .curve(curveCatmullRomClosed.alpha(0.5))(points);
  return path ?? "";
}

function polar(radius: number, angle: number): [number, number] {
  // d3's radial angle 0 = 12 o'clock; convert for plain SVG coordinates.
  return [CENTER + radius * Math.cos(START + angle), CENTER + radius * Math.sin(START + angle)];
}

/** SVG arc path along a circle from `from` to `to` (radians, 0 = 12 o'clock, clockwise). */
export function arcPath(radius: number, from: number, to: number): string {
  const sweep = Math.max(0, to - from);
  if (sweep <= 0.0001) return "";
  const [x0, y0] = polar(radius, from);
  const [x1, y1] = polar(radius, from + sweep);
  const large = sweep > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export interface TargetSector {
  key: TargetKey;
  /** Full sector (track). */
  track: string;
  /** Part filled by the value (empty string when the value is 0). */
  fill: string;
  value: number;
  basis: PerceptualTargets[TargetKey]["basis"];
  confidence: number;
  /** Point just outside the ring at the middle of the sector (for markers). */
  anchor: [number, number];
}

/** The seven target sectors of the outer ring, in TARGET_ORDER. */
export function targetSectors(targets: PerceptualTargets): TargetSector[] {
  const sector = (Math.PI * 2) / TARGET_ORDER.length;
  return TARGET_ORDER.map((key, index) => {
    const target = targets[key];
    const from = index * sector + SECTOR_GAP / 2;
    const to = (index + 1) * sector - SECTOR_GAP / 2;
    const value = Math.min(1, Math.max(0, target.value));
    return {
      key,
      track: arcPath(RING_RADIUS, from, to),
      fill: arcPath(RING_RADIUS, from, from + (to - from) * value),
      value,
      basis: target.basis,
      confidence: target.confidence,
      anchor: polar(RING_RADIUS + 16, (from + to) / 2),
    };
  });
}

/** Perceptual band sectors on the spectrum's inner guide ring (for highlighting a band). */
export function bandArc(from: number, to: number, radius = SPECTRUM_INNER - 10): string {
  return arcPath(radius, angleForHz(from), angleForHz(to));
}

export const GEOMETRY = { CENTER, SPECTRUM_INNER, SPECTRUM_OUTER } as const;

import type { Spectrum } from "@/lib/api/types";

/** 1/3-octave band centres used by the analyzer (80 Hz – 12.5 kHz). */
export const THIRD_OCTAVE_BANDS = [
  80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
  5000, 6300, 8000, 10000, 12500,
] as const;

export interface SpectrumShape {
  /** Gaussian bumps in log-frequency: centre (Hz), gain (dB), width (octaves). */
  bumps: { hz: number; db: number; octaves: number }[];
  /** Low-cut corner (Hz) and slope (dB/octave below the corner). */
  lowCut?: { hz: number; slope: number };
  /** High-cut corner (Hz) and slope (dB/octave above the corner) — cabinet/mic roll-off. */
  highCut: { hz: number; slope: number };
}

/** Deterministic, loudness-normalised demo spectrum (mean ≈ 0 dB). */
export function buildSpectrum(shape: SpectrumShape): Spectrum {
  const raw = THIRD_OCTAVE_BANDS.map((hz) => {
    let db = 0;
    for (const bump of shape.bumps) {
      const distance = Math.log2(hz / bump.hz) / bump.octaves;
      db += bump.db * Math.exp(-0.5 * distance * distance);
    }
    if (shape.lowCut && hz < shape.lowCut.hz) {
      db -= Math.log2(shape.lowCut.hz / hz) * shape.lowCut.slope;
    }
    if (hz > shape.highCut.hz) {
      db -= Math.log2(hz / shape.highCut.hz) * shape.highCut.slope;
    }
    return db;
  });
  const mean = raw.reduce((sum, value) => sum + value, 0) / raw.length;
  return {
    bands_hz: [...THIRD_OCTAVE_BANDS],
    db: raw.map((value) => Math.round((value - mean) * 10) / 10),
  };
}

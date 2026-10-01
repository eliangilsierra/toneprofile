import { describe, expect, it } from "vitest";
import type { PerceptualTargets } from "@/lib/api/types";
import { angleForHz, arcPath, spectrumPath, TARGET_ORDER, TARGET_ROLES, targetSectors } from "./geometry";

const target = (value: number, basis: "measured" | "research" | "inferred" = "measured") => ({ value, confidence: 0.7, basis });
const targets = Object.fromEntries(TARGET_ORDER.map((key, index) => [key, target(index / 6)])) as unknown as PerceptualTargets;

describe("tone signature geometry", () => {
  it("maps the frequency range around the full circle on a log axis", () => {
    expect(angleForHz(70)).toBeCloseTo(0);
    expect(angleForHz(14000)).toBeCloseTo(Math.PI * 2);
    // 1 kHz sits past the middle of the circle on a log axis from 70 Hz to 14 kHz.
    expect(angleForHz(1000) / (Math.PI * 2)).toBeCloseTo(0.502, 2);
    expect(angleForHz(10)).toBe(angleForHz(70));
  });

  it("builds a closed spectrum curve that depends on the levels", () => {
    const bands_hz = [100, 400, 1600, 6300];
    const flat = spectrumPath({ bands_hz, db: [0, 0, 0, 0] });
    const bright = spectrumPath({ bands_hz, db: [-6, -3, 0, 6] });
    expect(flat).toMatch(/^M/);
    expect(bright).not.toBe(flat);
  });

  it("fills each target sector in proportion to its value", () => {
    const sectors = targetSectors(targets);
    expect(sectors.map((sector) => sector.key)).toEqual([...TARGET_ORDER]);
    expect(sectors[0]!.fill).toBe(""); // value 0 → nothing filled
    expect(sectors[6]!.fill).toBe(sectors[6]!.track); // value 1 → the whole sector
    expect(sectors[3]!.fill.length).toBeGreaterThan(0);
  });

  it("draws arcs clockwise and ignores empty sweeps", () => {
    expect(arcPath(100, 1, 1)).toBe("");
    expect(arcPath(100, 0, Math.PI)).toMatch(/^M 160\.00 60\.00 A 100 100 0 0 1/);
  });

  it("links every target to chain roles for cross-highlighting", () => {
    for (const key of TARGET_ORDER) expect(TARGET_ROLES[key].length).toBeGreaterThan(0);
  });
});

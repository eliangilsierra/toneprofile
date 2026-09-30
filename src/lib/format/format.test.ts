import { describe, expect, it } from "vitest";
import type { DeviceBlock } from "@/lib/api/types";
import { blockSummary, formatParamValue, paramFraction } from "./params";
import { formatClock, formatDurationShort, formatHz } from "./time";

describe("time formatting", () => {
  it("formats clocks", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(75.9)).toBe("1:15");
    expect(formatClock(-3)).toBe("0:00");
  });
  it("formats short durations", () => {
    expect(formatDurationShort(42)).toBe("42 s");
    expect(formatDurationShort(120)).toBe("2 min");
    expect(formatDurationShort(95)).toBe("1 min 35 s");
  });
  it("formats frequencies", () => {
    expect(formatHz(80)).toBe("80");
    expect(formatHz(1000)).toBe("1k");
    expect(formatHz(1250)).toBe("1.25k");
    expect(formatHz(12500)).toBe("12.5k");
  });
});

describe("device parameters", () => {
  it("formats values by unit", () => {
    expect(formatParamValue({ key: "g", label: "Gain", value: 68.4, unit: "knob", min: 0, max: 100 })).toBe("68");
    expect(formatParamValue({ key: "t", label: "Time", value: 375, unit: "ms", min: 0, max: 2000 })).toBe("375 ms");
    expect(formatParamValue({ key: "c", label: "High Cut", value: 7200, unit: "hz", min: 1000, max: 20000 })).toBe("7.2kHz");
    expect(formatParamValue({ key: "e", label: "Mode", value: 1, unit: "enum", min: 0, max: 1, options: ["LP", "HP"] })).toBe("HP");
  });

  it("maps frequency ranges logarithmically", () => {
    const fraction = paramFraction({ key: "c", label: "Cut", value: Math.sqrt(1000 * 20000), unit: "hz", min: 1000, max: 20000 });
    expect(fraction).toBeCloseTo(0.5, 5);
  });

  it("summarises the most characteristic parameters first", () => {
    const amp: DeviceBlock = {
      slot: "AMP",
      enabled: true,
      model: { key: "amp.uk_800", name: "UK 800" },
      params: [
        { key: "volume", label: "Volume", value: 50, unit: "knob", min: 0, max: 100 },
        { key: "middle", label: "Middle", value: 66, unit: "knob", min: 0, max: 100 },
        { key: "gain", label: "Gain", value: 68, unit: "knob", min: 0, max: 100 },
      ],
      confidence: 0.7,
      alternatives: [],
    };
    expect(blockSummary(amp)).toBe("GAIN 68 · MIDDLE 66");
  });
});

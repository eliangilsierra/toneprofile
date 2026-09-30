import type { DeviceBlock, DeviceParam } from "@/lib/api/types";
import { formatHz } from "./time";

/** Device-native value as printed on a dial-in sheet (units are universal, not translated). */
export function formatParamValue(param: DeviceParam): string {
  switch (param.unit) {
    case "knob":
      return `${Math.round(param.value)}`;
    case "db":
      return `${param.value > 0 ? "+" : ""}${param.value} dB`;
    case "hz":
      return param.value >= 1000 ? `${formatHz(param.value)}Hz` : `${param.value} Hz`;
    case "ms":
      return `${Math.round(param.value)} ms`;
    case "bool":
      return param.value ? "ON" : "OFF";
    case "enum":
      return param.options?.[Math.round(param.value)] ?? `${param.value}`;
  }
}

/** Position of a value within its range (0–1) for readout bars. */
export function paramFraction(param: DeviceParam): number {
  if (param.max === param.min) return 0;
  if (param.unit === "hz" && param.min > 0) {
    return Math.log(param.value / param.min) / Math.log(param.max / param.min);
  }
  return (param.value - param.min) / (param.max - param.min);
}

// Parameters that best characterise a block, in order of importance.
const PRIORITY = ["gain", "time", "sustain", "threshold", "depth", "rate", "middle", "treble", "mix", "decay", "high_cut"];

/** Short summary of a block's most important settings, e.g. "GAIN 68 · MIDDLE 66". */
export function blockSummary(block: DeviceBlock, count = 2): string {
  const rank = (key: string) => {
    const index = PRIORITY.indexOf(key);
    return index === -1 ? PRIORITY.length : index;
  };
  return [...block.params]
    .sort((a, b) => rank(a.key) - rank(b.key))
    .slice(0, count)
    .map((param) => `${param.label.toUpperCase()} ${formatParamValue(param)}`)
    .join(" · ");
}

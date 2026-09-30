import type { DeviceBlock, DeviceParam } from "@/lib/api/types";

/*
 * Illustrative GP-180 blocks for the demo. Slot order and many model labels follow the community
 * research in docs/research/gp180-ecosystem.md; cabinet labels and exact parameter sets are
 * placeholders until the catalog is extracted from Valeton Suite (unknowns U4/U5).
 */

export const GP180_SLOTS = [
  "NR",
  "PRE",
  "WAH",
  "DST",
  "NS",
  "AMP",
  "CAB",
  "EQ",
  "MOD",
  "DLY",
  "RVB",
  "VOL",
] as const;
export type Gp180Slot = (typeof GP180_SLOTS)[number];

export const knob = (key: string, label: string, value: number): DeviceParam => ({
  key,
  label,
  value,
  unit: "knob",
  min: 0,
  max: 100,
});

export const hz = (key: string, label: string, value: number, min: number, max: number): DeviceParam => ({
  key,
  label,
  value,
  unit: "hz",
  min,
  max,
});

export const ms = (key: string, label: string, value: number, max = 2000): DeviceParam => ({
  key,
  label,
  value,
  unit: "ms",
  min: 0,
  max,
});

export function block(
  slot: Gp180Slot,
  model: { key: string; name: string; based_on?: string | null },
  params: DeviceParam[],
  extra: Partial<Pick<DeviceBlock, "intent_block_id" | "confidence" | "alternatives">> = {},
): DeviceBlock {
  return {
    slot,
    enabled: true,
    model: { based_on: null, ...model },
    params,
    intent_block_id: extra.intent_block_id ?? null,
    confidence: extra.confidence ?? 0.6,
    alternatives: extra.alternatives ?? [],
  };
}

export function off(slot: Gp180Slot): DeviceBlock {
  return {
    slot,
    enabled: false,
    model: { key: "none", name: "—", based_on: null },
    params: [],
    intent_block_id: null,
    confidence: 1,
    alternatives: [],
  };
}

/** Fills unspecified slots with bypassed blocks and returns the chain in device signal order. */
export function chain(blocks: DeviceBlock[]): DeviceBlock[] {
  return GP180_SLOTS.map((slot) => blocks.find((candidate) => candidate.slot === slot) ?? off(slot));
}

export const volumeBlock = () => block("VOL", { key: "vol.volume", name: "Volume" }, [knob("volume", "Volume", 100)], { confidence: 1 });

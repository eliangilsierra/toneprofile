import type { FieldErrors, Resolver } from "react-hook-form";
import type { SongCandidate } from "@/lib/api/types";
import { MAX_WINDOW_S, MIN_WINDOW_S } from "@/lib/audio/file";
import type { ExcerptValue } from "./excerpt-picker";

export const PICKUP_CONFIGS = ["sss", "hss", "hh", "ss", "p90", "single_humbucker", "other"] as const;
export const PICKUP_POSITIONS = ["neck", "middle", "bridge", "neck_middle", "middle_bridge", "neck_bridge"] as const;
export const TUNINGS = ["standard", "eb_standard", "drop_d", "d_standard", "drop_c", "open_g", "open_d", "other"] as const;
export const SECTIONS = ["intro", "verse", "chorus", "riff", "solo", "clean_part"] as const;

export interface GuitarValues {
  pickup_config: (typeof PICKUP_CONFIGS)[number];
  pickup_position: (typeof PICKUP_POSITIONS)[number];
  tuning: (typeof TUNINGS)[number];
}

export interface CreateToneValues extends GuitarValues {
  song: SongCandidate | null;
  excerpt: ExcerptValue | null;
  section: (typeof SECTIONS)[number] | "";
  rights: boolean;
  device_key: string;
}

/** Message keys under Create.errors / Create.summary. */
export type CreateToneError = "needsReference" | "rightsRequired" | "windowTooShort" | "windowTooLong";

/** Pure validation (the server re-validates everything). */
export function validateCreateTone(values: CreateToneValues): Partial<Record<"song" | "rights" | "excerpt", CreateToneError>> {
  const errors: Partial<Record<"song" | "rights" | "excerpt", CreateToneError>> = {};
  if (!values.song && !values.excerpt) errors.song = "needsReference";
  if (values.excerpt) {
    if (!values.rights) errors.rights = "rightsRequired";
    const length = values.excerpt.window.end - values.excerpt.window.start;
    if (length < MIN_WINDOW_S - 0.01) errors.excerpt = "windowTooShort";
    else if (length > MAX_WINDOW_S + 0.01) errors.excerpt = "windowTooLong";
  }
  return errors;
}

export const createToneResolver: Resolver<CreateToneValues> = async (values) => {
  const errors = validateCreateTone(values);
  if (Object.keys(errors).length === 0) return { values, errors: {} };
  const fieldErrors: FieldErrors<CreateToneValues> = {};
  for (const [field, message] of Object.entries(errors)) {
    fieldErrors[field as "song" | "rights" | "excerpt"] = { type: "validate", message };
  }
  return { values: {}, errors: fieldErrors };
};

/** Parses a remembered guitar from storage; anything unexpected is ignored. */
export function parseGuitar(raw: unknown): GuitarValues | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const valid =
    (PICKUP_CONFIGS as readonly unknown[]).includes(value.pickup_config) &&
    (PICKUP_POSITIONS as readonly unknown[]).includes(value.pickup_position) &&
    (TUNINGS as readonly unknown[]).includes(value.tuning);
  return valid ? (value as unknown as GuitarValues) : null;
}

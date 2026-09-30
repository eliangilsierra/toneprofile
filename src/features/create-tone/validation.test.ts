import { describe, expect, it } from "vitest";
import { parseGuitar, validateCreateTone, type CreateToneValues } from "./validation";

const base: CreateToneValues = {
  song: null,
  excerpt: null,
  section: "",
  rights: false,
  device_key: "valeton_gp180",
  pickup_config: "hss",
  pickup_position: "bridge",
  tuning: "standard",
};
const excerpt = (start: number, end: number) => ({ file: new File([], "a.wav"), preview: null, window: { start, end } });

describe("create tone validation", () => {
  it("needs a song or an excerpt", () => {
    expect(validateCreateTone(base)).toEqual({ song: "needsReference" });
    expect(validateCreateTone({ ...base, song: { id: "s", title: "T", artist: "A" } })).toEqual({});
  });

  it("requires the rights attestation and a 5–90 s window for excerpts", () => {
    expect(validateCreateTone({ ...base, excerpt: excerpt(0, 30) })).toEqual({ rights: "rightsRequired" });
    expect(validateCreateTone({ ...base, rights: true, excerpt: excerpt(0, 3) })).toEqual({ excerpt: "windowTooShort" });
    expect(validateCreateTone({ ...base, rights: true, excerpt: excerpt(0, 120) })).toEqual({ excerpt: "windowTooLong" });
    expect(validateCreateTone({ ...base, rights: true, excerpt: excerpt(10, 100) })).toEqual({});
  });

  it("ignores tampered guitar preferences", () => {
    expect(parseGuitar({ pickup_config: "hh", pickup_position: "neck", tuning: "drop_d" })).not.toBeNull();
    expect(parseGuitar({ pickup_config: "banjo", pickup_position: "neck", tuning: "drop_d" })).toBeNull();
    expect(parseGuitar("nope")).toBeNull();
  });
});

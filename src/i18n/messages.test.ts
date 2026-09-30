import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (all, [key, child]) => ({ ...all, ...flatten(child, prefix ? `${prefix}.${key}` : key) }),
    {},
  );
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();

describe("message catalogues", () => {
  const english = flatten(en);
  const spanish = flatten(es);

  it("have exactly the same keys", () => {
    expect(Object.keys(spanish).sort()).toEqual(Object.keys(english).sort());
  });

  it("have no empty strings", () => {
    expect(Object.entries({ ...english, ...spanish }).filter(([, text]) => text.trim() === "")).toEqual([]);
  });

  it("use the same ICU arguments in both languages", () => {
    const mismatched = Object.keys(english).filter(
      (key) => JSON.stringify(placeholders(english[key]!)) !== JSON.stringify(placeholders(spanish[key] ?? "")),
    );
    expect(mismatched).toEqual([]);
  });
});

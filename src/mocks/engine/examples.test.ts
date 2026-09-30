import { describe, expect, it } from "vitest";
import { exampleGenerationId, exampleRecord, getExample, listExamples } from "./examples";
import { buildToneProfile, computeGeneration } from "./generation";

const NOW = Date.parse("2026-09-30T12:00:00Z");

describe("examples", () => {
  it("lists the curated examples in order with prose in the requested locale", () => {
    const en = listExamples("en", NOW);
    const es = listExamples("es", NOW);
    expect(en.map((example) => example.slug)).toEqual(["northern-lights", "iron-parade", "porch-light"]);
    expect(es[0]!.generation_id).toBe(exampleGenerationId("northern-lights", "es"));
    expect(es[0]!.headline).not.toBe(en[0]!.headline);
  });

  it("serves finished, read-only generations", () => {
    for (const example of listExamples("en", NOW)) {
      const record = exampleRecord(example.generation_id)!;
      const { generation } = computeGeneration(record, NOW);
      expect(generation.status).toBe("ready");
      expect(buildToneProfile(record).locale).toBe("en");
    }
    expect(exampleRecord("gen_example_missing_en")).toBeUndefined();
    expect(exampleRecord("gen_abc")).toBeUndefined();
  });

  it("is honest about degraded examples", () => {
    const porch = getExample("porch-light", "en", NOW)!;
    expect(porch.warnings).toContain("research_unavailable");
    expect(porch.confidence).toBeLessThan(getExample("northern-lights", "en", NOW)!.confidence);
    expect(getExample("iron-parade", "en", NOW)!.has_reference_audio).toBe(false);
    expect(getExample("nope", "en", NOW)).toBeUndefined();
  });
});

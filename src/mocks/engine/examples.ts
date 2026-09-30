import type { ExampleSummary, Locale } from "@/lib/api/types";
import { EXAMPLES, type ExampleFixture } from "../fixtures/examples";
import { scenarioByKey } from "../fixtures/scenarios";
import { buildToneProfile, computeGeneration } from "./generation";
import type { GenerationRecord } from "./store";

/** Examples finished long ago, so every projection of them is `ready`. */
const EXAMPLE_CREATED_AT = Date.parse("2026-09-01T09:00:00Z");
const PREFIX = "gen_example_";

export const exampleGenerationId = (slug: string, locale: Locale) => `${PREFIX}${slug}_${locale}`;

export const isExampleId = (id: string) => id.startsWith(PREFIX);

function recordFor(example: ExampleFixture, locale: Locale): GenerationRecord {
  const scenario = scenarioByKey(example.scenarioKey);
  return {
    id: exampleGenerationId(example.slug, locale),
    scenarioKey: example.scenarioKey,
    createdAt: EXAMPLE_CREATED_AT,
    request: {
      song_id: scenario.song?.id ?? null,
      reference: example.window ? { upload_id: `upl_example_${example.slug}`, window: example.window } : null,
      device_key: "valeton_gp180",
      guitar: example.guitar,
      locale,
    },
    referenceWindow: example.window,
    audioFlags: [],
    attempts: [{ startedAt: EXAMPLE_CREATED_AT, startIndex: 0 }],
    cancelledAt: null,
    feedback: {},
  };
}

/** Read-only example record for a generation id, if it is one. Never stored. */
export function exampleRecord(id: string): GenerationRecord | undefined {
  if (!isExampleId(id)) return undefined;
  for (const example of EXAMPLES) {
    for (const locale of ["en", "es"] as const) {
      if (exampleGenerationId(example.slug, locale) === id) return recordFor(example, locale);
    }
  }
  return undefined;
}

function summarize(example: ExampleFixture, locale: Locale, now: number): ExampleSummary {
  const record = recordFor(example, locale);
  const { generation } = computeGeneration(record, now);
  const profile = buildToneProfile(record);
  const scenario = scenarioByKey(example.scenarioKey);
  return {
    slug: example.slug,
    generation_id: record.id,
    locale,
    song: scenario.song!,
    device_key: record.request.device_key,
    has_reference_audio: Boolean(example.window),
    gain_class: scenario.tone.gainClass.value,
    confidence: profile.confidence,
    headline: example.headline[locale],
    warnings: generation.warnings.map((warning) => warning.code),
  };
}

export function listExamples(locale: Locale, now: number): ExampleSummary[] {
  return EXAMPLES.map((example) => summarize(example, locale, now));
}

export function getExample(slug: string, locale: Locale, now: number): ExampleSummary | undefined {
  const example = EXAMPLES.find((candidate) => candidate.slug === slug);
  return example ? summarize(example, locale, now) : undefined;
}

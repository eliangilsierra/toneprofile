import type {
  ErrorCode,
  Generation,
  GenerationListItem,
  GenerationStatus,
  GenerationWarning,
  Preset,
  PresetVersion,
  Problem,
  Step,
  StepKey,
  StepSummary,
  ToneProfile,
} from "@/lib/api/types";
import { STEP_ORDER } from "@/lib/api/types";
import { buildSpectrum } from "../fixtures/spectrum";
import { localizeClaims, scenarioByKey, type Scenario, type ScenarioFailure } from "../fixtures/scenarios";
import type { GenerationRecord } from "./store";

/** Simulated step durations (ms). Totals land in the 15–25 s range so the demo stays watchable. */
export const STEP_DURATION_MS: Record<StepKey, number> = {
  resolve_song: 1400,
  analyze_audio: 6500,
  research_gear: 5200,
  draft_intent: 3800,
  map_to_device: 3000,
  validate_patch: 900,
  build_preset: 700,
};
export const QUEUE_MS = 600;
const POLL_MS = 700;
const FAILURE_FRACTION = 0.6;

interface PlanItem {
  key: StepKey;
  skip: boolean;
  durationMs: number;
}

const iso = (ms: number) => new Date(ms).toISOString();

export function problem(code: ErrorCode, retryable: boolean, hint?: string): Problem {
  const status: Partial<Record<ErrorCode, number>> = {
    ai_unavailable: 503,
    job_timeout: 504,
    no_guitar_detected: 422,
    research_unavailable: 503,
    invalid_audio: 422,
    not_found: 404,
    conflict: 409,
  };
  return {
    type: `/problems/${code}`,
    title: code.replaceAll("_", " "),
    status: status[code] ?? 500,
    code,
    retryable,
    ...(hint ? { hint } : {}),
  };
}

function plan(record: GenerationRecord): PlanItem[] {
  const hasSong = Boolean(record.request.song_id);
  const hasAudio = Boolean(record.referenceWindow);
  return STEP_ORDER.map((key) => {
    const skip =
      ((key === "resolve_song" || key === "research_gear") && !hasSong) ||
      (key === "analyze_audio" && !hasAudio);
    return { key, skip, durationMs: STEP_DURATION_MS[key] };
  });
}

/** Fatal failure for a step on a given attempt, if any. */
function fatalFailure(record: GenerationRecord, scenario: Scenario, key: StepKey, attempt: number): ScenarioFailure | null {
  if (key === "analyze_audio" && record.audioFlags.includes("noguitar")) {
    return { step: key, code: "no_guitar_detected", retryable: false, hint: "choose_other_section", once: false };
  }
  // No research and nothing to measure: refuse to invent a tone.
  if (key === "research_gear" && scenario.research === "unavailable" && !record.referenceWindow) {
    return { step: key, code: "research_unavailable", retryable: true, hint: "add_excerpt", once: false };
  }
  const failure = scenario.failure;
  if (failure && failure.step === key && (!failure.once || attempt === 0)) return failure;
  return null;
}

/** Research unavailable but audio exists: the step fails softly and the pipeline continues. */
function softFailure(record: GenerationRecord, scenario: Scenario, key: StepKey): boolean {
  return key === "research_gear" && scenario.research === "unavailable" && Boolean(record.referenceWindow);
}

function summaryFor(record: GenerationRecord, scenario: Scenario, key: StepKey): StepSummary | null {
  const tone = scenario.tone;
  switch (key) {
    case "resolve_song":
      return scenario.song
        ? { kind: "song", title: scenario.song.title, artist: scenario.song.artist, year: scenario.song.year ?? null }
        : null;
    case "analyze_audio": {
      const window = record.referenceWindow;
      if (!window) return null;
      return {
        kind: "audio",
        analyzed_s: Math.round(window.end_s - window.start_s),
        separation: "stem_model",
        guitar_dominance: tone.guitarDominance,
        gain_class: tone.gainClass,
      };
    }
    case "research_gear":
      return scenario.research === "unavailable" ? null : { kind: "research", ...scenario.research };
    case "draft_intent": {
      const amp = tone.chain.find((item) => item.role === "amp");
      return {
        kind: "intent",
        blocks: tone.chain.filter((item) => item.enabled).length,
        amp_archetype: amp?.archetype ?? "fender_blackface_clean",
      };
    }
    case "map_to_device":
      return {
        kind: "mapping",
        candidates_evaluated: tone.mappingCandidates,
        spectral_error_db: record.referenceWindow ? Math.round((1 - tone.confidence) * 40) / 10 : null,
      };
    case "validate_patch":
      return { kind: "validation", checks_passed: 5, checks_total: 5 };
    case "build_preset":
      return { kind: "preset", file_bytes: null };
  }
}

export interface ComputedGeneration {
  generation: Generation;
  /** Index of the failed step when status is "failed" (used by retry). */
  failedIndex: number | null;
}

/**
 * Pure projection of a generation record at time `now`. The same record always yields the same
 * state for the same `now`, which keeps the demo honest (no random progress) and testable.
 */
export function computeGeneration(record: GenerationRecord, now: number): ComputedGeneration {
  const scenario = scenarioByKey(record.scenarioKey);
  const items = plan(record);
  const at = record.cancelledAt !== null ? Math.min(now, record.cancelledAt) : now;

  const steps: Step[] = items.map((item) => ({
    key: item.key,
    status: item.skip ? "skipped" : "pending",
    started_at: null,
    finished_at: null,
    summary: null,
  }));
  const warnings: GenerationWarning[] = [];
  // Mutable projection state (an object, so assignments inside the loop don't fight narrowing).
  const state: { status: GenerationStatus; error: Problem | null; failedIndex: number | null } = {
    status: "queued",
    error: null,
    failedIndex: null,
  };

  record.attempts.forEach((attempt, attemptIndex) => {
    if (attemptIndex > 0 && at < attempt.startedAt) return;
    let cursor = attempt.startedAt + (attemptIndex === 0 ? QUEUE_MS : 0);
    if (at < cursor) return; // still queued
    state.status = "running";
    state.error = null;
    state.failedIndex = null;

    for (let index = attempt.startIndex; index < items.length; index++) {
      const item = items[index]!;
      const step = steps[index]!;
      if (item.skip) continue;
      const failure = fatalFailure(record, scenario, item.key, attemptIndex);
      const end = cursor + item.durationMs * (failure ? FAILURE_FRACTION : 1);

      step.started_at = iso(cursor);
      step.finished_at = null;
      step.summary = null;
      if (at < end) {
        step.status = "running";
        return;
      }
      step.finished_at = iso(end);

      if (failure) {
        step.status = "failed";
        state.status = "failed";
        state.error = problem(failure.code, failure.retryable, failure.hint);
        state.failedIndex = index;
        return;
      }
      if (softFailure(record, scenario, item.key)) {
        step.status = "failed";
        warnings.push({ code: "research_unavailable", step: item.key });
      } else {
        step.status = "done";
        step.summary = summaryFor(record, scenario, item.key);
      }
      if (item.key === "analyze_audio") {
        if (record.audioFlags.includes("multi")) warnings.push({ code: "multiple_guitars", step: item.key });
        if (record.audioFlags.includes("lowq")) warnings.push({ code: "low_quality_audio", step: item.key });
      }
      cursor = end;
    }
    state.status = "ready";
  });

  if (record.cancelledAt !== null && record.cancelledAt <= now && state.status !== "ready" && state.status !== "failed") {
    state.status = "cancelled";
    for (const step of steps) if (step.status === "running") step.status = "pending";
  }

  const expected = QUEUE_MS + items.filter((item) => !item.skip).reduce((sum, item) => sum + item.durationMs, 0);
  const p50 = Math.round(expected / 1000);
  const { status, error, failedIndex } = state;
  const terminal = status === "ready" || status === "failed" || status === "cancelled";

  return {
    failedIndex,
    generation: {
      id: record.id,
      status,
      created_at: iso(record.createdAt),
      updated_at: iso(at),
      input: {
        song: scenario.song,
        reference_window: record.referenceWindow,
        device_key: record.request.device_key,
        guitar: record.request.guitar,
        locale: record.request.locale,
      },
      steps,
      estimate: { p50_s: p50, p90_s: Math.round(p50 * 1.6) },
      poll_after_ms: terminal ? 0 : POLL_MS,
      warnings,
      result:
        status === "ready"
          ? { tone_profile_id: `tp_${record.id}`, preset_id: `pr_${record.id}`, preset_version: 1 }
          : null,
      error,
    },
  };
}

export function listItem(record: GenerationRecord, now: number): GenerationListItem {
  const { generation } = computeGeneration(record, now);
  const scenario = scenarioByKey(record.scenarioKey);
  return {
    id: record.id,
    status: generation.status,
    created_at: generation.created_at,
    device_key: record.request.device_key,
    song: scenario.song,
    has_reference_audio: Boolean(record.referenceWindow),
    preset_name: generation.status === "ready" ? scenario.tone.presetName : null,
  };
}

export function buildToneProfile(record: GenerationRecord): ToneProfile {
  const scenario = scenarioByKey(record.scenarioKey);
  const tone = scenario.tone;
  const locale = record.request.locale;
  const hasAudio = Boolean(record.referenceWindow);
  const texts = hasAudio || !tone.researchOnly ? tone : tone.researchOnly;

  // Without an excerpt nothing is measured: downgrade "measured" targets honestly.
  const targets = Object.fromEntries(
    Object.entries(tone.targets).map(([key, value]) => [
      key,
      hasAudio || value.basis !== "measured"
        ? value
        : { ...value, basis: "inferred" as const, confidence: Math.round(value.confidence * 0.6 * 100) / 100 },
    ]),
  ) as ToneProfile["intent"]["targets"];

  const window = record.referenceWindow;
  return {
    id: `tp_${record.id}`,
    generation_id: record.id,
    locale,
    summary: texts.summary[locale],
    confidence: hasAudio ? tone.confidence : Math.round(tone.confidence * 0.8 * 100) / 100,
    evidence: {
      claims: localizeClaims(tone.claims, locale),
      audio: window
        ? {
            window,
            analyzed_s: Math.round(window.end_s - window.start_s),
            separation: "stem_model",
            guitar_dominance: tone.guitarDominance,
            ltas: buildSpectrum(tone.spectrum),
            gain_class: tone.gainClass,
            ambience: tone.ambience,
          }
        : null,
    },
    intent: { chain: tone.chain, targets },
  };
}

export function buildPreset(record: GenerationRecord): Preset {
  const scenario = scenarioByKey(record.scenarioKey);
  return {
    id: `pr_${record.id}`,
    device_key: record.request.device_key,
    title: scenario.song ? `${scenario.song.title} — ${scenario.song.artist}` : scenario.tone.presetName,
    current_version: 1,
    versions: [{ version: 1, created_at: iso(record.createdAt), created_by: "generator" }],
  };
}

export function buildPresetVersion(record: GenerationRecord): PresetVersion {
  const scenario = scenarioByKey(record.scenarioKey);
  const tone = scenario.tone;
  const locale = record.request.locale;
  const texts = record.referenceWindow || !tone.researchOnly ? tone : tone.researchOnly;
  return {
    preset_id: `pr_${record.id}`,
    version: 1,
    device_key: record.request.device_key,
    catalog_version: "gp180-demo",
    name: tone.presetName.slice(0, 12),
    patch_volume: tone.patchVolume,
    bpm: tone.bpm,
    chain: tone.device,
    explanation: texts.explanation[locale],
    validation: {
      ok: true,
      checks: [
        { code: "catalog_models", ok: true },
        { code: "parameter_ranges", ok: true },
        { code: "chain_order", ok: true },
        { code: "engine_tags", ok: true },
        { code: "output_level", ok: true },
      ],
    },
    download: { available: false, filename: null, reason: "demo_mode" },
  };
}

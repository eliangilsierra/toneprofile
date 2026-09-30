import { describe, expect, it } from "vitest";
import type { GenerationCreate } from "@/lib/api/types";
import { computeGeneration, QUEUE_MS, STEP_DURATION_MS } from "./generation";
import type { GenerationRecord } from "./store";

const T0 = Date.parse("2026-09-29T12:00:00Z");

const request = (overrides: Partial<GenerationCreate> = {}): GenerationCreate => ({
  song_id: "demo-northern-lights",
  reference: null,
  device_key: "valeton_gp180",
  guitar: { pickup_config: "sss", pickup_position: "bridge", tuning: "standard" },
  locale: "en",
  ...overrides,
});

const record = (overrides: Partial<GenerationRecord> = {}): GenerationRecord => ({
  id: "gen_test",
  scenarioKey: "northern-lights",
  createdAt: T0,
  request: request(),
  referenceWindow: null,
  audioFlags: [],
  attempts: [{ startedAt: T0, startIndex: 0 }],
  cancelledAt: null,
  feedback: {},
  ...overrides,
});

const songOnlyTotal =
  QUEUE_MS +
  STEP_DURATION_MS.resolve_song +
  STEP_DURATION_MS.research_gear +
  STEP_DURATION_MS.draft_intent +
  STEP_DURATION_MS.map_to_device +
  STEP_DURATION_MS.validate_patch +
  STEP_DURATION_MS.build_preset;

describe("computeGeneration", () => {
  it("is queued first, then runs steps in order", () => {
    expect(computeGeneration(record(), T0).generation.status).toBe("queued");

    const running = computeGeneration(record(), T0 + QUEUE_MS + 10).generation;
    expect(running.status).toBe("running");
    expect(running.steps.find((step) => step.key === "resolve_song")?.status).toBe("running");
    expect(running.steps.find((step) => step.key === "analyze_audio")?.status).toBe("skipped");
    expect(running.poll_after_ms).toBeGreaterThan(0);
  });

  it("finishes with a result and structured step summaries", () => {
    const done = computeGeneration(record(), T0 + songOnlyTotal + 1).generation;
    expect(done.status).toBe("ready");
    expect(done.result?.preset_id).toBe("pr_gen_test");
    expect(done.poll_after_ms).toBe(0);
    expect(done.steps.find((step) => step.key === "research_gear")?.summary).toMatchObject({ kind: "research" });
    expect(done.estimate.p50_s).toBe(Math.round(songOnlyTotal / 1000));
  });

  it("is deterministic for the same instant", () => {
    const at = T0 + 4321;
    expect(computeGeneration(record(), at)).toEqual(computeGeneration(record(), at));
  });

  it("fails once with a retryable error and resumes from the failed step on retry", () => {
    const failing = record({ scenarioKey: "tape-hiss", request: request({ song_id: "demo-tape-hiss" }) });
    const failed = computeGeneration(failing, T0 + songOnlyTotal + 1);
    expect(failed.generation.status).toBe("failed");
    expect(failed.generation.error).toMatchObject({ code: "ai_unavailable", retryable: true });
    const failedIndex = failed.failedIndex;
    expect(failedIndex).not.toBeNull();

    const retryAt = T0 + songOnlyTotal + 2;
    const retried = { ...failing, attempts: [...failing.attempts, { startedAt: retryAt, startIndex: failedIndex! }] };
    const after = computeGeneration(retried, retryAt + songOnlyTotal).generation;
    expect(after.status).toBe("ready");
    expect(after.error).toBeNull();
    // Steps completed before the failure keep their original timing.
    expect(after.steps.find((step) => step.key === "resolve_song")?.started_at).toBe(
      failed.generation.steps.find((step) => step.key === "resolve_song")?.started_at,
    );
  });

  it("refuses to invent a tone when research is unavailable and there is no excerpt", () => {
    const porch = record({ scenarioKey: "porch-light", request: request({ song_id: "demo-porch-light" }) });
    const generation = computeGeneration(porch, T0 + songOnlyTotal + 1).generation;
    expect(generation.status).toBe("failed");
    expect(generation.error).toMatchObject({ code: "research_unavailable", hint: "add_excerpt" });
  });

  it("degrades with a warning when research is unavailable but audio was measured", () => {
    const porch = record({
      scenarioKey: "porch-light",
      request: request({ song_id: "demo-porch-light" }),
      referenceWindow: { start_s: 10, end_s: 40 },
    });
    const generation = computeGeneration(porch, T0 + 60_000).generation;
    expect(generation.status).toBe("ready");
    expect(generation.warnings).toContainEqual({ code: "research_unavailable", step: "research_gear" });
    expect(generation.steps.find((step) => step.key === "research_gear")?.status).toBe("failed");
  });

  it("fails without retry when no guitar is detected", () => {
    const noGuitar = record({ referenceWindow: { start_s: 0, end_s: 30 }, audioFlags: ["noguitar"] });
    const generation = computeGeneration(noGuitar, T0 + 60_000).generation;
    expect(generation.status).toBe("failed");
    expect(generation.error).toMatchObject({ code: "no_guitar_detected", retryable: false, hint: "choose_other_section" });
  });

  it("stops progressing once cancelled", () => {
    const cancelledAt = T0 + QUEUE_MS + 500;
    const generation = computeGeneration(record({ cancelledAt }), T0 + 60_000).generation;
    expect(generation.status).toBe("cancelled");
    expect(generation.steps.every((step) => step.status !== "running" && step.status !== "done")).toBe(true);
    expect(generation.result).toBeNull();
  });
});

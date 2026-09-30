import { delay, http, HttpResponse } from "msw";
import type {
  Device,
  ErrorCode,
  FeedbackCreate,
  Locale,
  GenerationCreate,
  Problem,
  Upload,
  UploadCreate,
  UploadTicket,
} from "@/lib/api/types";
import { SCENARIOS, scenarioForSong } from "./fixtures/scenarios";
import {
  buildPreset,
  buildPresetVersion,
  buildToneProfile,
  computeGeneration,
  listItem,
  problem,
} from "./engine/generation";
import { exampleRecord, getExample, isExampleId, listExamples } from "./engine/examples";
import { newId, store, type GenerationRecord } from "./engine/store";

/*
 * In-browser demo backend implementing docs/api/openapi-v1.yaml. It is only loaded when
 * NEXT_PUBLIC_API_MODE=mock and never ships in the "http" bundle's code paths.
 */

const API = "/api/v1";
const PROBE_MS = 1500;
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
]);
const AUDIO_FLAGS = ["noguitar", "multi", "lowq", "corrupt"];

const DEVICES: Device[] = [
  {
    key: "valeton_gp180",
    vendor: "Valeton",
    name: "GP-180",
    status: "available",
    delivery: ["preset_file", "dial_in_sheet"],
    file_extension: ".prst",
    import_via: "Valeton Suite",
  },
];

function fail(code: ErrorCode, status: number, retryable = false, hint?: string) {
  const body: Problem = { ...problem(code, retryable, hint), status };
  return HttpResponse.json(body, { status, headers: { "Content-Type": "application/problem+json" } });
}

function flagsFor(filename: string): string[] {
  const name = filename.toLowerCase().replaceAll(/[^a-z]/g, "");
  return AUDIO_FLAGS.filter((flag) => name.includes(flag));
}

function uploadView(id: string, now: number): Upload | null {
  const record = store.getUpload(id);
  if (!record) return null;
  const base: Upload = {
    id: record.id,
    purpose: record.purpose,
    status: "awaiting_upload",
    duration_s: null,
    sample_rate: null,
    channels: null,
    error: null,
  };
  if (record.completedAt === null) return base;
  if (now - record.completedAt < PROBE_MS) return { ...base, status: "probing" };
  if (flagsFor(record.filename).includes("corrupt")) {
    return { ...base, status: "rejected", error: problem("invalid_audio", false) };
  }
  return { ...base, status: "ready", sample_rate: 48000, channels: 2 };
}

/** Curated examples are read-only and never stored; everything else lives in the demo store. */
function generationRecord(id: string): GenerationRecord | undefined {
  return exampleRecord(id) ?? store.getGeneration(id);
}

function localeParam(request: Request): Locale {
  return new URL(request.url).searchParams.get("locale") === "es" ? "es" : "en";
}

/** tp_<generationId> / pr_<generationId> → generation record, only once the generation is ready. */
function readyRecordFor(resourceId: string, prefix: "tp_" | "pr_"): GenerationRecord | null {
  if (!resourceId.startsWith(prefix)) return null;
  const record = generationRecord(resourceId.slice(prefix.length));
  if (!record) return null;
  return computeGeneration(record, Date.now()).generation.status === "ready" ? record : null;
}

export const handlers = [
  http.get(`${API}/devices`, async () => {
    await delay(80);
    return HttpResponse.json({ items: DEVICES });
  }),

  http.get(`${API}/songs/search`, async ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    if (query.length < 2) return fail("validation_error", 400);
    await delay(220);
    const items = SCENARIOS.flatMap((scenario) => (scenario.song ? [scenario.song] : [])).filter(
      (song) => song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query),
    );
    return HttpResponse.json({ items });
  }),

  http.post(`${API}/uploads`, async ({ request }) => {
    const body = (await request.json()) as UploadCreate;
    if (!ALLOWED_TYPES.has(body.content_type)) return fail("unsupported_format", 415);
    if (body.size_bytes > MAX_BYTES) return fail("file_too_large", 413);
    const id = newId("up");
    store.putUpload({
      id,
      purpose: body.purpose,
      filename: body.filename,
      sizeBytes: body.size_bytes,
      createdAt: Date.now(),
      completedAt: null,
    });
    const ticket: UploadTicket = {
      upload_id: id,
      put_url: `/api/mock-storage/${id}`,
      headers: { "Content-Type": body.content_type },
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
      max_bytes: MAX_BYTES,
    };
    return HttpResponse.json(ticket, { status: 201 });
  }),

  // Stands in for the presigned object-storage URL.
  http.put("/api/mock-storage/:uploadId", async () => {
    await delay(400);
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(`${API}/uploads/:uploadId/complete`, ({ params }) => {
    const record = store.getUpload(String(params.uploadId));
    if (!record) return fail("not_found", 404);
    store.putUpload({ ...record, completedAt: Date.now() });
    return HttpResponse.json(uploadView(record.id, Date.now()), { status: 202 });
  }),

  http.get(`${API}/uploads/:uploadId`, ({ params }) => {
    const view = uploadView(String(params.uploadId), Date.now());
    return view ? HttpResponse.json(view) : fail("not_found", 404);
  }),

  http.get(`${API}/examples`, async ({ request }) => {
    await delay(120);
    return HttpResponse.json({ items: listExamples(localeParam(request), Date.now()) });
  }),

  http.get(`${API}/examples/:slug`, async ({ params, request }) => {
    await delay(80);
    const example = getExample(String(params.slug), localeParam(request), Date.now());
    return example ? HttpResponse.json(example) : fail("not_found", 404);
  }),

  http.get(`${API}/generations`, async () => {
    await delay(120);
    const now = Date.now();
    return HttpResponse.json({ items: store.listGenerations().map((record) => listItem(record, now)), next_cursor: null });
  }),

  http.post(`${API}/generations`, async ({ request }) => {
    const body = (await request.json()) as GenerationCreate;
    if (!body.song_id && !body.reference) return fail("validation_error", 422);
    if (!DEVICES.some((device) => device.key === body.device_key && device.status === "available")) {
      return fail("unsupported_device", 422);
    }
    let audioFlags: string[] = [];
    if (body.reference) {
      const upload = store.getUpload(body.reference.upload_id);
      const view = upload ? uploadView(upload.id, Date.now()) : null;
      if (!upload || view?.status !== "ready") return fail("validation_error", 422);
      const length = body.reference.window.end_s - body.reference.window.start_s;
      if (length < 5) return fail("audio_too_short", 422);
      if (length > 90.5) return fail("validation_error", 422);
      audioFlags = flagsFor(upload.filename);
    }
    const now = Date.now();
    const record: GenerationRecord = {
      id: newId("gen"),
      scenarioKey: scenarioForSong(body.song_id).key,
      createdAt: now,
      request: body,
      referenceWindow: body.reference?.window ?? null,
      audioFlags,
      attempts: [{ startedAt: now, startIndex: 0 }],
      cancelledAt: null,
      feedback: {},
    };
    store.putGeneration(record);
    return HttpResponse.json(computeGeneration(record, now).generation, {
      status: 202,
      headers: { Location: `${API}/generations/${record.id}` },
    });
  }),

  http.get(`${API}/generations/:generationId`, ({ params }) => {
    const record = generationRecord(String(params.generationId));
    return record ? HttpResponse.json(computeGeneration(record, Date.now()).generation) : fail("not_found", 404);
  }),

  http.post(`${API}/generations/:generationId/cancel`, ({ params }) => {
    const record = generationRecord(String(params.generationId));
    if (!record) return fail("not_found", 404);
    if (isExampleId(record.id)) return fail("conflict", 409);
    const now = Date.now();
    const { generation } = computeGeneration(record, now);
    if (generation.status !== "queued" && generation.status !== "running") return fail("conflict", 409);
    const next = { ...record, cancelledAt: now };
    store.putGeneration(next);
    return HttpResponse.json(computeGeneration(next, now).generation);
  }),

  http.post(`${API}/generations/:generationId/retry`, ({ params }) => {
    const record = generationRecord(String(params.generationId));
    if (!record) return fail("not_found", 404);
    if (isExampleId(record.id)) return fail("conflict", 409);
    const now = Date.now();
    const { generation, failedIndex } = computeGeneration(record, now);
    if (generation.status !== "failed" || !generation.error?.retryable || failedIndex === null) {
      return fail("conflict", 409);
    }
    const next = { ...record, attempts: [...record.attempts, { startedAt: now, startIndex: failedIndex }] };
    store.putGeneration(next);
    return HttpResponse.json(computeGeneration(next, now).generation, { status: 202 });
  }),

  http.get(`${API}/tone-profiles/:toneProfileId`, async ({ params }) => {
    await delay(150);
    const record = readyRecordFor(String(params.toneProfileId), "tp_");
    return record ? HttpResponse.json(buildToneProfile(record)) : fail("not_found", 404);
  }),

  http.get(`${API}/presets/:presetId`, async ({ params }) => {
    await delay(100);
    const record = readyRecordFor(String(params.presetId), "pr_");
    return record ? HttpResponse.json(buildPreset(record)) : fail("not_found", 404);
  }),

  http.get(`${API}/presets/:presetId/versions/:version`, async ({ params }) => {
    await delay(120);
    const record = readyRecordFor(String(params.presetId), "pr_");
    if (!record || Number(params.version) !== 1) return fail("not_found", 404);
    return HttpResponse.json(buildPresetVersion(record));
  }),

  http.get(`${API}/presets/:presetId/versions/:version/download`, ({ params }) => {
    const record = readyRecordFor(String(params.presetId), "pr_");
    if (!record) return fail("not_found", 404);
    return fail("conflict", 409, false, "demo_mode");
  }),

  http.post(`${API}/presets/:presetId/versions/:version/feedback`, async ({ params, request }) => {
    const record = readyRecordFor(String(params.presetId), "pr_");
    if (!record) return fail("not_found", 404);
    if (isExampleId(record.id)) return fail("conflict", 409);
    const body = (await request.json()) as FeedbackCreate;
    if (!Number.isInteger(body.usefulness) || body.usefulness < 1 || body.usefulness > 5) {
      return fail("validation_error", 400);
    }
    await delay(250);
    store.putGeneration({ ...record, feedback: { ...record.feedback, [Number(params.version)]: body } });
    return new HttpResponse(null, { status: 201 });
  }),
];

import type { components } from "./schema";

// Friendly aliases over the generated OpenAPI schema (docs/api/openapi-v1.yaml).
type S = components["schemas"];

export type Locale = S["Locale"];
export type ErrorCode = S["ErrorCode"];
export type Problem = S["Problem"];
export type Device = S["Device"];
export type SongCandidate = S["SongCandidate"];
export type UploadCreate = S["UploadCreate"];
export type UploadTicket = S["UploadTicket"];
export type Upload = S["Upload"];
export type TimeWindow = S["TimeWindow"];
export type PickupConfig = S["PickupConfig"];
export type PickupPosition = S["PickupPosition"];
export type Tuning = S["Tuning"];
export type GuitarInput = S["GuitarInput"];
export type GenerationCreate = S["GenerationCreate"];
export type GenerationStatus = S["GenerationStatus"];
export type StepKey = S["StepKey"];
export type StepStatus = S["StepStatus"];
export type StepSummary = S["StepSummary"];
export type Step = S["Step"];
export type GenerationWarning = S["Warning"];
export type Generation = S["Generation"];
export type GenerationListItem = S["GenerationListItem"];
export type EvidenceLevel = S["EvidenceLevel"];
export type Role = S["Role"];
export type Archetype = S["Archetype"];
export type GainClass = S["GainClass"];
export type GainClassEstimate = S["GainClassEstimate"];
export type Source = S["Source"];
export type Claim = S["Claim"];
export type Spectrum = S["Spectrum"];
export type AudioEvidence = S["AudioEvidence"];
export type PerceptualTarget = S["PerceptualTarget"];
export type IntentBlock = S["IntentBlock"];
export type ToneProfile = S["ToneProfile"];
export type PerceptualTargets = ToneProfile["intent"]["targets"];
export type DeviceParam = S["DeviceParam"];
export type DeviceBlock = S["DeviceBlock"];
export type Preset = S["Preset"];
export type PresetVersion = S["PresetVersion"];
export type FeedbackCreate = S["FeedbackCreate"];
export type ExampleSummary = S["ExampleSummary"];

export const STEP_ORDER: readonly StepKey[] = [
  "resolve_song",
  "analyze_audio",
  "research_gear",
  "draft_intent",
  "map_to_device",
  "validate_patch",
  "build_preset",
];

export const TERMINAL_STATUSES: readonly GenerationStatus[] = ["ready", "failed", "cancelled"];

export function isTerminal(status: GenerationStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

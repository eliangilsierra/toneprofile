import type { UploadCreate } from "@/lib/api/types";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MIN_AUDIO_S = 5;
export const MAX_AUDIO_S = 600;
export const MIN_WINDOW_S = 5;
export const MAX_WINDOW_S = 90;

const BY_EXTENSION: Record<string, UploadCreate["content_type"]> = {
  wav: "audio/wav",
  wave: "audio/wav",
  flac: "audio/flac",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
};

export const ACCEPT_ATTRIBUTE = ".wav,.flac,.mp3,.m4a,.aac,.ogg,.oga,.opus,audio/*";

/** Content type from the extension (browsers often report an empty or generic MIME type). */
export function contentTypeFor(file: File): UploadCreate["content_type"] | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[extension] ?? null;
}

export type FileCheck = "unsupported_format" | "file_too_large" | null;

/** Cheap checks before decoding. The server re-validates everything (never trust the client). */
export function checkFile(file: File): FileCheck {
  if (!contentTypeFor(file)) return "unsupported_format";
  if (file.size > MAX_UPLOAD_BYTES) return "file_too_large";
  return null;
}

export type DurationCheck = "audio_too_short" | "audio_too_long" | null;

export function checkDuration(seconds: number): DurationCheck {
  if (seconds < MIN_AUDIO_S) return "audio_too_short";
  if (seconds > MAX_AUDIO_S) return "audio_too_long";
  return null;
}

/** Default analysis window: up to 30 s starting a little into the file. */
export function defaultWindow(duration: number): { start: number; end: number } {
  const length = Math.min(30, duration);
  const start = duration > 60 ? Math.min(15, duration - length) : 0;
  return { start, end: start + length };
}

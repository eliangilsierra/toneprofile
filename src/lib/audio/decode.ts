/**
 * Decodes an audio file in the browser for preview only (waveform + duration). Decoding at 8 kHz
 * mono keeps memory bounded (a 10-minute file ≈ 19 MB of samples) — analysis happens server-side.
 */
const PREVIEW_RATE = 8000;
export const PEAK_BUCKETS = 720;

export interface AudioPreview {
  duration: number;
  /** Normalised peak amplitude per bucket (0–1). */
  peaks: number[];
}

export function canDecode(): boolean {
  return typeof window !== "undefined" && typeof window.OfflineAudioContext !== "undefined";
}

export async function decodePreview(file: File): Promise<AudioPreview> {
  const buffer = await file.arrayBuffer();
  const context = new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate: PREVIEW_RATE });
  const audio = await context.decodeAudioData(buffer);
  return { duration: audio.duration, peaks: computePeaks(audio) };
}

export function computePeaks(audio: Pick<AudioBuffer, "numberOfChannels" | "length" | "getChannelData">, buckets = PEAK_BUCKETS): number[] {
  const channels = Array.from({ length: audio.numberOfChannels }, (_, index) => audio.getChannelData(index));
  const size = Math.max(1, Math.floor(audio.length / buckets));
  const peaks: number[] = [];
  let max = 0;
  for (let bucket = 0; bucket < buckets; bucket++) {
    let peak = 0;
    const start = bucket * size;
    const end = Math.min(audio.length, start + size);
    for (let index = start; index < end; index++) {
      for (const channel of channels) {
        const value = Math.abs(channel[index] ?? 0);
        if (value > peak) peak = value;
      }
    }
    peaks.push(peak);
    if (peak > max) max = peak;
  }
  return max > 0 ? peaks.map((peak) => peak / max) : peaks;
}

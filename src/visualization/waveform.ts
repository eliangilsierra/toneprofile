"use client";

import { useEffect, type RefObject } from "react";

/*
 * Canvas waveform shared by the excerpt picker and the analysis page. Bars are the real peaks
 * computed from the user's file (lib/audio/decode.ts) — nothing is synthesised.
 */

export interface WaveformStyle {
  /** CSS custom property on the canvas that holds the bar colour. */
  colorVar?: string;
  fallback?: string;
}

/** Draws `peaks` into the canvas; `reveal` (0–1) limits drawing to the left part (draw-in). */
export function drawWaveform(canvas: HTMLCanvasElement, peaks: readonly number[], reveal = 1, style: WaveformStyle = {}) {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  const targetW = Math.max(1, Math.round(width * ratio));
  const targetH = Math.max(1, Math.round(height * ratio));
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  const context = canvas.getContext("2d");
  if (!context || peaks.length === 0) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const styles = getComputedStyle(canvas);
  context.fillStyle = styles.getPropertyValue(style.colorVar ?? "--wave-color").trim() || style.fallback || "#75736e";
  const bar = width / peaks.length;
  const mid = height / 2;
  const visible = Math.ceil(peaks.length * Math.min(1, Math.max(0, reveal)));
  for (let index = 0; index < visible; index++) {
    const h = Math.max(1, (peaks[index] ?? 0) * (height - 4));
    context.fillRect(index * bar, mid - h / 2, Math.max(1, bar - 0.6), h);
  }
}

/** Peaks inside a time window of a clip (for drawing only the analysed passage). */
export function slicePeaks(peaks: readonly number[], duration: number, start: number, end: number): number[] {
  if (duration <= 0 || peaks.length === 0) return [];
  const from = Math.max(0, Math.floor((start / duration) * peaks.length));
  const to = Math.min(peaks.length, Math.ceil((end / duration) * peaks.length));
  return peaks.slice(from, Math.max(from + 1, to));
}

/**
 * Keeps a canvas drawn with `peaks` (redraws on resize). With `drawIn`, the first paint sweeps in
 * left → right over `durationMs` — the order the audio is heard — unless reduced motion is set.
 */
export function useWaveformCanvas(
  ref: RefObject<HTMLCanvasElement | null>,
  peaks: readonly number[],
  {
    drawIn = false,
    durationMs = 560,
    style,
    redrawKey,
  }: { drawIn?: boolean; durationMs?: number; style?: WaveformStyle; /** Change to repaint (e.g. colour change). */ redrawKey?: string } = {},
) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let reveal = drawIn && !reduce ? 0 : 1;
    const start = performance.now();
    const step = (now: number) => {
      // Ease-out: fast start, settles at the end.
      const t = Math.min(1, (now - start) / durationMs);
      reveal = 1 - (1 - t) ** 3;
      drawWaveform(canvas, peaks, reveal, style);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    if (reveal < 1) frame = requestAnimationFrame(step);
    else drawWaveform(canvas, peaks, 1, style);
    const observer = new ResizeObserver(() => drawWaveform(canvas, peaks, reveal, style));
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // `style` is a static literal at call sites; peaks identity changes when the file changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, peaks, drawIn, durationMs, redrawKey]);
}

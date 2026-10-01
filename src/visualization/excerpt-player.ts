"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Plays a window of the user's own file with the Web Audio API and exposes an AnalyserNode for
 * a live spectrum. Browser-side audio work is limited to playback and visualisation: real analysis
 * stays in the backend.
 */

export interface ExcerptPlayer {
  playing: boolean;
  play: (start: number, end: number) => Promise<void>;
  stop: () => void;
  /** Current playback position in seconds within the file (null when stopped). */
  position: () => number | null;
  analyser: () => AnalyserNode | null;
}

export function useExcerptPlayer(file: File | null): ExcerptPlayer {
  const context = useRef<AudioContext | null>(null);
  const buffer = useRef<{ file: File; audio: AudioBuffer } | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const clock = useRef<{ startedAt: number; offset: number } | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    const current = source.current;
    source.current = null;
    clock.current = null;
    if (current) {
      current.onended = null;
      try {
        current.stop();
      } catch {
        // Already stopped.
      }
    }
    setPlaying(false);
  }, []);

  const play = useCallback(
    async (start: number, end: number) => {
      if (!file) return;
      stop();
      const ctx = (context.current ??= new AudioContext());
      if (ctx.state === "suspended") await ctx.resume();
      if (buffer.current?.file !== file) {
        buffer.current = { file, audio: await ctx.decodeAudioData(await file.arrayBuffer()) };
      }
      const node = ctx.createBufferSource();
      node.buffer = buffer.current.audio;
      const analyser = (analyserNode.current ??= Object.assign(ctx.createAnalyser(), { fftSize: 4096, smoothingTimeConstant: 0.78 }));
      node.connect(analyser);
      analyser.connect(ctx.destination);
      node.onended = () => {
        if (source.current === node) stop();
      };
      source.current = node;
      clock.current = { startedAt: ctx.currentTime, offset: start };
      node.start(0, start, Math.max(0.1, end - start));
      setPlaying(true);
    },
    [file, stop],
  );

  // Stop and release when the file changes or the component unmounts.
  useEffect(() => stop, [file, stop]);
  useEffect(
    () => () => {
      void context.current?.close();
      context.current = null;
    },
    [],
  );

  const position = useCallback(() => {
    const ctx = context.current;
    const running = clock.current;
    if (!ctx || !running) return null;
    return running.offset + (ctx.currentTime - running.startedAt);
  }, []);

  const analyser = useCallback(() => analyserNode.current, []);

  return { playing, play, stop, position, analyser };
}

/** Log-spaced band centres (1/3 octave, 80 Hz – 12.5 kHz), like the tone fingerprint. */
const BANDS = [80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500];

/** Draws one frame of the live spectrum (bar per 1/3-octave band) into a canvas. */
export function drawLiveSpectrum(canvas: HTMLCanvasElement, analyser: AnalyserNode, data: Uint8Array<ArrayBuffer>, levels: Float32Array) {
  analyser.getByteFrequencyData(data);
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(width * ratio));
  const h = Math.max(1, Math.round(height * ratio));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const g = canvas.getContext("2d");
  if (!g) return;
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.clearRect(0, 0, width, height);
  const nyquist = analyser.context.sampleRate / 2;
  const bin = (hz: number) => Math.min(data.length - 1, Math.round((hz / nyquist) * data.length));
  const slot = width / BANDS.length;
  g.fillStyle = getComputedStyle(canvas).getPropertyValue("--bar-color").trim() || "#ffb23f";
  BANDS.forEach((hz, index) => {
    const from = bin(hz / 1.12);
    const to = Math.max(from + 1, bin(hz * 1.12));
    let peak = 0;
    for (let i = from; i < to; i++) peak = Math.max(peak, data[i] ?? 0);
    // Fast attack, slow release, like a meter.
    const target = peak / 255;
    const previous = levels[index] ?? 0;
    const level = target > previous ? target : previous * 0.9 + target * 0.1;
    levels[index] = level;
    const barH = Math.max(1.5, level * (height - 2));
    g.fillRect(index * slot + 1, height - barH, Math.max(1, slot - 2), barH);
  });
}

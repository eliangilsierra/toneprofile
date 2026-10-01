"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { MAX_WINDOW_S, MIN_WINDOW_S } from "@/lib/audio/file";
import { formatClock } from "@/lib/format/time";
import { SharedElement } from "@/motion/view-transitions";
import { cn } from "@/ui/cn";
import { Play, Stop } from "@/ui/icons";
import { drawLiveSpectrum, useExcerptPlayer } from "@/visualization/excerpt-player";
import { useWaveformCanvas } from "@/visualization/waveform";

export interface AnalysisWindow {
  start: number;
  end: number;
}

/** Shared name: the selected window morphs into the excerpt strip of the analysis page. */
export const EXCERPT_TRANSITION = "excerpt-window";

/**
 * Waveform with a draggable analysis window (≤ 90 s). The two range inputs are the accessible
 * source of truth; dragging on the waveform is a pointer shortcut for the same values.
 */
export function WaveformWindow({
  peaks,
  duration,
  value,
  onChange,
  file = null,
}: {
  peaks: number[];
  duration: number;
  value: AnalysisWindow;
  onChange: (next: AnalysisWindow) => void;
  /** The user's file, to listen to the selection (Web Audio). */
  file?: File | null;
}) {
  const t = useTranslations("Create.reference");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ offset: number } | null>(null);
  const length = value.end - value.start;
  const maxLength = Math.min(MAX_WINDOW_S, duration);
  const minLength = Math.min(MIN_WINDOW_S, duration);

  // Real peaks appear left → right when the file is decoded.
  useWaveformCanvas(canvasRef, peaks, { drawIn: true });

  // Listening to the selection: playhead on the waveform + live spectrum of what's playing.
  const player = useExcerptPlayer(file);
  const reduce = useReducedMotion();
  const playheadRef = useRef<HTMLSpanElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const { playing, stop, position, analyser } = player;
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const node = analyser();
    const data = new Uint8Array(node ? node.frequencyBinCount : 0);
    const levels = new Float32Array(32);
    const tick = () => {
      const time = position();
      if (time !== null && playheadRef.current) {
        playheadRef.current.style.transform = `translateX(${(time / duration) * (trackRef.current?.clientWidth ?? 0)}px)`;
      }
      if (node && spectrumRef.current && !reduce) drawLiveSpectrum(spectrumRef.current, node, data, levels);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, position, analyser, duration, reduce]);
  // Moving the window while listening stops playback (the old selection is no longer the one chosen).
  useEffect(() => stop, [value.start, value.end, stop]);

  const setStart = (start: number) => {
    const clamped = Math.min(Math.max(0, start), Math.max(0, duration - length));
    onChange({ start: clamped, end: clamped + length });
  };

  const timeAt = (event: ReactPointerEvent) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return ((event.clientX - rect.left) / rect.width) * duration;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const time = timeAt(event);
    const inside = time >= value.start && time <= value.end;
    drag.current = { offset: inside ? time - value.start : length / 2 };
    if (!inside) setStart(time - length / 2);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setStart(timeAt(event) - drag.current.offset);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-24 cursor-grab touch-none select-none overflow-hidden rounded-sm border border-line bg-surface-1 active:cursor-grabbing"
        aria-hidden
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full [--wave-color:var(--color-ink-faint)]" />
        <div
          className="absolute inset-y-0"
          style={{ left: `${(value.start / duration) * 100}%`, width: `${(length / duration) * 100}%` }}
        >
          <SharedElement name={EXCERPT_TRANSITION}>
            <div className="size-full border-x-2 border-signal bg-signal-soft" />
          </SharedElement>
        </div>
        {playing && <span ref={playheadRef} className="absolute inset-y-0 left-0 w-px bg-ink will-change-transform" />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-ink tabular">
          {t("windowSummary", {
            start: formatClock(value.start),
            end: formatClock(value.end),
            length: formatClock(length),
          })}
        </p>
        {file && (
          <button
            type="button"
            onClick={() => (playing ? stop() : void player.play(value.start, value.end))}
            className="pressable inline-flex items-center gap-2 rounded-sm border border-line-strong px-3 py-1.5 text-sm text-ink hover:border-ink-faint hover:bg-surface-2"
          >
            {playing ? <Stop className="text-signal" /> : <Play />}
            {playing ? t("stopListening") : t("listen")}
          </button>
        )}
      </div>
      {/* Live spectrum of the playing selection (decorative; it only reflects playback). */}
      <div aria-hidden className={cn("overflow-hidden transition-[height,opacity] duration-[var(--duration-base)]", playing && !reduce ? "h-14 opacity-100" : "h-0 opacity-0")}>
        <canvas ref={spectrumRef} className="block h-14 w-full [--bar-color:var(--color-signal)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label">
            {t("windowStart")} · <span className="text-ink tabular">{formatClock(value.start)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, duration - length)}
            step={0.5}
            value={value.start}
            onChange={(event) => setStart(Number(event.target.value))}
            aria-valuetext={formatClock(value.start)}
            className="accent-[var(--color-signal)]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">
            {t("windowLength")} · <span className="text-ink tabular">{formatClock(length)}</span>
          </span>
          <input
            type="range"
            min={minLength}
            max={maxLength}
            step={0.5}
            value={length}
            onChange={(event) => {
              const nextLength = Number(event.target.value);
              const start = Math.min(value.start, Math.max(0, duration - nextLength));
              onChange({ start, end: start + nextLength });
            }}
            aria-valuetext={formatClock(length)}
            className="accent-[var(--color-signal)]"
          />
        </label>
      </div>
      <p className="text-sm text-ink-muted">{t("windowHelp")}</p>
    </div>
  );
}

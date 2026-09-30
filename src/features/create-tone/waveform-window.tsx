"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { formatClock } from "@/lib/format/time";
import { MAX_WINDOW_S, MIN_WINDOW_S } from "@/lib/audio/file";

export interface AnalysisWindow {
  start: number;
  end: number;
}

function drawWaveform(canvas: HTMLCanvasElement, peaks: number[]) {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);
  const styles = getComputedStyle(canvas);
  context.fillStyle = styles.getPropertyValue("--wave-color").trim() || "#75736e";
  const bar = width / peaks.length;
  const mid = height / 2;
  peaks.forEach((peak, index) => {
    const h = Math.max(1, peak * (height - 4));
    context.fillRect(index * bar, mid - h / 2, Math.max(1, bar - 0.6), h);
  });
}

/**
 * Waveform with a draggable analysis window (≤ 90 s). The two range inputs are the accessible
 * source of truth; dragging on the waveform is a pointer shortcut for the same values.
 */
export function WaveformWindow({
  peaks,
  duration,
  value,
  onChange,
}: {
  peaks: number[];
  duration: number;
  value: AnalysisWindow;
  onChange: (next: AnalysisWindow) => void;
}) {
  const t = useTranslations("Create.reference");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ offset: number } | null>(null);
  const length = value.end - value.start;
  const maxLength = Math.min(MAX_WINDOW_S, duration);
  const minLength = Math.min(MIN_WINDOW_S, duration);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWaveform(canvas, peaks);
    const observer = new ResizeObserver(() => drawWaveform(canvas, peaks));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [peaks]);

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
          className="absolute inset-y-0 border-x-2 border-signal bg-signal-soft"
          style={{ left: `${(value.start / duration) * 100}%`, width: `${(length / duration) * 100}%` }}
        />
      </div>

      <p className="font-mono text-sm text-ink tabular">
        {t("windowSummary", {
          start: formatClock(value.start),
          end: formatClock(value.end),
          length: formatClock(length),
        })}
      </p>

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

"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, type DragEvent } from "react";
import { canDecode, decodePreview, type AudioPreview } from "@/lib/audio/decode";
import { ACCEPT_ATTRIBUTE, checkDuration, checkFile, defaultWindow } from "@/lib/audio/file";
import { formatClock } from "@/lib/format/time";
import { cn } from "@/ui/cn";
import { Close, Upload } from "@/ui/icons";
import { Skeleton } from "@/ui/skeleton";
import type { AnalysisWindow } from "./waveform-window";

// The waveform, its window and the Web Audio preview load only once a file has been chosen.
const WaveformWindow = dynamic(() => import("./waveform-window").then((module) => module.WaveformWindow), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full" />,
});

export interface ExcerptValue {
  file: File;
  preview: AudioPreview | null;
  window: AnalysisWindow;
}

type LocalError =
  | "unsupported_format"
  | "file_too_large"
  | "audio_too_short"
  | "audio_too_long"
  | "invalid_audio";

export function ExcerptPicker({
  value,
  onChange,
}: {
  value: ExcerptValue | null;
  onChange: (next: ExcerptValue | null) => void;
}) {
  const t = useTranslations("Create.reference");
  const te = useTranslations("Create.errors");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [decoding, setDecoding] = useState(false);
  const [error, setError] = useState<LocalError | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = async (file: File) => {
    setError(null);
    const fileProblem = checkFile(file);
    if (fileProblem) {
      setError(fileProblem);
      return;
    }
    if (!canDecode()) {
      onChange({ file, preview: null, window: { start: 0, end: 30 } });
      return;
    }
    setDecoding(true);
    try {
      const preview = await decodePreview(file);
      const durationProblem = checkDuration(preview.duration);
      if (durationProblem) {
        setError(durationProblem);
        return;
      }
      onChange({ file, preview, window: defaultWindow(preview.duration) });
    } catch {
      setError("invalid_audio");
    } finally {
      setDecoding(false);
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void accept(file);
  };

  if (value) {
    return (
      <div className="flex flex-col gap-5 rounded-sm border border-line bg-surface-1/60 p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 truncate font-mono text-sm text-ink">
            {t("fileName", {
              name: value.file.name,
              duration: value.preview ? formatClock(value.preview.duration) : "—",
            })}
          </p>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-xs px-2 py-1 text-sm text-ink-muted hover:text-ink"
          >
            <Close />
            {t("remove")}
          </button>
        </div>
        {value.preview ? (
          <WaveformWindow
            peaks={value.preview.peaks}
            duration={value.preview.duration}
            value={value.window}
            onChange={(window) => onChange({ ...value, window })}
            file={value.file}
          />
        ) : (
          <p className="text-sm text-ink-muted">{te("decodeUnavailable")}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-6 py-8 text-center transition-colors",
          "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
          dragging ? "border-signal bg-signal-soft" : "border-line-strong bg-surface-1/50 hover:border-ink-faint",
        )}
      >
        <Upload className="size-5 text-signal" />
        <span className="font-medium text-ink">{decoding ? t("decoding") : t("dropTitle")}</span>
        <span className="text-sm text-ink-muted">{t("dropBody")}</span>
        <span className="mt-2 rounded-sm border border-line-strong px-3 py-1.5 text-sm text-ink">{t("browse")}</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          aria-describedby={error ? `${inputId}-error` : undefined}
          disabled={decoding}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void accept(file);
          }}
        />
      </label>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-danger">
          {te(error)}
        </p>
      )}
    </div>
  );
}

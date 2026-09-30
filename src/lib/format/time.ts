/** 75 → "1:15", 9.4 → "0:09". */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** 42 → "42 s", 95 → "1 min 35 s" (compact, locale-neutral units). */
export function formatDurationShort(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  if (safe < 60) return `${safe} s`;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
}

/** Hz with k-suffix: 1250 → "1.25k", 80 → "80". */
export function formatHz(hz: number): string {
  if (hz >= 1000) {
    const value = hz / 1000;
    return `${Number.isInteger(value) ? value : value.toFixed(value < 10 ? 2 : 1).replace(/0+$/, "")}k`;
  }
  return `${Math.round(hz)}`;
}

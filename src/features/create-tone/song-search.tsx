"use client";

import { useTranslations } from "next-intl";
import { useId, useState, type KeyboardEvent } from "react";
import { apiMode } from "@/lib/api/client";
import type { SongCandidate } from "@/lib/api/types";
import { cn } from "@/ui/cn";
import { controlClasses } from "@/ui/field";
import { Search } from "@/ui/icons";
import { useSongSearch } from "./queries";

/** ARIA 1.2 combobox with a listbox popup (keyboard: ↑ ↓ Enter Escape). */
export function SongSearch({
  value,
  onChange,
  invalid,
}: {
  value: SongCandidate | null;
  onChange: (song: SongCandidate | null) => void;
  invalid?: boolean;
}) {
  const t = useTranslations("Create.reference");
  const id = useId();
  const listId = `${id}-list`;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { data, isFetching, query, settled, isError } = useSongSearch(text);
  const results = query.length >= 2 ? (data?.items ?? []) : [];

  if (value) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-sm border border-signal/40 bg-surface-1 px-4 py-3">
        <div className="min-w-0">
          <p className="label">{t("selected")}</p>
          <p className="mt-1 truncate text-lg font-medium text-ink">
            {value.title} <span className="text-ink-muted">— {value.artist}</span>
          </p>
          {value.year ? <p className="font-mono text-xs text-ink-faint">{value.year}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setText("");
          }}
          className="shrink-0 rounded-xs px-2 py-1 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {t("change")}
        </button>
      </div>
    );
  }

  const choose = (song: SongCandidate) => {
    onChange(song);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && results[active]) {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showPopup = open && query.length >= 2;
  let status: string | null = null;
  if (text.trim().length > 0 && text.trim().length < 2) status = t("songHint");
  else if (isFetching || (!settled && text.trim().length >= 2)) status = t("searching");
  else if (showPopup && results.length === 0 && !isError) status = t("noResults", { query });

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        <input
          id="song"
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={showPopup && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPopup && results[active] ? `${listId}-${active}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={`${id}-status`}
          placeholder={t("songPlaceholder")}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={cn(controlClasses, "h-12 pl-9 text-base")}
        />
      </div>
      <p id={`${id}-status`} aria-live="polite" className="mt-1.5 min-h-5 text-sm text-ink-muted">
        {status ?? (apiMode === "mock" ? t("demoCatalog") : "")}
      </p>
      {showPopup && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("songLabel")}
          className="absolute left-0 right-0 top-12 z-30 mt-1 max-h-80 overflow-auto rounded-sm border border-line-strong bg-surface-2 py-1 shadow-2xl"
        >
          {results.map((song, index) => (
            <li
              key={song.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(song);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "flex cursor-pointer items-baseline justify-between gap-4 px-3 py-2.5",
                index === active ? "bg-surface-3" : "",
              )}
            >
              <span className="min-w-0 truncate">
                <span className="text-ink">{song.title}</span>
                <span className="text-ink-muted"> — {song.artist}</span>
              </span>
              {song.year ? <span className="font-mono text-xs text-ink-faint">{song.year}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

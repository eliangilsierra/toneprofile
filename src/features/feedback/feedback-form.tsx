"use client";

import * as m from "motion/react-m";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { FeedbackCreate } from "@/lib/api/types";
import { duration, ease } from "@/motion/tokens";
import { ActionIcon, DrawnCheck } from "@/ui/action-icon";
import { Button } from "@/ui/button";
import { cn } from "@/ui/cn";
import { controlClasses } from "@/ui/field";
import { useSendFeedback } from "@/features/generation/queries";

type Tag = NonNullable<FeedbackCreate["tags"]>[number];
const TAGS: Tag[] = [
  "great_starting_point",
  "too_much_gain",
  "too_little_gain",
  "too_bright",
  "too_dark",
  "too_boomy",
  "too_thin",
  "wrong_effects",
  "too_much_ambience",
];
const SCALE = [1, 2, 3, 4, 5] as const;

export function FeedbackForm({ presetId, version }: { presetId: string; version: number }) {
  const t = useTranslations("Feedback");
  const send = useSendFeedback(presetId, version);
  const [usefulness, setUsefulness] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [comment, setComment] = useState("");

  if (send.isSuccess) {
    return (
      <m.p
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, ease: ease.out }}
        className="flex items-center gap-2 rounded-sm border border-ok/40 bg-surface-1 p-4 text-ink"
      >
        <DrawnCheck className="text-ok" />
        {t("thanks", { version })}
      </m.p>
    );
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!usefulness) return;
    send.mutate({ usefulness, closeness: null, tags, comment: comment.trim() || null });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <fieldset>
        <legend className="label">{t("usefulness")}</legend>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {SCALE.map((value) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-sm border px-1 py-3 text-center transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                usefulness === value ? "border-signal bg-signal-soft" : "border-line hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="usefulness"
                value={value}
                checked={usefulness === value}
                onChange={() => setUsefulness(value)}
                className="sr-only"
              />
              <span className="font-mono text-lg text-ink tabular">{value}</span>
              <span className="text-[0.6875rem] leading-tight text-ink-muted">{t(`scale.${value}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">{t("tagsLabel")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const on = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((current) => (on ? current.filter((item) => item !== tag) : [...current, tag]))}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  on ? "border-signal bg-signal-soft text-ink" : "border-line-strong text-ink-muted hover:text-ink",
                )}
              >
                {t(`tags.${tag}`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="label">{t("comment")}</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={3}
          className={cn(controlClasses, "h-auto py-2.5")}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={!usefulness || send.isPending}>
          {send.isPending && <ActionIcon state="busy" idle={null} />}
          {send.isPending ? t("sending") : t("submit")}
        </Button>
        {send.isError && (
          <p role="alert" className="text-sm text-danger">
            {t("error")}
          </p>
        )}
      </div>
    </form>
  );
}

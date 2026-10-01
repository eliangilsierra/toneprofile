"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useRouter } from "@/i18n/navigation";
import { toApiError, type ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/keys";
import type { Generation, GenerationCreate } from "@/lib/api/types";
import { formatClock } from "@/lib/format/time";
import { NAV_FORWARD } from "@/motion/view-transitions";
import { Button } from "@/ui/button";
import { cn } from "@/ui/cn";
import { Field, Select } from "@/ui/field";
import { ArrowRight, Check } from "@/ui/icons";
import { ActionIcon } from "@/ui/action-icon";
import { excerptPreviewKey, type ExcerptPreview } from "@/features/generation/excerpt-preview";
import { ProblemState } from "@/features/shell/problem-state";
import { ExcerptPicker, type ExcerptValue } from "./excerpt-picker";
import { createGeneration, uploadReference, useDevices, type SubmitPhase } from "./queries";
import { SongSearch } from "./song-search";
import {
  createToneResolver,
  parseGuitar,
  PICKUP_CONFIGS,
  PICKUP_POSITIONS,
  SECTIONS,
  TUNINGS,
  type CreateToneValues,
  type GuitarValues,
} from "./validation";

const GUITAR_STORAGE_KEY = "toneprofile-guitar";

type FormValues = CreateToneValues;

function loadGuitar(): GuitarValues | null {
  try {
    const raw = window.localStorage.getItem(GUITAR_STORAGE_KEY);
    return raw ? parseGuitar(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function SectionCard({ index, title, lede, children }: { index: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-surface-1/40 p-5 md:p-7" aria-labelledby={`section-${index}`}>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-signal tabular">{index}</span>
        <h2 id={`section-${index}`} className="text-xl font-medium">
          {title}
        </h2>
      </div>
      {lede && <p className="mt-1.5 text-ink-muted md:pl-7">{lede}</p>}
      <div className="mt-6 flex flex-col gap-6 md:pl-7">{children}</div>
    </section>
  );
}

export function CreateToneForm() {
  const t = useTranslations("Create");
  const tax = useTranslations("Taxonomy");
  const tp = useTranslations("Preset");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const devices = useDevices();
  const [phase, setPhase] = useState<SubmitPhase | null>(null);

  const form = useForm<FormValues>({
    resolver: createToneResolver,
    defaultValues: {
      song: null,
      excerpt: null,
      section: "",
      rights: false,
      pickup_config: "hss",
      pickup_position: "bridge",
      tuning: "standard",
      device_key: "valeton_gp180",
    },
  });
  const { control, register, handleSubmit, formState, setValue } = form;
  const values = useWatch({ control });

  // Remember the player's guitar between tones (P1 "saved guitars" lite; stays in this browser).
  useEffect(() => {
    const saved = loadGuitar();
    if (saved) {
      setValue("pickup_config", saved.pickup_config);
      setValue("pickup_position", saved.pickup_position);
      setValue("tuning", saved.tuning);
    }
  }, [setValue]);

  const submit = useMutation<Generation, ApiError, FormValues>({
    mutationFn: async (data) => {
      try {
        window.localStorage.setItem(
          GUITAR_STORAGE_KEY,
          JSON.stringify({ pickup_config: data.pickup_config, pickup_position: data.pickup_position, tuning: data.tuning }),
        );
      } catch {
        // Storage unavailable: nothing to remember.
      }
      let reference: GenerationCreate["reference"] = null;
      if (data.excerpt) {
        const upload = await uploadReference(data.excerpt.file, setPhase);
        reference = {
          upload_id: upload.id,
          window: {
            start_s: Math.round(data.excerpt.window.start * 10) / 10,
            end_s: Math.round(data.excerpt.window.end * 10) / 10,
          },
        };
      }
      setPhase("starting");
      const generation = await createGeneration({
        song_id: data.song?.id ?? null,
        reference,
        section_hint: data.section || null,
        device_key: data.device_key,
        guitar: { pickup_config: data.pickup_config, pickup_position: data.pickup_position, tuning: data.tuning },
        locale: locale as GenerationCreate["locale"],
      });
      return generation;
    },
    onSuccess: async (generation, data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.generations });
      // Seed the cache so the analysis page renders in the same commit as the navigation: that is
      // what lets the selected excerpt window morph into the analysis page (view transition).
      queryClient.setQueryData(queryKeys.generation(generation.id), generation);
      const preview = data.excerpt?.preview;
      if (data.excerpt && preview) {
        queryClient.setQueryData<ExcerptPreview>(excerptPreviewKey(generation.id), {
          peaks: preview.peaks,
          duration: preview.duration,
          window: data.excerpt.window,
        });
      }
      router.push(`/tones/${generation.id}`, { transitionTypes: NAV_FORWARD });
    },
    onError: () => setPhase(null),
  });

  const onSubmit = handleSubmit(
    (data) => submit.mutate(data),
    () => undefined,
  );
  const submitError = submit.error ? toApiError(submit.error) : null;
  const busy = submit.isPending || submit.isSuccess;
  const errorText = (message?: string) =>
    message ? t(`errors.${message}` as "errors.rightsRequired") : undefined;
  const referenceError = formState.errors.song?.message === "needsReference";
  const device = devices.data?.items.find((item) => item.key === values.device_key);
  const excerpt = values.excerpt as ExcerptValue | null | undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="flex flex-col gap-6">
        <SectionCard index="01" title={t("reference.title")}>
          <Field id="song" label={t("reference.songLabel")}>
            <Controller
              control={control}
              name="song"
              render={({ field }) => (
                <SongSearch value={field.value} onChange={field.onChange} invalid={referenceError} />
              )}
            />
          </Field>

          <Field id="section" label={t("reference.sectionLabel")}>
            <Select id="section" {...register("section")}>
              <option value="">{t("reference.sectionAny")}</option>
              {SECTIONS.map((section) => (
                <option key={section} value={section}>
                  {tax(`section.${section}`)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-1.5">
            <p className="label">{t("reference.excerptLabel")}</p>
            <p className="mb-2 max-w-prose text-sm text-ink-muted">{t("reference.excerptHint")}</p>
            <Controller
              control={control}
              name="excerpt"
              render={({ field }) => <ExcerptPicker value={field.value} onChange={field.onChange} />}
            />
            {formState.errors.excerpt?.message && (
              <p role="alert" className="text-sm text-danger">
                {errorText(formState.errors.excerpt.message)}
              </p>
            )}
          </div>

          {excerpt && (
            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  {...register("rights")}
                  aria-invalid={Boolean(formState.errors.rights) || undefined}
                  aria-describedby={formState.errors.rights ? "rights-error" : undefined}
                  className="mt-1 size-4 accent-[var(--color-signal)]"
                />
                <span className="text-sm text-ink">{t("reference.rights")}</span>
              </label>
              {/* New tab: following the policy must not lose the form in progress. */}
              <Link
                href="/legal/audio"
                target="_blank"
                rel="noopener"
                className="ml-7 mt-1 inline-block text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
              >
                {t("reference.rightsPolicy")}
                <span className="sr-only"> {tc("newTab")}</span>
              </Link>
              {formState.errors.rights?.message && (
                <p id="rights-error" role="alert" className="mt-1.5 text-sm text-danger">
                  {errorText(formState.errors.rights.message)}
                </p>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard index="02" title={t("guitar.title")} lede={t("guitar.lede")}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="pickup_config" label={t("guitar.pickupConfig")}>
              <Select id="pickup_config" {...register("pickup_config")}>
                {PICKUP_CONFIGS.map((option) => (
                  <option key={option} value={option}>
                    {tax(`pickupConfig.${option}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="pickup_position" label={t("guitar.pickupPosition")}>
              <Select id="pickup_position" {...register("pickup_position")}>
                {PICKUP_POSITIONS.map((option) => (
                  <option key={option} value={option}>
                    {tax(`pickupPosition.${option}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="tuning" label={t("guitar.tuning")}>
              <Select id="tuning" {...register("tuning")}>
                {TUNINGS.map((option) => (
                  <option key={option} value={option}>
                    {tax(`tuning.${option}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard index="03" title={t("device.title")}>
          <fieldset>
            <legend className="sr-only">{t("device.title")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(devices.data?.items ?? []).map((item) => {
                const available = item.status === "available";
                const checked = values.device_key === item.key;
                return (
                  <label
                    key={item.key}
                    className={cn(
                      "relative flex cursor-pointer flex-col gap-1 rounded-sm border p-4 transition-colors",
                      "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                      checked ? "border-signal bg-signal-soft" : "border-line-strong hover:border-ink-faint",
                      !available && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input type="radio" value={item.key} disabled={!available} className="sr-only" {...register("device_key")} />
                    <span className="label">{item.vendor}</span>
                    <span className="text-lg font-medium">{item.name}</span>
                    <span className="text-sm text-ink-muted">
                      {available ? t("device.available") : t("device.planned")}
                      {item.import_via ? ` · ${item.file_extension ?? ""} · ${item.import_via}` : ""}
                    </span>
                    {checked && <Check className="absolute right-4 top-4 text-signal" />}
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-ink-faint">{t("device.plannedNote")}</p>
          </fieldset>
        </SectionCard>
      </div>

      <aside className="lg:sticky lg:top-24" aria-labelledby="summary-title">
        <div className="rounded-md border border-line-strong bg-surface-1 p-5 md:p-6">
          <h2 id="summary-title" className="label">
            {t("summary.title")}
          </h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-ink-faint">{t("summary.song")}</dt>
              <dd className="mt-0.5 text-ink">
                {values.song ? `${values.song.title} — ${values.song.artist}` : t("summary.noSong")}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">{t("summary.excerpt")}</dt>
              <dd className="mt-0.5 font-mono text-ink tabular">
                {excerpt
                  ? `${formatClock(excerpt.window.start)} → ${formatClock(excerpt.window.end)}`
                  : <span className="font-sans">{t("summary.noExcerpt")}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">{t("summary.guitar")}</dt>
              <dd className="mt-0.5 text-ink">
                {values.pickup_config && tax(`pickupConfig.${values.pickup_config}`)}
                {values.pickup_position && ` · ${tax(`pickupPosition.${values.pickup_position}`)}`}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">{t("summary.device")}</dt>
              <dd className="mt-0.5 text-ink">
                {device ? tp(`deviceNames.${device.key}` as "deviceNames.valeton_gp180") : "—"}
              </dd>
            </div>
          </dl>

          {referenceError && (
            <p role="alert" className="mt-5 text-sm text-danger">
              {t("summary.needsReference")}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy} aria-describedby="submit-status">
            {busy && <ActionIcon state="busy" idle={null} />}
            {busy && phase ? t(`summary.phase.${phase}`) : t("summary.submit")}
            {!busy && <ArrowRight />}
          </Button>
          <p id="submit-status" aria-live="polite" className="sr-only">
            {busy && phase ? t(`summary.phase.${phase}`) : ""}
          </p>
        </div>

        {submitError && (
          <ProblemState
            className="mt-4"
            headingLevel={3}
            code={submitError.code}
            actions={
              submitError.retryable ? (
                <Button variant="secondary" size="sm" type="submit">
                  {t("summary.submit")}
                </Button>
              ) : undefined
            }
          />
        )}
      </aside>
    </form>
  );
}

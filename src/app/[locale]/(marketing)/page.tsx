import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { HeroDemo } from "@/features/landing/hero-demo";
import { TranslationDemo } from "@/features/landing/translation-demo";
import { alternatesFor } from "@/i18n/metadata";
import type { EvidenceLevel } from "@/lib/api/types";
import { ButtonLink } from "@/ui/button";
import { EvidenceGlyph } from "@/ui/evidence-mark";
import { ArrowRight, Check } from "@/ui/icons";

const LEVELS: EvidenceLevel[] = ["confirmed", "reported", "likely", "inferred", "unknown"];
const STEPS = ["reference", "evidence", "intent", "device"] as const;
const GP180_STRIP = ["NR", "PRE", "WAH", "DST", "N→S", "AMP", "CAB", "EQ", "MOD", "DLY", "RVB", "VOL"];

function SectionHeading({ eyebrow, title, body, id }: { eyebrow: string; title: string; body?: string; id: string }) {
  return (
    <div className="max-w-3xl">
      <p className="label !text-signal">{eyebrow}</p>
      <h2 id={id} className="mt-4 font-serif text-headline text-ink">
        {title}
      </h2>
      {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">{body}</p>}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor(locale, "") };
}

export default function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("Landing");
  const te = useTranslations("Evidence");
  const tx = useTranslations("LandingExamples");

  return (
    <main id="content">
      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-line/60">
        <div className="mx-auto max-w-[88rem] px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-24">
          <p className="label">{t("hero.eyebrow")}</p>
          <h1 className="mt-5 max-w-[14ch] font-serif text-display text-ink">{t("hero.title")}</h1>
          <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,34rem)_1fr] md:items-end">
            <p className="text-lg leading-relaxed text-ink-muted md:text-xl">{t("hero.lede")}</p>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <ButtonLink href="/tones/new" size="lg">
                {t("hero.primaryCta")}
                <ArrowRight />
              </ButtonLink>
              <a href="#how" className="h-12 rounded-sm px-4 leading-[3rem] text-ink-muted transition-colors hover:text-ink">
                {t("hero.secondaryCta")}
              </a>
            </div>
          </div>
          <div className="mt-14 md:mt-20">
            <HeroDemo />
            <p className="mt-4 label !text-ink-faint">{t("hero.deviceNote")}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="border-b border-line/60">
        <div className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-28">
          <SectionHeading id="how" eyebrow={t("how.eyebrow")} title={t("how.title")} />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step} className="bg-canvas p-6 md:p-7">
                <p className="font-mono text-xs text-signal tabular">0{index + 1}</p>
                <h3 className="mt-6 text-xl font-medium text-ink">{t(`how.steps.${step}.title`)}</h3>
                <p className="mt-3 leading-relaxed text-ink-muted">{t(`how.steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Evidence */}
      <section aria-labelledby="evidence" className="border-b border-line/60">
        <div className="mx-auto grid max-w-[88rem] gap-14 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <SectionHeading id="evidence" eyebrow={t("evidence.eyebrow")} title={t("evidence.title")} body={t("evidence.body")} />
          <dl className="divide-y divide-line rounded-md border border-line">
            {LEVELS.map((level) => (
              <div key={level} className="grid grid-cols-[8.5rem_1fr] gap-4 p-5">
                <dt className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-ink">
                  <EvidenceGlyph level={level} className="size-3" />
                  {te(`levels.${level}`)}
                </dt>
                <dd className="text-ink-muted">{te(`descriptions.${level}`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Translation — signature interaction */}
      <section aria-labelledby="translation" className="border-b border-line/60 bg-surface-1/40">
        <div className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-28">
          <SectionHeading id="translation" eyebrow={t("translation.eyebrow")} title={t("translation.title")} body={t("translation.body")} />
          <div className="mt-12">
            <TranslationDemo />
          </div>
        </div>
      </section>

      {/* Examples */}
      <section aria-labelledby="examples" className="border-b border-line/60">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
          <SectionHeading id="examples" eyebrow={tx("eyebrow")} title={tx("title")} body={tx("body")} />
          <ButtonLink href="/examples" variant="secondary" size="lg" className="shrink-0">
            {tx("cta")}
            <ArrowRight />
          </ButtonLink>
        </div>
      </section>

      {/* Device */}
      <section aria-labelledby="device" className="border-b border-line/60">
        <div className="mx-auto grid max-w-[88rem] gap-14 px-5 py-20 md:grid-cols-[1fr_1fr] md:px-8 md:py-28">
          <div>
            <SectionHeading id="device" eyebrow={t("device.eyebrow")} title={t("device.title")} body={t("device.body")} />
            <ul className="mt-8 space-y-3">
              {(["file", "sheet", "versions"] as const).map((point) => (
                <li key={point} className="flex items-start gap-3 text-ink">
                  <Check className="mt-1 shrink-0 text-signal" />
                  {t(`device.points.${point}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-center rounded-md border border-line bg-surface-1 p-5 md:p-7" aria-hidden>
            <p className="label">Valeton GP-180 · 12 modules</p>
            <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {GP180_STRIP.map((slot, index) => (
                <span
                  key={slot}
                  className={`rounded-xs border px-2 py-3 text-center font-mono text-xs ${
                    [1, 5, 6, 8, 9, 10].includes(index) ? "border-signal/50 text-signal" : "border-line text-ink-faint"
                  }`}
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Limits */}
      <section aria-labelledby="limits" className="border-b border-line/60">
        <div className="mx-auto max-w-[88rem] px-5 py-20 md:px-8 md:py-28">
          <SectionHeading id="limits" eyebrow={t("limits.eyebrow")} title={t("limits.title")} />
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {(["hands", "studio", "uncertain"] as const).map((item) => (
              <li key={item} className="border-t border-line-strong pt-5 leading-relaxed text-ink-muted">
                {t(`limits.items.${item}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-grid">
        <div className="mx-auto flex max-w-[88rem] flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-end md:justify-between md:px-8">
          <h2 className="max-w-[16ch] font-serif text-headline">{t("cta.title")}</h2>
          <ButtonLink href="/tones/new" size="lg">
            {t("cta.button")}
            <ArrowRight />
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { toApiError } from "@/lib/api/errors";
import { blockSummary } from "@/lib/format/params";
import type { Generation, IntentBlock, PresetVersion, ToneProfile } from "@/lib/api/types";
import { useSeenOnce } from "@/motion/hooks";
import { Reveal } from "@/motion/reveal";
import { sharedName, SharedElement } from "@/motion/view-transitions";
import { Button } from "@/ui/button";
import { Info } from "@/ui/icons";
import { Meter } from "@/ui/meter";
import { PageSkeleton, Skeleton } from "@/ui/skeleton";
import { FeedbackForm } from "@/features/feedback/feedback-form";
import { useToneProfile, usePresetVersion } from "@/features/generation/queries";
import { BlockInspector } from "@/features/preset/block-inspector";
import {
  ChainTranslation,
  TranslationToggle,
  type TranslationItem,
  type TranslationMode,
} from "@/features/preset/chain-translation";
import { ImportGuide, PresetActions } from "@/features/preset/preset-actions";
import { ProblemState } from "@/features/shell/problem-state";
import { AudioFacts } from "@/features/tone-profile/audio-facts";
import { EvidenceList } from "@/features/tone-profile/evidence-list";
import { Targets } from "@/features/tone-profile/targets";
import {
  PERCEPTUAL_BANDS,
  TARGET_BAND,
  TARGET_ORDER,
  TARGET_ROLES,
  type TargetKey,
} from "@/visualization/tone-signature/geometry";
import { ToneSignature } from "@/visualization/tone-signature/tone-signature";

// d3 + the spectrum chart load only when an excerpt was measured.
const Fingerprint = dynamic(() => import("@/features/tone-profile/fingerprint").then((module) => module.Fingerprint), {
  loading: () => <Skeleton className="aspect-[800/260] w-full" />,
});

function useTranslationItems(profile: ToneProfile, version: PresetVersion): TranslationItem[] {
  const tax = useTranslations("Taxonomy");
  const tc = useTranslations("Common");
  return useMemo(() => {
    const intents = new Map<string, IntentBlock>(profile.intent.chain.map((block) => [block.id, block]));
    const used = new Set<string>();
    const items: TranslationItem[] = [];
    for (const block of version.chain) {
      if (!block.enabled) continue;
      const intent = block.intent_block_id ? intents.get(block.intent_block_id) : undefined;
      if (intent) used.add(intent.id);
      items.push({
        id: intent?.id ?? `slot-${block.slot}`,
        roleKey: intent?.role ?? null,
        role: intent ? tax(`roles.${intent.role}`) : block.slot,
        archetype: intent ? tax(`archetypes.${intent.archetype}`) : null,
        evidence: intent?.evidence_level,
        confidenceLabel: intent ? tc("confidenceValue", { value: intent.confidence }) : undefined,
        device: { slot: block.slot, model: block.model.name, summary: blockSummary(block) },
      });
    }
    // Intent blocks the device couldn't host still appear in the tone-profile view.
    for (const intent of profile.intent.chain) {
      if (used.has(intent.id) || !intent.enabled) continue;
      items.push({
        id: intent.id,
        roleKey: intent.role,
        role: tax(`roles.${intent.role}`),
        archetype: tax(`archetypes.${intent.archetype}`),
        evidence: intent.evidence_level,
        confidenceLabel: tc("confidenceValue", { value: intent.confidence }),
        device: null,
      });
    }
    return items;
  }, [profile, version, tax, tc]);
}

function SectionTitle({
  id,
  eyebrow,
  title,
  lede,
  transitionName,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  /** Shared view-transition name (the title morphs into the next page's heading). */
  transitionName?: string;
}) {
  const heading = (
    <h2 id={id} className="mt-2 scroll-mt-24 text-2xl font-semibold tracking-tight md:text-3xl">
      {title}
    </h2>
  );
  return (
    <div className="mb-6">
      {eyebrow && <p className="label !text-signal">{eyebrow}</p>}
      {transitionName ? <SharedElement name={transitionName}>{heading}</SharedElement> : heading}
      {lede && <p className="mt-2 max-w-prose text-ink-muted">{lede}</p>}
    </div>
  );
}

/** "tone": the user's own result. "example": a curated, read-only example (no feedback). */
export type ResultVariant = "tone" | "example";

interface ResultOptions {
  variant: ResultVariant;
  sheetHref: string;
}

function Result({
  generation,
  profile,
  version,
  variant,
  sheetHref,
}: { generation: Generation; profile: ToneProfile; version: PresetVersion } & ResultOptions) {
  const t = useTranslations("Result");
  const tprof = useTranslations("Profile");
  const tpre = useTranslations("Preset");
  const tgen = useTranslations("Generation");
  const tc = useTranslations("Common");
  const tf = useTranslations("Feedback");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const items = useTranslationItems(profile, version);
  const [mode, setMode] = useState<TranslationMode>(reduceMotion ? "device" : "universal");
  const [touched, setTouched] = useState(false);
  const defaultBlock = version.chain.find((block) => block.slot === "AMP" && block.enabled) ?? version.chain.find((block) => block.enabled);
  const [selected, setSelected] = useState<string | null>(null);
  const tax = useTranslations("Taxonomy");

  // One highlight shared by the targets list, the Tone Signature, the fingerprint and the chain.
  const [hoverTarget, setHoverTarget] = useState<TargetKey | null>(null);
  const [pinnedTarget, setPinnedTarget] = useState<TargetKey | null>(null);
  const activeTarget = hoverTarget ?? pinnedTarget;
  const togglePin = useCallback((key: TargetKey) => setPinnedTarget((current) => (current === key ? null : key)), []);
  const highlightIds = useMemo(() => {
    if (!activeTarget) return null;
    const roles = TARGET_ROLES[activeTarget];
    return new Set(items.filter((item) => item.roleKey && roles.includes(item.roleKey)).map((item) => item.id));
  }, [activeTarget, items]);
  const focusBand = activeTarget ? TARGET_BAND[activeTarget] : null;
  const tt = useTranslations("Profile.targets");
  const signatureLabel = tprof("signature.aria", {
    summary: TARGET_ORDER.map((key) => `${tt(`names.${key}`)} ${Math.round(profile.intent.targets[key].value * 100)}%`).join(", "),
  });
  const gain = profile.evidence.audio?.gain_class.value;

  // The signature moment: when the chain comes into view, the tone profile translates itself into
  // device modules, block by block along the signal path. Once; never after the user has chosen.
  const chainRef = useRef<HTMLElement>(null);
  const chainSeen = useSeenOnce(chainRef, 0.5);
  useEffect(() => {
    if (!chainSeen || touched || reduceMotion) return;
    const timer = window.setTimeout(() => setMode("device"), 900);
    return () => window.clearTimeout(timer);
  }, [chainSeen, touched, reduceMotion]);

  const intents = new Map(profile.intent.chain.map((block) => [block.id, block]));
  const selectedItem = items.find((item) => item.id === selected);
  const selectedBlock =
    (selectedItem?.device && version.chain.find((block) => block.slot === selectedItem.device!.slot)) || defaultBlock;
  const selectedIntent = selectedBlock?.intent_block_id ? intents.get(selectedBlock.intent_block_id) : undefined;
  const selectedId = items.find((item) => item.device?.slot === selectedBlock?.slot)?.id ?? null;

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      <Reveal as="section">
        <div className="grid gap-8 rounded-md border border-line bg-surface-1/50 p-5 md:grid-cols-[1fr_16rem] md:p-8">
          <div>
            <p className="label !text-ok">{t("readyTitle")}</p>
            <h2 className="mt-3 text-sm text-ink-faint">{t("summaryTitle")}</h2>
            <p lang={profile.locale} className="mt-2 max-w-3xl text-lg leading-relaxed text-ink md:text-xl">
              {profile.summary}
            </p>
            {profile.locale !== locale && (
              <p className="mt-3 text-xs text-ink-faint">
                {t("proseLanguage", { language: tc(`locales.${profile.locale}`) })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 md:border-l md:border-line md:pl-6">
            <p className="label">{tprof("overall")}</p>
            <p className="font-mono text-4xl text-ink tabular">{Math.round(profile.confidence * 100)}%</p>
            <Meter value={profile.confidence} label={tprof("overall")} valueText={tc("percent", { value: profile.confidence })} />
          </div>
        </div>
        {generation.warnings.length > 0 && (
          <div className="mt-4 rounded-md border border-warn/40 bg-surface-1 p-5">
            <p className="flex items-center gap-2 font-medium text-ink">
              <Info className="text-warn" />
              {tgen("warnings.title")}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5 text-ink-muted">
              {generation.warnings.map((warning) => (
                <li key={`${warning.code}-${warning.step ?? ""}`}>
                  {tgen.has(`warnings.${warning.code}` as "warnings.title")
                    ? tgen(`warnings.${warning.code}` as "warnings.title")
                    : warning.code}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>

      <nav aria-label={t("sections")} className="no-print -mt-8 flex flex-wrap gap-2 md:-mt-10">
        {(variant === "tone" ? (["profile", "preset", "feedback"] as const) : (["profile", "preset"] as const)).map((section) => (
          <a
            key={section}
            href={`#${section}`}
            className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
          >
            {t(`jump.${section}`)}
          </a>
        ))}
      </nav>

      {/* Signal chain: universal ⇄ device translation */}
      <section ref={chainRef} aria-labelledby="chain">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="chain" className="text-2xl font-semibold tracking-tight md:text-3xl">
              {tprof("chain.title")}
            </h2>
            <p className="mt-2 max-w-prose text-ink-muted">{mode === "universal" ? tprof("chain.lede") : tpre("lede")}</p>
          </div>
          <TranslationToggle
            name="result-translation"
            mode={mode}
            onChange={(next) => {
              setTouched(true);
              setMode(next);
            }}
            labels={{ group: tpre("view.label"), universal: tpre("view.universal"), device: tpre("view.device") }}
          />
        </div>
        <ChainTranslation
          items={items}
          mode={mode}
          label={tprof("chain.title")}
          selectedId={mode === "device" ? selectedId : null}
          highlightIds={highlightIds}
          onSelect={(id) => {
            setTouched(true);
            setMode("device");
            setSelected(id);
          }}
        />
      </section>

      {/* Tone profile */}
      <section aria-labelledby="profile" className="grid gap-10 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <SectionTitle id="profile" title={tprof("title")} lede={tprof("lede")} />
        </div>
        {/* Tone Signature + the character it encodes (the list is the accessible source). */}
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="w-full">
            <h3 className="text-lg font-medium">{tprof("signature.title")}</h3>
            <p className="mt-1 text-sm text-ink-muted">
              {profile.evidence.audio ? tprof("signature.lede") : tprof("signature.ledeNoAudio")}
            </p>
          </div>
          <ToneSignature
            spectrum={profile.evidence.audio?.ltas ?? null}
            targets={profile.intent.targets}
            label={signatureLabel}
            centerLabel={gain ? tax(`gainClass.${gain}`) : null}
            activeTarget={activeTarget}
            onActiveTarget={setHoverTarget}
            activeBand={(profile.evidence.audio && PERCEPTUAL_BANDS.find((band) => band.key === focusBand)) || null}
          />
          <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ink-muted" aria-label={tprof("signature.legendLabel")}>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-1.5 w-4 bg-signal" />
              {tprof("signature.legend.measured")}
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-1.5 w-4 bg-measure" />
              {tprof("signature.legend.research")}
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-1.5 w-4 bg-[repeating-linear-gradient(90deg,var(--color-ink-faint)_0_3px,transparent_3px_6px)]" />
              {tprof("signature.legend.inferred")}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium">{tprof("targets.title")}</h3>
          <p className="mb-3 mt-1 text-sm text-ink-muted">{tprof("targets.lede")}</p>
          <Targets
            targets={profile.intent.targets}
            active={activeTarget}
            pinned={pinnedTarget}
            onHover={setHoverTarget}
            onTogglePin={togglePin}
          />
          <p className="mt-3 text-xs text-ink-faint">{tprof("signature.hint")}</p>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-medium">{tprof("fingerprint.title")}</h3>
          {profile.evidence.audio ? (
            <>
              <p className="mb-4 text-sm text-ink-muted">{tprof("fingerprint.description")}</p>
              <Fingerprint spectrum={profile.evidence.audio.ltas} focusBand={focusBand} />
            </>
          ) : (
            <p className="rounded-sm border border-dashed border-line-strong p-5 text-ink-muted">{tprof("fingerprint.noAudio")}</p>
          )}
        </div>
        {profile.evidence.audio && (
          <div>
            <h3 className="mb-4 text-lg font-medium">{tprof("audio.title")}</h3>
            <AudioFacts audio={profile.evidence.audio} />
          </div>
        )}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium">{tprof("evidence.title")}</h3>
          <p className="mb-4 mt-1 max-w-prose text-sm text-ink-muted">
            {tprof("evidence.lede")}{" "}
            <Link
              href={{ pathname: "/methodology", hash: "evidence" }}
              className="no-print text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            >
              {tprof("evidence.howLink")}
            </Link>
          </p>
          <EvidenceList claims={profile.evidence.claims} lang={profile.locale} />
        </div>
      </section>

      {/* Preset */}
      <section aria-labelledby="preset">
        <SectionTitle
          id="preset"
          eyebrow={`${tpre.has(`deviceNames.${version.device_key}` as "deviceNames.valeton_gp180") ? tpre(`deviceNames.${version.device_key}` as "deviceNames.valeton_gp180") : version.device_key} · ${tpre("version", { version: version.version })}`}
          title={`${tpre("title")} “${version.name}”`}
          transitionName={sharedName("preset", version.preset_id, String(version.version))}
          lede={tpre("lede")}
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-8">
            {selectedBlock && <BlockInspector block={selectedBlock} intent={selectedIntent} />}
            <div>
              <h3 className="text-lg font-medium">{tpre("explanationTitle")}</h3>
              <p lang={profile.locale} className="mt-2 max-w-prose leading-relaxed text-ink-muted">
                {version.explanation}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <PresetActions version={version} sheetHref={sheetHref} />
            <ImportGuide />
          </div>
        </div>
      </section>

      {/* Feedback — only for the user's own presets */}
      {variant === "tone" && (
        <section aria-labelledby="feedback" className="max-w-3xl">
          <SectionTitle id="feedback" title={tf("title")} lede={tf("lede")} />
          <FeedbackForm presetId={version.preset_id} version={version.version} />
        </section>
      )}
    </div>
  );
}

export function ResultView({ generation, variant, sheetHref }: { generation: Generation } & ResultOptions) {
  const tc = useTranslations("Common");
  const result = generation.result!;
  const profile = useToneProfile(result.tone_profile_id);
  const version = usePresetVersion(result.preset_id, result.preset_version);

  if (profile.error || version.error) {
    const error = toApiError(profile.error ?? version.error);
    return (
      <ProblemState
        code={error.code}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              void profile.refetch();
              void version.refetch();
            }}
          >
            {tc("retry")}
          </Button>
        }
      />
    );
  }
  if (!profile.data || !version.data) return <PageSkeleton label={tc("loading")} />;
  return <Result generation={generation} profile={profile.data} version={version.data} variant={variant} sheetHref={sheetHref} />;
}

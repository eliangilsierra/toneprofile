"use client";

import { useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Archetype, EvidenceLevel, Role } from "@/lib/api/types";
import {
  ChainTranslation,
  TranslationToggle,
  type TranslationItem,
  type TranslationMode,
} from "@/features/preset/chain-translation";

/* Illustrative chain (fictional song "Northern Lights"), same data shape as a real result. */
const DEMO: { id: string; role: Role; archetype: Archetype; evidence: EvidenceLevel; confidence: number; slot: string; model: string; summary: string }[] = [
  { id: "comp", role: "compressor", archetype: "compressor", evidence: "likely", confidence: 0.62, slot: "PRE", model: "COMP4", summary: "SUSTAIN 45 · ATTACK 55" },
  { id: "amp", role: "amp", archetype: "fender_blackface_clean", evidence: "reported", confidence: 0.72, slot: "AMP", model: "Dark Twin", summary: "GAIN 24 · TREBLE 63" },
  { id: "cab", role: "cab", archetype: "open_back_2x12", evidence: "inferred", confidence: 0.55, slot: "CAB", model: "US 2x12", summary: "HIGH CUT 9.5k" },
  { id: "mod", role: "modulation", archetype: "chorus", evidence: "likely", confidence: 0.78, slot: "MOD", model: "C Chorus", summary: "RATE 1.2 Hz · MIX 40" },
  { id: "dly", role: "delay", archetype: "dotted_eighth_delay", evidence: "likely", confidence: 0.9, slot: "DLY", model: "Digital Delay S", summary: "TIME 375 ms · FB 34" },
  { id: "rvb", role: "reverb", archetype: "hall", evidence: "likely", confidence: 0.68, slot: "RVB", model: "Hall", summary: "MIX 24 · DECAY 58" },
];

export function TranslationDemo() {
  const t = useTranslations("Landing.translation");
  const tax = useTranslations("Taxonomy");
  const tc = useTranslations("Common");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [mode, setMode] = useState<TranslationMode>("universal");
  const [touched, setTouched] = useState(false);

  // Play the translation once when the chain comes into view, unless the user already chose.
  useEffect(() => {
    if (!inView || touched) return;
    const timer = window.setTimeout(() => setMode("device"), 900);
    return () => window.clearTimeout(timer);
  }, [inView, touched]);

  const items: TranslationItem[] = DEMO.map((item) => ({
    id: item.id,
    role: tax(`roles.${item.role}`),
    archetype: tax(`archetypes.${item.archetype}`),
    evidence: item.evidence,
    confidenceLabel: tc("confidenceValue", { value: item.confidence }),
    device: { slot: item.slot, model: item.model, summary: item.summary },
  }));

  return (
    <div ref={ref} className="flex flex-col gap-6">
      <TranslationToggle
        name="landing-translation"
        mode={mode}
        onChange={(next) => {
          setTouched(true);
          setMode(next);
        }}
        labels={{ group: t("eyebrow"), universal: t("universal"), device: t("device") }}
      />
      <ChainTranslation items={items} mode={mode} label={t("title")} />
    </div>
  );
}

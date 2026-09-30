"use client";

import { useState } from "react";
import type { EvidenceLevel, GenerationStatus, StepStatus } from "@/lib/api/types";
import { buildSpectrum } from "@/mocks/fixtures/spectrum";
import { Button } from "@/ui/button";
import { EvidenceMark } from "@/ui/evidence-mark";
import { Field, Select } from "@/ui/field";
import { ArrowRight, Download } from "@/ui/icons";
import { Meter } from "@/ui/meter";
import { Skeleton } from "@/ui/skeleton";
import { StatusChip } from "@/ui/status-chip";
import { SignalRail } from "@/features/generation/signal-rail";
import { ChainTranslation, TranslationToggle, type TranslationMode } from "@/features/preset/chain-translation";
import { ProblemState } from "@/features/shell/problem-state";
import { Fingerprint } from "@/features/tone-profile/fingerprint";

const SWATCHES = [
  "canvas",
  "surface-1",
  "surface-2",
  "surface-3",
  "line",
  "line-strong",
  "ink",
  "ink-muted",
  "ink-faint",
  "signal",
  "measure",
  "ok",
  "warn",
  "danger",
];
const LEVELS: EvidenceLevel[] = ["confirmed", "reported", "likely", "inferred", "unknown"];
const STATUSES: GenerationStatus[] = ["queued", "running", "ready", "failed", "cancelled"];
const STEP_STATES: StepStatus[] = ["done", "done", "failed", "running", "pending", "skipped"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="label mb-6">{title}</h2>
      {children}
    </section>
  );
}

export function LabView() {
  const [mode, setMode] = useState<TranslationMode>("universal");
  return (
    <main id="content" className="mx-auto max-w-[88rem] px-5 py-12 md:px-8">
      <h1 className="font-serif text-headline">Signal Lab — design system</h1>
      <p className="mt-3 max-w-prose text-ink-muted">Every token and component in one place. Not linked from the product.</p>

      <Block title="Colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {SWATCHES.map((name) => (
            <div key={name} className="overflow-hidden rounded-sm border border-line">
              <div className="h-14" style={{ background: `var(--color-${name})` }} />
              <p className="px-2 py-1.5 font-mono text-xs">{name}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Typography">
        <p className="font-serif text-display">Display</p>
        <p className="font-serif text-headline">Headline serif</p>
        <p className="text-3xl font-semibold tracking-tight">Heading sans</p>
        <p className="mt-2 max-w-prose">Body — Instrument Sans at 16/1.55 for long-form explanations.</p>
        <p className="label mt-2">Technical label · JetBrains Mono</p>
        <p className="mt-2 font-mono text-sm tabular">GAIN 68 · MIDDLE 66 · 375 ms · 7.2kHz</p>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>
            Primary <ArrowRight />
          </Button>
          <Button variant="secondary">
            <Download /> Secondary
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Block>

      <Block title="Form controls">
        <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
          <Field id="lab-select" label="Select" hint="Native select, styled.">
            <Select id="lab-select">
              <option>Humbucker + two singles (HSS)</option>
              <option>Two humbuckers (HH)</option>
            </Select>
          </Field>
          <Field id="lab-error" label="With error" error="Select at least 5 seconds.">
            <Select id="lab-error" aria-invalid>
              <option>—</option>
            </Select>
          </Field>
        </div>
      </Block>

      <Block title="Evidence, status, meters">
        <div className="flex flex-wrap gap-5">
          {LEVELS.map((level) => (
            <EvidenceMark key={level} level={level} />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {STATUSES.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
        <div className="mt-6 grid max-w-md gap-3">
          <Meter value={0.8} label="Measured" valueText="80%" tone="signal" />
          <Meter value={0.55} label="Research" valueText="55%" tone="measure" />
          <Meter value={0.3} label="Inferred" valueText="30%" tone="muted" />
        </div>
      </Block>

      <Block title="Signal Rail (all step states)">
        <SignalRail
          label="Lab rail"
          stations={STEP_STATES.map((status, index) => ({
            key: `s${index}`,
            label: `Step ${index + 1}`,
            status,
            statusLabel: status,
            detail: status === "done" ? "7 sources · 3 claims" : null,
            description: status === "pending" ? "Waiting for the signal" : undefined,
          }))}
        />
      </Block>

      <Block title="Chain translation">
        <TranslationToggle
          name="lab-translation"
          mode={mode}
          onChange={setMode}
          labels={{ group: "View", universal: "Tone profile", device: "Device" }}
        />
        <ChainTranslation
          className="mt-6"
          label="Lab chain"
          mode={mode}
          items={[
            { id: "a", role: "Drive", archetype: "TS-style boost", evidence: "likely", confidenceLabel: "64%", device: { slot: "DST", model: "Green OD", summary: "GAIN 8 · TONE 62" } },
            { id: "b", role: "Amp", archetype: "British high gain", evidence: "reported", confidenceLabel: "75%", device: { slot: "AMP", model: "UK 800", summary: "GAIN 68 · MIDDLE 66" } },
            { id: "c", role: "Cab", archetype: "Closed-back 4×12", evidence: "inferred", confidenceLabel: "60%", device: { slot: "CAB", model: "UK 4x12", summary: "HIGH CUT 7.2kHz" } },
            { id: "v", role: "VOL", archetype: null, device: { slot: "VOL", model: "Volume", summary: "VOLUME 100" } },
          ]}
        />
      </Block>

      <Block title="Tone fingerprint">
        <div className="max-w-3xl">
          <Fingerprint
            spectrum={buildSpectrum({
              bumps: [
                { hz: 1500, db: 4, octaves: 0.9 },
                { hz: 400, db: -2, octaves: 0.8 },
              ],
              lowCut: { hz: 95, slope: 10 },
              highCut: { hz: 5200, slope: 13 },
            })}
          />
        </div>
      </Block>

      <Block title="Problems & loading">
        <div className="grid gap-4 lg:grid-cols-2">
          <ProblemState code="no_guitar_detected" actions={<Button variant="secondary">Choose another passage</Button>} />
          <ProblemState code="research_unavailable" tone="warn" />
        </div>
        <div className="mt-6 flex max-w-md flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Block>
    </main>
  );
}

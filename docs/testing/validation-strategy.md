# Testing & Validation Strategy

Two different questions, two different test systems:

1. **Is the software correct?** → unit, golden, integration tests (automated, CI).
2. **Is the tone useful?** → evaluation suite on real hardware + human listening (semi-automated).

## 1. Software tests

| Layer | What | How |
|---|---|---|
| Unit | Tone intent schema & rules, archetype vocabulary, mapper constraints, parameter clamping/quantization, evidence grading rules, cost accounting, auth scoping | pytest, hypothesis (property tests: any valid intent → valid patch) |
| Golden (codec) | `parse → serialize` byte-identical for every fixture; `DevicePatch → .prst → DevicePatch` identity; snapshot of known presets as JSON | pytest; fixtures from our own device exports |
| Golden (DSP) | Feature extraction on reference WAVs stable within tolerance across versions | pytest with numeric tolerances |
| Integration | Postgres repositories, job queue (claim/retry/idempotency), S3 uploads, sandboxed ffmpeg with malformed files, API endpoints | docker compose in CI |
| AI adapters | Schema-valid outputs, retry/timeout behaviour, cost metering | `RecordedGateway` replay in CI; small live smoke test nightly |
| E2E | New tone → result → download; match flow | Playwright against compose stack with recorded LLM |
| Fuzz | `.prst` parser, audio probe | atheris / hypothesis |
| Hardware | Generated presets import & play; known-answer tests | Self-hosted runner with GP-180 (manual trigger) |

What **cannot** be automated: the Suite import click (unless SysEx write is reverse engineered), and
the human judgement of "does this sound right".

## 2. Hardware test bench

```text
                ┌──────────── computer ─────────────┐
DI corpus.wav ─►│ playback (USB re-amp or interface) │──► GP-180 input
                │ MIDI Program Change (official)     │──► GP-180 preset select
GP-180 output ─►│ record (USB audio in)              │──► captured.wav → features → report
                └────────────────────────────────────┘
```

Setup steps: (1) resolve U7 (USB re-amp); (2) record the DI corpus once per test guitar;
(3) fix levels (input gain, patch volume normalization, output level) and document them;
(4) calibration check at the start of each session (render a fixed reference preset, compare to
stored baseline; abort if drift > 0.5 dB).

## 3. Evaluation suites

### 3.1 Known-answer tests (ground truth exists)

- **Hidden-preset recovery:** render the DI corpus through a hidden GP-180 preset (factory or
  random-but-sane), give only the audio to the system, compare recovered patch and rendering.
  Measures the analyzer + mapper in isolation, with no studio-chain confounds.
- **Real-amp references:** render the DI corpus through public NAM captures of real amps
  (license permitting) → can the mapper reproduce "a JCM800-like capture" on the GP-180?

### 3.2 Song suite (no ground truth)

Initial proposal — 20 references spanning tone categories and specific detection challenges.
The list is a starting point to be adjusted; **gear used on these recordings is deliberately not
stated here** (that is what the research step must find and cite).

| # | Category | Reference (artist — song) | What it stresses |
|---|---|---|---|
| 1 | Clean, edge of breakup | John Mayer — Slow Dancing in a Burning Room | Low gain, dynamics, touch |
| 2 | Blues, edge of breakup | Stevie Ray Vaughan — Pride and Joy | Crunch vs clean boundary |
| 3 | Clean funk | Chic — Good Times | Bright clean, compression |
| 4 | Clean funk (modern) | Daft Punk — Get Lucky | Clean rhythm in a dense mix |
| 5 | Funk-rock | Red Hot Chili Peppers — Can't Stop | Muted clean/crunch + effects |
| 6 | Classic rock | AC/DC — Back in Black | Mid-gain, dry |
| 7 | Classic rock | Led Zeppelin — Whole Lotta Love | Mid-gain, era production |
| 8 | Hard rock | Guns N' Roses — Sweet Child o' Mine | Lead + rhythm sections |
| 9 | Alt/grunge | Nirvana — Smells Like Teen Spirit | Clean verse vs distorted chorus (sections) |
| 10 | Modern rock | Foo Fighters — Everlong | Dense double-tracked distortion |
| 11 | High gain | Metallica — Master of Puppets | Tight high gain, scooped mids |
| 12 | Modern metal | Gojira — Stranded | Modern high gain, pitch effects |
| 13 | Fuzz | The Jimi Hendrix Experience — Purple Haze | Fuzz vs distortion |
| 14 | Octave/fuzz | The White Stripes — Seven Nation Army | Pitch effect + fuzz |
| 15 | Ambient delay | U2 — Where the Streets Have No Name | Dotted-eighth delay detection |
| 16 | Ambient/post-rock | Explosions in the Sky — Your Hand in Mine | Reverb/delay washes |
| 17 | Clean + modulation | The Police — Message in a Bottle | Modulation detection |
| 18 | Lead | Pink Floyd — Comfortably Numb (solo) | Sustained lead, delay |
| 19 | Pop | Harry Styles — As It Was | Clean pop guitar in a synth mix |
| 20 | Acoustic | Oasis — Wonderwall | Acoustic simulation path |

Each case records: the section (timestamps), whether an excerpt is provided, the test guitar used.

## 4. What we measure

Spectral similarity ≠ tone similarity. Metrics are therefore layered, and objective metrics are
validated against human ratings before being trusted as gates.

| Metric | Meaning | Use |
|---|---|---|
| LTAS distance (mean abs dB, 1/3-octave, 100 Hz–8 kHz, loudness-normalised; tilt-removed variant) | Spectral balance match | Primary objective metric |
| Saturation proxy deltas (flatness, harmonic density, crest factor) | Gain class/amount | Secondary |
| Ambience deltas (decay, delay time/feedback detected) | Effects presence | Secondary |
| Embedding distance (AFx-Rep/CLAP/MERT) | Learned similarity | Exploratory — adopt only if rank-correlation with human ratings ≥ 0.5 |
| Parameter recovery error (known-answer only) | Model family hit, knob MAE | Known-answer suites |
| **Human ratings** | Usefulness 1–5 ("usable starting point with ≤ 3 tweaks"), closeness 1–5, blind pairwise preference | **Headline metric** |

Human protocol: 2–3 guitarists (including the developer), blind, randomized order, same guitar and
monitoring, level-matched. Pairwise: toneprofile vs. (a) LLM-only baseline, (b) closest factory
preset chosen by name/genre. Rate on the device (playing), not only by listening.

## 5. MVP success criteria (measurable)

| # | Criterion | Target |
|---|---|---|
| S1 | Codec correctness | 100 % byte-identical round trips on all fixtures; 30/30 generated presets import via Suite without error, with 5 spot-checked parameters per preset matching the device display |
| S2 | Structured representation | 100 % of generations produce schema-valid ToneEvidence and ToneIntent; 0 archetypes outside vocabulary |
| S3 | Device mapping validity | 100 % of mapped patches pass the validator; 0 presets producing silence or clipping > −1 dBFS on the rig |
| S4 | Known-answer recovery | Same amp family in ≥ 70 % of 20 hidden presets; LTAS error ≤ 2 dB in ≥ 80 % |
| S5 | Real-amp references | LTAS error ≤ 3 dB and human usefulness ≥ 4/5 in ≥ 70 % of cases |
| S6 | Song suite usefulness | Median usefulness ≥ 3.5/5; preferred over LLM-only baseline in ≥ 65 % and over closest factory preset in ≥ 60 % of blind pairs |
| S7 | Honesty | 100 % of claims above `inferred` have a verified quote in a retrievable source; ≥ 90 % precision on a manually checked sample of 50 claims |
| S8 | Repeatability | Deterministic steps bit-identical on re-run; amp-family agreement ≥ 80 % across 5 fresh-research runs |
| S9 | Match mode | Following the suggestions reduces LTAS error vs. reference in ≥ 75 % of iterations |
| S10 | Operations | p50 end-to-end ≤ 30 s (song only, cached research), ≤ 90 s (with excerpt); median variable cost ≤ $0.15 |

**Go / no-go at the "First Loop" milestone:** S1–S4 and S7 must pass; S6 must at least beat the
LLM-only baseline. If S6 fails while S4 passes, the problem is research/intent, not the device
engine — iterate there before building the web app.

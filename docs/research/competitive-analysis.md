# Competitive Analysis

Research date: 2026-09-29. Information comes from each product's public pages at that date;
pricing and features change quickly. "Not verified" marks items stated from general knowledge
that were not re-checked in this research pass.

## 1. Summary

The "AI tone generator" space is **crowded and young**. Almost every product is an LLM that maps a
song/artist/description to a signal chain from a knowledge base, optionally exporting a device
file. Very few analyse audio, and **none we found closes the loop** by measuring what the target
device actually sounds like with the generated settings.

The most direct competitor for our first device already exists: **GP Tone Builder** (iOS/macOS)
generates GP-150/GP-180 patches from a song name with stem separation and sends them over
Bluetooth.

**Consequence for toneprofile:** "song name → preset for GP-180" is *not* a defensible product by
itself. Differentiation must come from measurable quality and honesty:

1. **Closed-loop, device-measured mapping** (device characterization + recording comparison).
2. **Evidence-based gear research** with sources and confidence levels, no fabricated gear.
3. **Transparent, editable result** (signal chain, reasons, alternatives), not a black box.
4. **Legally conservative audio handling** (no automatic downloading of copyrighted audio).
5. Later: one tone → many devices, from the same device-independent intent.

## 2. Direct competitors (song/description → device preset)

| Product | Target / Input | Output | Devices | AI usage | Pricing | Strengths | Weaknesses |
|---|---|---|---|---|---|---|---|
| **[GP Tone Builder](https://apps.apple.com/us/app/gp-tone-builder/id6760564651)** (dev. Aziz Bou Harb) | Valeton owners; song name, guitar/bass | Patch file + **BLE send to device**; per-section tones (clean intro / OD verse / dist chorus) | Valeton GP-5, GP-50, GP-150, **GP-180** | "AI stem separation", spectral features, key detection | 3 free analyses; $29.99/yr | Exactly our first use case; direct device transfer; section awareness | "The app handles audio download" — legal exposure; no visible evidence/sources; tiny user base (3 ratings); Apple-only |
| **[Dial My Tone](https://www.dialmytone.com/)** | Modeler owners; song/style/"inspired by", pickups, monitoring | Native files (.hlx, .pgp, .hsp, .t3kpreset) + live hardware sync (FM9, Spark) | Helix/HX/Stadium, Katana Gen 3, Quad Cortex, Fractal FM9/FM3/Axe-Fx III, Spark, Mustang LT25, Tone Master Pro, HeadRush, TONE3000 | Research-driven LLM "starting points" | Free tier; paid tiers | Broad device coverage; real file export; honest "starting point" framing | No Valeton; no audio analysis evident |
| **[PresetMachine](https://presetmachine.com/)** | Text: artist/song/words | Settings for your gear | HX Stomp, M-Vave, **Valeton GP-200**, Sonicake, "all pedals" | LLM + knowledge base of iconic tones | $5/10, $10/25, $15/50 presets | Cheap, device-agnostic | Settings only; generic |
| **[Cortex ToneAI](https://apps.apple.com/mx/app/cortex-toneai/id6760904546)** | Quad Cortex players; text | "Ready-to-build" preset description | Quad Cortex | LLM | App Store | Focused | Build manually; single device |
| **[GuitarAI – AI Tone Finder](https://play.google.com/store/apps/details?id=com.Catiroglumert.GuitarAI)** | Song; user's gear | Practical settings | Any gear (settings) | "3-step AI analysis" | App store | Any song | Settings only; no file |
| **TonesMatch** (listed on creati.ai) | Recording reference | Amp/pedal/pickup/EQ settings | Generic | "Analyzes original recordings" | n/a | Audio-driven claim | Settings only; unclear method |
| **[Tone AI Generator](https://ai-tone-generator.vercel.app/)** | Song | "Ready-to-use preset for your multi-effects pedal" | Unclear | Isolates guitar + spectrum analysis | n/a | Audio-driven | Early/unclear product |
| **[guitartone.ai](https://guitartone.ai/)** | Tone description | Gear/modeler/plugin recommendations | Generic | LLM | n/a | Recommendations | Page content not accessible for verification |
| **[Positive Grid Spark AI](https://www.positivegrid.com/blogs/positive-grid/what-is-spark-ai)** | Text prompt: artist/song/feel | 4 tone options on Spark amps | Spark amps (own ecosystem) | Model trained on PG tone library | Bundled | Integrated hardware + app; massive tone corpus | Closed ecosystem |
| **[Positive Grid BIAS X](https://www.musicradar.com/guitars/positive-grid-project-bias-x-plugin)** | Text + **music-to-tone** (song or isolated guitar) | Plugin tone + visible signal chain | Plugin (own DSP) | "Agentic AI", trained on >1M tones | ~$149 | Strongest audio→tone offering; controls its own DSP so it can render and compare | Not a hardware-preset tool |
| **[ToneCraft AI](https://www.tonecraft.tech/)** | Text, reference audio, live guitar | Editable "Parameter Cards"; own VST3/AU/web simulator | Own plugin | ML audio→settings; stem separation ("StemFlow"); claims "82% prediction accuracy" | Free + paid | Audio→settings, transparent recipes | Own DSP, not hardware |

## 3. Valeton-specific community tools (signals of demand)

| Project | What it does |
|---|---|
| [GP Patch Lab](https://github.com/Kaprrrr/Valeton-Tone-Finder) (Expo app, GP-200) | Gemini-backed "AI tone search" with confidence + reasoning; USB MIDI send; Songsterr tabs |
| [ValeAnalize](https://github.com/showtimeeventssa-cloud/ValeAnalize-3) (PWA, GP-50) | Browser audio analysis (pitch confidence, frame selection) → GP-50 binary export; explicitly says it is "not a claim of recovering an unknown original studio preset" |
| [gp5-editor](https://github.com/fsanchezlme97-ui/gp5-editor) (GP-5/GP-50) | Web MIDI editor with "create preset with AI from a song name" |
| [Tone3000-PresetBuilder](https://github.com/tlennon-ie/Tone3000-PresetBuilder) | AI agent that builds NAM-capture chains from artist/style |
| [gp200-studio](https://github.com/kabir0st/gp200-studio) | Browser editor for GP-200 (no AI) — shows the Web MIDI editor pattern |

Takeaway: LLM-only generators are a weekend project now. They are not our moat.

## 4. Adjacent products (pieces of the problem)

| Category | Products | Relevance |
|---|---|---|
| Stem separation APIs | [Music.AI / Moises](https://music.ai/pricing/) (guitar stems, rhythm/lead split, ~$0.10/min), [LALAL.AI](https://www.lalal.ai/pricing/) (~$0.15/min/stem), AudioShake | Optional provider for guitar isolation |
| Capture ecosystems | [TONE3000](https://www.tone3000.com/api) (NAM captures + IRs, public API), IK TONEX (not verified), Neural DSP captures (not verified) | Source of *ground-truth real-amp references* for our evaluation; future NAM-assisted mode (GP-180 loads SnapTones) |
| Built-in tone matching | Fractal "Tone Match" EQ-matching block (not verified), Line 6 Helix Stadium "Proxy" capture (not verified) | Proves that spectrum matching is valued, and also its limits (EQ-match ≠ amp behaviour) |
| Commercial preset packs | Worship Tutorials tone-match packs, [Tonelab MoraPresets for GP-150/180](https://www.tonelabstore.com/en/products/valeton-gp-150-morapresets-presets-worship-rock-choirs-presets-irs), [GalTone Studio](https://www.galtonestudio.com/) | Human-curated baseline; also confirms `.prst` sharing is an accepted workflow |
| Tabs / song data | Songsterr, Ultimate Guitar (not verified) | Song identity & sections; possible partnership, not scraping |
| Research | ST-ITO (Steinmetz et al., ISMIR 2024), Comunità et al. (JAES 2021), Lee et al. (ICASSP 2023) | Methods for effect-parameter estimation by optimization against a learned/feature similarity — directly applicable to our mapper |

## 5. Positioning

| Axis | Typical competitor | toneprofile |
|---|---|---|
| Core method | LLM guess from gear knowledge | Evidence (research + audio features) → intent → **device-measured** solve |
| Honesty | Confident single answer | Confidence per claim, sources, alternatives, "unknown" allowed |
| Validation | None published | Public methodology, known-answer tests, blind listening results |
| Audio acquisition | Some auto-download songs | User-provided excerpts only; derived features retained, audio deleted |
| Device depth | Many devices, shallow | One device, deep (then expand via the same intent layer) |

## 6. Risks

- GP Tone Builder or Valeton itself could ship "good enough" quickly. Valeton owns the DSP and
  could render-and-compare internally — the strongest possible competitor.
- Price anchor is low (GP Tone Builder $29.99/yr) → per-generation cost must stay well under $0.10
  at scale (see [cost model](../architecture/cost-model.md)).
- Valeton firmware/Suite changes could break the format; mitigated by catalog versioning and a
  fallback dial-in sheet.

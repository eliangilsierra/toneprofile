# Product Definition — toneprofile

Working name in the brief: toneforge.ai. Final product name: **toneprofile**.

## 1. User

**Primary (MVP):** an owner of a Valeton GP-180 (and, cheaply, the format-compatible GP-150) —
typically an intermediate hobbyist guitarist who bought an affordable modeler, wants to play along
with specific songs, and finds building tones on a small screen slow and guesswork-driven.

**Secondary (later):** owners of other modelers (Line 6, Boss, HeadRush, Neural DSP, Fractal,
Mooer…), guitar teachers preparing song tones, cover/worship players with set lists.

## 2. Problem

- "I want to sound like *that song* on *my* device" requires knowing the original rig, knowing
  which device models approximate it, and knowing how to set them — three kinds of expertise.
- Existing answers are forum threads, paid preset packs, or LLM-generated guesses that are not
  device-aware and often invent gear.

## 3. Value proposition

> Pick a song (and optionally upload a short excerpt), and get a GP-180 preset you can import in a
> minute — with an honest explanation of what we know, what we inferred, and how to fine-tune it —
> then record yourself and let toneprofile close the gap.

Differentiators: device-measured mapping, cited evidence with confidence, editable intent,
recording-based matching, legally conservative audio handling. See
[competitive analysis](../research/competitive-analysis.md).

## 4. Product modes — decision

| Mode | MVP? | Rationale |
|---|---|---|
| A. Song → Tone | **Yes** | Lowest friction; research-driven; must show uncertainty |
| B. Audio excerpt → Tone | **Yes** (user upload only) | Adds measured targets (spectrum, gain class, ambience) |
| C. URL → Tone (YouTube/Spotify) | **No** | Terms-of-service and copyright exposure, SSRF surface; see [legal](legal-considerations.md) |
| D. Recording → Match | **Yes, "lite"** | The strongest quality lever; reuses the evaluation comparison code at no extra cost; limited to spectral/gain/ambience suggestions |

## 5. MVP scope

In:
- GP-180 only (GP-150 as a free by-product if verified).
- Song search, optional excerpt, guitar profile (pickup configuration + position), section choice.
- Result: evidence (confirmed/reported/likely/inferred/unknown with sources), signal chain,
  parameters, alternatives, explanation, `.prst` download, dial-in sheet, import instructions.
- Editing: intent-level (re-solve) and patch-level; immutable versions.
- Match: upload GP-180 recording → suggestions → new version.
- Feedback per version.
- Accounts, quotas, internal admin/trace view.

Out (until evidence says otherwise): other devices; direct USB/BT push to device; NAM/IR
management; URL ingestion; public preset library, social, marketplace; payments; mobile apps;
collaboration; large curated preset catalogue.

## 6. Human in the loop

A generated preset is a proposal. The user can:
- Accept/replace any block's model among ranked alternatives.
- Edit perceptual intent ("more gain", "darker", "less reverb") → deterministic re-solve.
- Edit raw device parameters directly (power users).
- Compare versions, revert, and export any version.
- Regenerate with different evidence (e.g. "live version", different section).

## 7. The physical guitar

| Input | MVP | Use |
|---|---|---|
| Pickup configuration (SSS/HSS/HH/P90/…) & position | **Yes** | Gain and brightness compensation; optional PRE pickup simulator |
| Guitar body/type | Optional | Context for explanation |
| Tuning | **Yes** | Instructions; drop-tuning songs |
| Strings, output level, playing style | No | Later; captured implicitly by Match mode recordings |

## 8. Success criteria

See [validation strategy §5](../testing/validation-strategy.md#5-mvp-success-criteria-measurable).
In short: presets always import and play; blind-rated usefulness median ≥ 3.5/5; beats an LLM-only
baseline and the closest factory preset; zero fabricated sources.

## 9. UX principles

- Looks like a serious music tool: signal-chain view, knob-accurate values, level-matched audio.
- Never pretend: every claim has a badge and a source, "unknown" is a valid answer.
- Always a way forward: if import fails, the dial-in sheet reproduces the preset by hand.

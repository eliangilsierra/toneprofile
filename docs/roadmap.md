# Roadmap

Principle: **prove the physical loop from the command line before building the SaaS.** The web
application comes after the "First Loop" go/no-go gate, not before.

Durations assume one developer, part-time-to-full-time; they are sizing hints, not commitments.

```text
P0 Research & setup ──► P1 GP-180 codec PoC ──► P2 Measurement rig ──► P3 Tone model + mapper
                              (hardware gate)                                   │
                                                                                ▼
        P7 Real-world validation ◄── P6 Web app alpha ◄── [FIRST LOOP gate] ◄── P5 Research + intent (AI)
                                                                ▲
                                                   P4 Reference analysis + Match
```

Why this order (vs. the brief's sequence): the device path (P1) is the highest-risk unknown and is
cheap to test; the measurement rig (P2) is needed *before* the tone model so that mapping is built
on measured device behaviour; AI (P5) comes late because it is the easiest part to prototype and
the hardest to evaluate without the rig and the eval suite.

---

## P0 — Research & repository setup (≈ 1 week) ✅ research done

- [x] Research, proposal, ADRs (this documentation).
- [ ] Record device facts: firmware version, Suite version, OS.
- [ ] Check USB settings for a re-amp / playback-to-DSP option (U7).
- [ ] Scaffold repository per [repository.md](architecture/repository.md) (uv, ruff, pyright, pytest,
      import-linter, compose, CI skeleton).

**DoD:** repo builds in CI with an empty test suite; device facts recorded in
`docs/devices/valeton-gp180/test-bench.md`.

## P1 — GP-180 preset codec proof of concept (≈ 1–2 weeks) — HARDWARE GATE

Steps (the brief's §33, made concrete):

1. Export 5–10 presets from **our own** GP-180 via Suite (include: a default preset, one with a
   reordered chain, one with SnapTone, one with every module on). Commit these as fixtures.
2. `toneprofile preset parse file.prst > file.json` — header, chain, blocks, params.
3. Round trip: `serialize(parse(x)) == x` for all fixtures (golden test).
4. **PoC-1 (U1):** change one parameter (e.g. AMP gain 50 → 73), serialize, import into an empty
   user slot, verify the value on the device screen and by ear.
5. **PoC-2 (U2):** same file with `0x0E–0x0F` = original, `0000`, random.
6. **PoC-3 (U3):** reorder chain on device, export, diff; then generate a reordered preset.
7. **PoC-4 (U4/U5):** controlled exports to locate parameter order and engine tags for the ~20 most
   useful models; build `observed_rules.json`.
8. **PoC-5:** JSON → preset from template with a completely different chain (amp + drive + delay +
   reverb) → import → plays as specified.
9. Catalog extractor: read Suite metadata from the local installation → `catalog.json` (not
   committed if it contains Valeton data verbatim; committed: our derived schema + semantics).

**DoD / exit criteria:** S1 met (30/30 generated presets import and match); unknowns U1–U5 each
resolved or explicitly worked around; format spec updated to "verified on GP-180 FW x.y.z".
**If it fails:** switch delivery to dial-in sheets (ADR-002 fallback) and continue — the rest of
the roadmap still applies.

## P2 — Measurement rig & comparison core (≈ 1–2 weeks)

- DI corpus recorded (≥ 2 guitars: single-coil and humbucker; fixed phrases).
- Rig CLI: generate sweep bank → (manual bulk import) → MIDI PC stepping → re-amp → capture.
- Feature extraction + comparison module (LTAS, saturation, dynamics, ambience) with golden tests.
- Calibration routine and drift check.
- First known-answer test: hide 5 presets, compare renders.

**DoD:** one command renders a bank of presets through the device and produces a feature report;
repeat runs agree within 0.5 dB.

## P3 — Tone model & deterministic mapper (≈ 2–3 weeks)

- `ToneEvidence` / `ToneIntent` schemas + archetype vocabulary.
- Curated GP-180 semantics (archetypes, gain class, based-on with evidence level) for all models.
- Characterization sweeps for ~20 core models (amps, main drives, cabs, SnapTones if U6 resolved).
- Mapper: candidate selection, slot assignment, parameter solving against characterization,
  guitar compensation, alternatives; validator; dial-in sheet generator.
- CLI: `toneprofile generate --intent intent.json --guitar hss_bridge -o out.prst`.

**DoD:** S2, S3 met; S4 (known-answer recovery) met on 20 hidden presets.

## P4 — Reference analysis & Match (≈ 2 weeks)

- Sandboxed decode, window selection, separation port (noop + Demucs CPU; API adapter optional).
- Separation benchmark on the song suite (downstream metrics, not SDR); license check of weights.
- Audio → measured targets in `ToneEvidence`.
- Match: recording vs reference → device-level suggestions.

**DoD:** S5 and S9 met on the NAM-capture and self-recorded tests.

## P5 — Research & intent (AI) (≈ 2 weeks)

- `LLMGateway` + Anthropic adapter + recorded adapter + OpenRouter adapter (evals).
- Song resolution (MusicBrainz) and bounded research loop with verified quotes; evidence rules.
- Intent drafting with schema + vocabulary constraints; explanation.
- Eval harness: gold claims for 10 songs, 20-song suite runner, cost/latency report, model
  comparison (one capable model at low effort vs. cheaper models).

**DoD:** S7, S8 met; cost per generation measured.

## ★ FIRST LOOP milestone (end of P5)

`song (+ optional excerpt) → evidence → intent → GP-180 preset → real GP-180 → real guitar → rated`.

Go/no-go per [validation strategy §5](testing/validation-strategy.md#5-mvp-success-criteria-measurable):
S1–S4 and S7 pass; S6 beats the LLM-only baseline. If not, iterate P3–P5; do not start P6.

## P6 — Web application private alpha (≈ 3–4 weeks)

- Backend (`toneprofile-api`): FastAPI `/v1` endpoints, Postgres schema + migrations, job runner,
  storage, auth, quotas; publish `openapi.json` with each API release.
- Integrate this repository's web app (built in the parallel web track, see below) with the real
  API: switch to `NEXT_PUBLIC_API_MODE=http`, auth, client generated from the
  pinned OpenAPI release, its own CI and deploy.
- Observability (OTel, Sentry, cost dashboards), security controls from the
  [security model](architecture/security.md).
- Deploy pipeline (Fly.io + Supabase for the API; a Next.js host such as Vercel for the web app).

**DoD:** a new user can sign in, generate, download, import and give feedback (Match follows as P1); S10 met;
security checklist complete; privacy policy and terms drafted for legal review.

## P7 — Real-world validation (ongoing, ≈ 4 weeks initial)

- 5–10 GP-180 owners (forums/Discord), structured feedback per preset version.
- Blind listening sessions on the song suite; publish methodology and results.
- Decide next bet by data: GP-150 support, direct device transfer (SysEx), NAM-assisted mode
  (SnapTone from TONE3000 captures), second device family via the intent layer, or pricing.

---

## Web track (parallel, this repository)

Built against the contract-first API and the MSW demo backend, independent of the backend phases.
Details: [MVP master plan](product/mvp-master-plan.md), [frontend architecture](frontend/frontend-architecture.md).

| Phase | Objective | Status |
|---|---|---|
| W0 | Research, creative directions, design system, UX architecture, contract, master plan, risks, ADRs | ✅ done |
| W1 | Scaffold: Next 16, TS strict, Tailwind v4, next-intl (en/es), ESLint, Vitest, Playwright, CI | ✅ done |
| W2 | Design system: tokens, fonts, `ui/` primitives, motion primitives, `/lab` | ✅ done |
| W3 | Contract types, API client, MSW scenario engine + fixtures | ✅ done |
| W4 | Landing with live Signal Rail and translation demo | ✅ done |
| W5 | App shell + Library | ✅ done |
| W6 | Create Tone (song search, excerpt upload + waveform window, guitar, device) | ✅ done |
| W7 | Analysis experience (Signal Rail, findings, cancel/retry, error states) | ✅ done |
| W8 | Tone Profile (fingerprint, character, evidence, chain) | ✅ done |
| W9 | Preset (translation, inspector, explanation, checks, download/demo reason, dial-in sheet, import guide, feedback) | ✅ done |
| W10 | Quality: responsive, reduced motion, axe, bundle + vitals measurement | ✅ done ([performance](frontend/performance.md)) |
| W10b | Examples (`/v1/examples`), Methodology + FAQ, Legal drafts (privacy, terms, audio), site footer | ✅ done |
| W11 | P1 features: Match, fine-tune (intent sliders), saved guitars, light theme | next |
| W12 | Integration with the real API (P6): http mode, auth, deploy | with P6 |

---

## Global Definition of Done (per milestone)

1. Exit criteria met and evidenced in a short report under `docs/testing/reports/`.
2. Code: typed, linted, tested, boundary rules enforced, CI green.
3. Hardware claims carry the verification ladder level reached.
4. ADRs updated for any changed decision; unknowns table updated.
5. Cost and latency measured, not estimated, for anything that runs per generation.

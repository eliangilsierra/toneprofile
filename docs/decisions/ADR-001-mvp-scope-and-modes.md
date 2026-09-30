# ADR-001 — MVP scope and product modes

- Status: accepted
- Date: 2026-09-29

## Context

The brief lists four modes (Song, Audio, URL, Recording → Match) and a long-term multi-device
vision. Research shows LLM-only "song → preset" generators are common, and one already targets the
GP-180 (GP Tone Builder). Differentiation must come from measured quality and honesty.

## Decision

MVP = **GP-180 only**, modes **A (song)**, **B (user-uploaded excerpt)** and **D-lite (recording →
match suggestions)**. **No URL ingestion.** Delivery = downloadable `.prst` + dial-in sheet.
The first milestone is a CLI "First Loop"; the web app follows only after the go/no-go gate.

## Alternatives considered

- A only (cheapest): indistinguishable from competitors.
- A + B + C (URL): legal/ToS exposure (YouTube, Spotify) and SSRF surface for little extra value.
- Multi-device from day one: multiplies catalog/codec work before the core is proven.

## Consequences

- Match mode reuses the evaluation comparison code → little extra cost, big quality lever.
- Users must provide audio themselves → friction, but legally conservative.

## Revisit when

First Loop results are in, or a licensed audio source becomes available.

## Amendment (2026-09-29)

The **Match (recording → suggestions) user interface moves from P0 to P1.** P0 only has to prove
"reference → understandable tone profile → usable GP-180 preset". The comparison module is still
built in the backend during P2/P4 because the evaluation and device characterization need it, so the
P1 UI is cheap to add. See [MVP master plan](../product/mvp-master-plan.md).


# ADR-003 — Three-layer tone representation

- Status: accepted
- Date: 2026-09-29

## Context

The brief proposes a device-independent model with normalized knob values. Knob positions do not
transfer across models or devices, and such a model mixes facts, intent and settings.

## Decision

Use three layers: **ToneEvidence** (facts + measurements with provenance) → **ToneIntent**
(device-independent roles, controlled-vocabulary archetypes, perceptual and optional measured
targets, confidence) → **DevicePatch** (device-native models and values). LLMs may write evidence
(with sources) and intent (schema-constrained); only the deterministic mapper writes DevicePatch.
Details: [tone-representation.md](../architecture/tone-representation.md).

## Alternatives considered

Universal knob JSON; equipment graph only; learned embedding as the core; signal-chain DSL.
Embeddings are kept as metrics, not as the interface.

## Consequences

- New device = new mapper + codec; layers 1–2 unchanged.
- Requires curating an archetype vocabulary and per-device semantics (human work, but valuable IP).

## Revisit when

A learned mapper (approach D in [feasibility](../research/feasibility.md)) outperforms the symbolic
intent on the eval suite.

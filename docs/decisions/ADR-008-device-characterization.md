# ADR-008 — Device characterization by hardware-in-the-loop measurement

- Status: accepted
- Date: 2026-09-29

## Context

The GP-180 DSP is proprietary and cannot be simulated. LLM-chosen knob values are not
device-aware. We own a physical GP-180; official MIDI Program Change is documented; the device is a
USB audio interface.

## Decision

Measure the device: render a fixed DI corpus through generated sweep banks of presets (bulk import
+ MIDI PC stepping + re-amp + capture), store per-model response surfaces, and have the mapper solve
parameters against them. The same rig runs known-answer tests and hardware regression tests.
Details: [device-engine.md §4](../devices/valeton-gp180/device-engine.md#4-device-characterization-hardware-in-the-loop).

## Consequences

- Real, defensible data about the target device — something LLM-only competitors lack.
- Needs rig time and careful level calibration; one manual import step per bank.
- Data is versioned by firmware and catalog.

## Revisit when

SysEx live-parameter writes are proven (removes the import step and allows continuous
optimization on the device).

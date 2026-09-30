# ADR-002 — GP-180 preset delivery via `.prst` import in Valeton Suite

- Status: accepted (pending hardware PoC, roadmap P1)
- Date: 2026-09-29

## Context

Presets can reach the device via (a) `.prst` import through the official Valeton Suite,
(b) reverse-engineered USB SysEx, (c) reverse-engineered BLE. Community research decoded the
`.prst` format (fixed 1128 bytes, no checksum; hardware-confirmed on the sibling GP-150). SysEx
file-transfer integrity fields are unresolved, and the reverse-engineering author deliberately
implemented no writer.

## Decision

Generate `.prst` files server-side; the user imports them with the official Suite. Always also
provide a dial-in sheet. No SysEx/BLE writes and no firmware interaction in the MVP. Generation is
template-based and restricted to observed engine-tag/chain combinations until verified.

## Alternatives considered

- Direct SysEx push (best UX): unproven write path, risk of corrupting device state.
- Settings-only output (safest): loses the core convenience.

## Consequences

- One manual step (import) per preset; acceptable for the MVP.
- The same files power the hardware test bench (bulk import of sweep banks).
- Fallback if P1 fails: dial-in sheet only; the rest of the architecture is unchanged.

## Revisit when

The SysEx write path is proven on hardware (enables a Web MIDI "send to device" feature).

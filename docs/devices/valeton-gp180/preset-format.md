# Valeton GP-180 `.prst` — Working Format Specification

Status: **working draft**, derived from public community research on the sibling GP-150 and verified
by us against 200 GP-180 files (see [research](../../research/gp180-ecosystem.md#6-corpus-analysis-ours)).
Nothing here is confirmed on *our* GP-180 yet. Each field is tagged with the evidence levels defined
in the research document. This document is written from observed facts; no third-party code is
reused (see [ADR-009](../../decisions/ADR-009-clean-room-and-fixtures.md)).

Conventions: offsets in hex, integers little-endian, floats IEEE-754 binary32 little-endian.

## 1. Layout

| Offset | Size | Region |
|---|---|---|
| `0x000` | 4 | Magic `11 30 64 04` |
| `0x004` | 0x80 | Header |
| `0x084` | 0x330 | 12 module blocks × 0x44 bytes |
| `0x3B4` | 0xB4 | Footer (controller assignments) |
| **Total** | **0x468 = 1128** | |

No checksum or signature is known. [RE][COMMUNITY-VERIFIED on GP-150]

## 2. Header

| Offset | Size | Field | Notes | Evidence |
|---|---|---|---|---|
| `0x00` | 4 | Magic | `11 30 64 04` | [OURS] 200/200 |
| `0x04` | 1 | Preset index | 0-based (0–199). The Suite chooses the destination slot on import; the value is probably overwritten. | [RE][OURS] |
| `0x05` | 3 | Reserved | zero | [OURS] |
| `0x08` | 4 | Constant | `10 30 58 04` | [OURS] |
| `0x0C` | 2 | Constant | `00 15` | [OURS] |
| `0x0E` | 2 | **Unknown** | Never zero in dumps, 103 distinct values in 200 files. Not a known CRC/sum. GP-150 accepts `0000`. | **[UNKNOWN] U2** |
| `0x10` | 0x14 | Constants | Invariant in all dumps; copy verbatim | [OURS] |
| `0x24` | 1 | BPM | uint8 (UI range 40–300; values > 255 unexplained) | [RE] |
| `0x25` | 1 | Reserved | zero | [OURS] |
| `0x26` | 1 | Patch volume | 0–100 | [RE] |
| `0x27` | 5 | Reserved | zero | [OURS] |
| `0x2C` | 0x44 | Name | ASCII, NUL-terminated and NUL-padded. UI shows ~12–13 chars. | [RE][OURS] |
| `0x74` | 4 | Constant | `30 30 3C 03` | [RE] |
| `0x78` | 12 | Chain order | 12 × uint8 slot indices (table below) | [RE] — **semantics [UNKNOWN] U3** |

### Slot indices

| Index | Slot | Role |
|---|---|---|
| 0 | NR | Noise gate |
| 1 | PRE | Compressor / boost / pre-effects (also hosts some ODs, pitch, filters) |
| 2 | WAH | Wah |
| 3 | DST | Overdrive / distortion / fuzz |
| 4 | N→S | SnapTone (converted NAM) slot |
| 5 | AMP | Amplifier model |
| 6 | CAB | Cabinet / IR |
| 7 | EQ | Equalizer |
| 8 | MOD | Modulation |
| 9 | DLY | Delay |
| 10 | RVB | Reverb |
| 11 | VOL | Volume |

**Open question U3:** every dump stores AMP (index 5) at chain position 0, including presets whose
amp is audibly after the drives. Either the stored order is not the audio order, or AMP-first is a
storage convention with a separate positional rule. Until resolved, the generator only emits
chain orders observed in real exports.

## 3. Module block (68 bytes)

Block *i* starts at `0x84 + i × 0x44` and belongs to slot `chain_order[i]`.

| Rel. offset | Size | Field | Notes | Evidence |
|---|---|---|---|---|
| `+0x00` | 1 | Enabled | `01` on, `00` bypassed | [RE][OURS] |
| `+0x01` | 3 | Reserved | zero | [RE] |
| `+0x04` | 1 | Effect type | Code within the slot's namespace. **Same code ≠ same effect across slots.** | [RE][OURS] |
| `+0x05` | 1 | Sub-type | Mostly 0; CAB uses it (mic/mode) | [RE] |
| `+0x06` | 1 | Extension flag | `01` only for pickup-simulator types (2/2400 blocks) | [RE][OURS] |
| `+0x07` | 1 | DSP engine tag | Selects DSP engine; depends on slot, type, position and some parameter values; disabled → usually `0x06` | [RE] — **GP-180 rules [UNKNOWN] U4** |
| `+0x08` | 60 | Parameters | 15 × float32, engineering units; unused slots `0.0` | [RE][OURS] |

Parameter units observed: 0–100 knobs; dB (EQ, signed); Hz (rates, cut filters, e.g. CAB high-cut
`11586.0`, `20001.0` = off); ms (delay time, pre-delay); enums/booleans stored as float
(`0.0`, `1.0`, …). Rate parameters are **mode dependent**: with tempo sync on, the same float is a
note subdivision, not Hz. [RE]

## 4. Footer

180 bytes of controller-assignment records (EXP pedal, CTRL knobs), with `100.0f` defaults and
`FF FF` "unassigned" sentinels. 150/180 bytes invariant across dumps. For generated presets we copy
the footer of a known-good "no assignments" preset. [COMMUNITY-VERIFIED on GP-150][OURS]

## 5. Generation rules (what our serializer must guarantee)

1. Start from a **known-good template** (a preset exported from our own device), never from zeros.
2. Only emit `(slot, effect type)` pairs present in the device catalog for the pinned firmware.
3. Only emit `(slot, type, chain position) → engine tag` combinations observed in real exports
   until the full rule set is verified (U4).
4. Every parameter is clamped to catalog range and quantized to catalog step; enums use catalog values.
5. Unused parameter slots are `0.0`.
6. Name: printable ASCII, ≤ 12 characters recommended, NUL-padded.
7. `0x0E–0x0F`: copy template value (safe default) until U2 is answered.
8. Byte-exact round trip: `serialize(parse(x)) == x` for every file we have.

## 6. Verification ladder

| Level | Test | Automated? |
|---|---|---|
| L0 | Round-trip parse/serialize on all fixtures | Yes (CI) |
| L1 | Structural validation against catalog + rules above | Yes (CI) |
| L2 | Import into Suite without error; values shown in Suite match JSON | Manual (checklist) |
| L3 | Values on device screen match; audio passes | Manual |
| L4 | Re-amped audio matches expected features (known-answer tests) | Semi-automated (hardware rig) |

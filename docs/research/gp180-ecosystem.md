# Valeton GP-180 — Ecosystem & Feasibility Research

Research date: 2026-09-29. Scope: everything toneprofile needs to know to generate a
preset that a physical GP-180 accepts and plays.

## Evidence levels

Every fact in this document carries one of these tags:

| Tag | Meaning |
|---|---|
| **[OFFICIAL]** | Stated by Valeton (product page, manual, official software). |
| **[COMMUNITY-VERIFIED]** | Reported by a third party *and* confirmed on hardware by that party. |
| **[RE]** | Reverse engineered by a third party (captures, firmware/Suite analysis). Not yet confirmed by us. |
| **[OURS]** | Measured by us on real data during this research (see "Corpus analysis" below). |
| **[SPECULATIVE]** | Plausible inference, not evidenced. |
| **[UNKNOWN]** | Open question. Must be resolved on our own device before we depend on it. |

## 1. The device

| Property | Value | Evidence |
|---|---|---|
| Sample rate / depth | 48 kHz / 24-bit | [OFFICIAL] |
| Effects library | "200+ effects", "HD Modeling Tech II" | [OFFICIAL] |
| Simultaneous modules | 12, freely reorderable | [OFFICIAL] |
| Module slots | NR, PRE, WAH, DST, N→S (SnapTone), AMP, CAB, EQ, MOD, DLY, RVB, VOL — one effect per slot | [RE] + [OURS] |
| Patch slots | 200 (100 factory + 100 user) | [OFFICIAL] |
| SnapTone / NAM | Loads converted NAM files; 50 factory SnapTones, 100 slots total | [OFFICIAL] |
| NAM A2 | "Converted versions of NAM A2" loadable from Suite v2.1.0 / FW 1.1.1 | [OFFICIAL] (App Store changelog) |
| User IRs | 20 slots, 1024 or 2048 samples | [OFFICIAL] |
| USB | Class-compliant audio interface, 6-in / 4-out; USB MIDI | [OFFICIAL] |
| MIDI | USB, Bluetooth, 3.5 mm TRS; CC/PC map published | [OFFICIAL] |
| Bluetooth | 5.0 dual-mode (BLE editor + audio) | [OFFICIAL] |
| Firmware | V1.0.0, V1.1.1 (latest at research date) | [OFFICIAL] |
| Editor | Valeton Suite (Windows, macOS, iOS, Android) — a Flutter app | [OFFICIAL] + [RE] |
| Siblings | GP-150 shares the preset format and the Suite data provider ("Device150") | [RE] + [OURS] |
| Not compatible | GP-200 family presets are **not** compatible with GP-50/150/180 | [OFFICIAL] (Valeton statement quoted on The Gear Forum) |

## 2. How presets get onto the device

There are three transport paths. Only one is safe to depend on for the MVP.

| Path | Status | Use in toneprofile |
|---|---|---|
| **`.prst` file → Valeton Suite "Import" → device slot** | [OFFICIAL] workflow (Suite patch import/export; commercial preset sellers already distribute GP-150/180 `.prst` files) | **MVP delivery path.** We generate the file; the user imports it with the official editor. |
| USB SysEx (live edit, bulk transfer) | [RE] — framing, nibble codec, CRC-8 (poly 0x07), message families, live-parameter float layout decoded; **write-side integrity for file transfers (family 0x24/0x70) unresolved**; the RE author deliberately implemented no write sender | Not in MVP. Candidate for a later "send to device" feature once proven. |
| Bluetooth LE (mobile Suite) | [RE] by at least one commercial app (GP Tone Builder sends patches over BLE) — no public spec | Not in MVP. |
| MIDI CC / PC (official map) | [OFFICIAL] — patch select (CC0 + PC), module toggles CC48–59, tuner CC60, CTRL A/B/C CC69–71, tempo CC73/74, drums CC92–96 | Used by our **measurement rig** to step through presets automatically. Not sufficient to *write* parameters. |

**Conclusion:** programmatic generation of GP-180 presets is technically feasible *today* via the
file path, with the remaining risk concentrated in a handful of unknown fields (§4) that can be
resolved in days on the physical device.

## 3. The `.prst` format (summary)

Full specification lives in [devices/valeton-gp180/preset-format.md](../devices/valeton-gp180/preset-format.md).

- Fixed size **1128 bytes**, little-endian, magic `11 30 64 04`. [RE] (GP-150 spec) + [OURS] (all 200 GP-180 dumps).
- **No checksum.** A GP-150 preset with the only suspicious field zeroed imported and played. [COMMUNITY-VERIFIED] on GP-150; [UNKNOWN] on GP-180.
- Header: preset index, BPM (uint8), patch volume, ASCII name, 12-byte chain order. [RE] + [OURS]
- 12 module blocks × 68 bytes: enabled flag, effect type code, sub-type, extension flag, DSP-engine tag, then **15 float32 parameters in engineering units** (0–100 knobs, dB, Hz, ms). [RE] + [OURS]
- 180-byte footer with EXP/CTRL assignments; copying a canonical footer is sufficient for "no assignments". [COMMUNITY-VERIFIED] on GP-150.

## 4. What is still unknown (must be resolved in Phase 1)

| # | Unknown | Why it matters | How we resolve it |
|---|---|---|---|
| U1 | Does the GP-180 Suite accept a byte-modified / hand-authored `.prst`? | The whole delivery path. | PoC-1: export own preset → change one float → import → read value on device. |
| U2 | Header field `0x0E–0x0F` (unique per preset; not a CRC-16/8/32, sum, Fletcher, Adler, FNV…) | If validated by GP-180 firmware, generated files would be rejected. | Import with original value, with `0000`, and with a random value. |
| U3 | `chain_order` semantics: AMP is at position 0 in **all 200** GP-180 dumps [OURS], yet the device UI allows moving AMP (a USB capture is titled "move AMP from position 6 to 5"). Stored order ≠ displayed order? | Wrong signal-chain order changes the sound (e.g. drive before/after amp). | Reorder on device → export → diff. |
| U4 | DSP-engine tag (`block[+7]`) rules for GP-180. GP-150 rules are documented, but GP-180 files contain tags not in that table (e.g. `0x0f` for a WAH type). A wrong tag reportedly yields **no audio**. | Silent failure mode. | "Template-by-example": only emit `(slot, type, position)` combinations whose engine tag we have observed in a factory/exported preset; build the rule table from the corpus and verify each on device. |
| U5 | Parameter order inside a block vs. Suite metadata `algId` order | Mis-assigned knobs. | Suite metadata + controlled exports (set knob N to a sentinel value, export, locate). |
| U6 | SnapTone (N→S) block: which parameter selects the SnapTone slot, and which factory SnapTone is which amp | The N→S block is enabled in 84 of 200 dumped presets while the AMP block is enabled in only 48 [OURS]. Ignoring SnapTones throws away many of the device's go-to "amps". | Controlled exports + Suite SnapTone list. |
| U7 | USB re-amp: can host playback be routed into the DSP input? (6-in/4-out suggests yes) | Enables automated hardware-in-the-loop measurement without extra hardware. | Check USB settings on device; fallback = analog loop via any audio interface. |
| U8 | Catalog differences between firmware V1.0.0 and V1.1.1 | Catalog versioning. | Record firmware version with every capture; diff Suite metadata across versions. |
| U9 | User-IR and NAM slot references inside presets | Out of MVP scope, but affects forward compatibility. | Deferred. |

## 5. The device catalog (effects, parameters, ranges)

- Valeton Suite ships machine-readable metadata (`module_data.json`, `module150_data.json`) with
  module IDs, packed effect IDs (`fxid`), parameter IDs, ranges, steps, defaults, enum labels and
  unit conversions. [RE] (`module150_data.json`: 348 variants / 1,701 parameters).
- A community-generated GP-180 effect/parameter matrix exists (2,237 lines) in the GPL-3.0
  reverse-engineering repository. [RE]
- **Policy:** we do not copy that matrix or redistribute Valeton's JSON. We ship a *local extraction
  tool* that reads the metadata from the user's own Suite installation and generates our catalog
  (facts: names, ranges, units), plus a hand-curated semantic layer (what each model is based on,
  its tonal archetype). See [ADR-009](../decisions/ADR-009-clean-room-and-fixtures.md) and
  [legal considerations](../product/legal-considerations.md).

## 6. Corpus analysis (ours)

Input: 200 GP-180 `.prst` dumps (factory 001–100 + slots 101–200) published in the GPL-3.0
repository below; analysed locally, **not committed** to this repository.

| Finding | Value |
|---|---|
| File size | 200/200 are 1128 bytes |
| Magic / constant at `0x08` | 200/200 `11306404` / `10305804` |
| Header invariant bytes | `0x00–0x03`, `0x05–0x0D`, `0x10–0x23`, `0x25`, `0x27–0x2B`, name tail, `0x83` |
| Footer | 150 of 180 bytes invariant |
| BPM / patch volume | 199× 120 BPM; 196× volume 50 |
| `0x0E–0x0F` | never zero; 103 distinct values |
| Chain orders | 7 distinct; 193/200 use the default; **AMP at position 0 in 200/200** |
| Enabled effect types per slot | NR 3, PRE 14, WAH 4, DST 35, N→S 7, AMP 13, CAB 18, EQ 5, MOD 9, DLY 7, RVB 10, VOL 1 |
| AMP vs. N→S enabled | AMP 48/200, N→S (SnapTone) 84/200 — SnapTones carry the amp role more often than AMP models |
| Disabled blocks | engine tag `0x06` in 1604/1673 cases (matches GP-150 rule "disabled → 0x06", with exceptions) |

Implication for the product: the factory presets themselves are a **labelled dataset** (names like
"Sabbath Riff", "Back in DC", "Mayers OD") showing how Valeton maps famous tones onto this device.
They are a baseline to beat, not a source to copy.

## 7. Existing open-source & community work

| Project | Device | What it offers | License |
|---|---|---|---|
| [majabojarska/Valeton-GP180-Rev-Eng](https://github.com/majabojarska/Valeton-GP180-Rev-Eng) | **GP-180** | USB captures (pcapng), SysEx corpus, Suite/firmware static analysis, factory `.prst` dump, NAM→NAMB conversion notes. WIP (last commit 2026-09-02). | GPL-3.0 |
| [GP-150 `.prst` format spec (gist)](https://gist.github.com/AlbertoBarba/ec59feecba60ca956eeb6970f0ac0055) | GP-150 | Complete byte-level format spec with hardware confirmations; effect-code appendix | Unstated |
| [drewmerc302/valeton-gp50](https://github.com/drewmerc302/valeton-gp50) | GP-50/GP-5 | Web MIDI editor, RE SysEx protocol, 552-byte preset format | see repo |
| [kabir0st/gp200-studio](https://github.com/kabir0st/gp200-studio) | GP-200 | Browser editor via Web MIDI; Ghidra RE of Suite | GPL-3.0 |
| [mikeliddle/PRSTDecoder](https://github.com/mikeliddle/PRSTDecoder) | GP-200 | `.prst` ↔ JSON encoder/decoder | MIT |
| [kolelan/gp-180](https://github.com/kolelan/gp-180) | GP-180 | Russian user guide, per-module docs | see repo |
| [Factory preset list (gist)](https://gist.github.com/NotoriousREV/1ae207ff70f1ab4d573432a8dab9e904) | GP-180 | Names of the 100 factory presets | — |

## 8. Feasibility verdict

| Question | Answer |
|---|---|
| Can we generate real GP-180 presets programmatically? | **Very likely yes**, via `.prst` + official Suite import. Format is fixed-size, checksum-free and fully mapped on the sibling GP-150 with hardware confirmation. Residual risk: U1–U5. |
| Can we push presets directly to the device? | Not safely yet (write-side transfer integrity unresolved). Deferred. |
| Can we automate hardware testing? | Yes, with official MIDI PC for preset stepping + USB/analog re-amping (U7). The only manual step is a bulk import in Suite. |
| Fallback if U1/U2 fail? | "Dial-in sheet" UX: generated settings + step-by-step instructions (and still use the device characterization pipeline). The product loses convenience, not its core. |

## Sources

- Valeton GP-180 product page — https://www.valeton.net/product/gp-180/
- Valeton Suite (App Store) — https://apps.apple.com/us/app/valeton-suite/id6739420888
- The Gear Forum, "Valeton GP-50, GP-150 and GP-180" — https://thegearforum.com/threads/valeton-gp-50-gp-150-and-gp-180.10093/
- Effects Database GP-180 — https://www.effectsdatabase.com/model/valeton/gp180
- Repositories and gists listed in §7.

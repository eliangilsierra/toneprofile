# Device Engine — GP-180 Capability Model and Mapper

The device engine is the deterministic part of toneprofile that knows everything device-specific:
what the GP-180 can do, how to encode it, how to validate it, and how a device-independent
tone intent is turned into concrete GP-180 settings. **No LLM runs inside the device engine.**

## 1. Responsibilities

| Component | Responsibility | Deterministic? |
|---|---|---|
| `Catalog` | Slots, effect models, parameters (id, name, unit, range, step, default, enum labels), firmware version | Yes (generated + curated data) |
| `Semantics` | Human-curated metadata per model: what it is based on, archetype tags, gain class, typical use | Yes (curated) |
| `Characterization` | Measured response of models on the real device (see §4) | Yes (measured data) |
| `Constraints` | One effect per slot, 12 slots, allowed chain orders, engine-tag rules, value ranges | Yes |
| `Codec` | `.prst` bytes ⇄ `DevicePatch` | Yes |
| `Validator` | Rejects any patch that violates catalog or constraints; emits reasons | Yes |
| `Mapper` | `ToneIntent` + guitar profile → `DevicePatch` (model selection + parameter solving) | Yes (search/optimization, seeded) |
| `Instructions` | Human-readable dial-in sheet for any `DevicePatch` | Yes |

## 2. Capability model (data shape)

A device is described by data, not by code branches, so a second device later is "new data + new
codec", not a rewrite.

```yaml
device: valeton_gp180
firmware: "1.1.1"
catalog_version: "gp180-fw1.1.1-suite2.1.0-r1"
slots:
  - id: AMP
    index: 5
    max_instances: 1
    models:
      - key: amp.uk800            # stable toneprofile key
        vendor_name: "UK 800"     # label shown on the device
        type_code: 53             # block[+4]
        based_on: "Marshall JCM800 2203"   # curated, with evidence level
        archetypes: [british_high_gain_plexi_lineage]
        gain_class: high
        params:
          - {key: gain,     index: 0, unit: knob, min: 0, max: 100, step: 1, default: 50}
          - {key: volume,   index: 1, unit: knob, min: 0, max: 100, step: 1, default: 50}
          - {key: bass,     index: 2, unit: knob, min: 0, max: 100, step: 1, default: 50}
          - {key: middle,   index: 3, unit: knob, min: 0, max: 100, step: 1, default: 50}
          - {key: treble,   index: 4, unit: knob, min: 0, max: 100, step: 1, default: 50}
          - {key: presence, index: 5, unit: knob, min: 0, max: 100, step: 1, default: 50}
constraints:
  chain_orders: observed_only      # until U3 resolved
  engine_tags: observed_only       # until U4 resolved
```

The illustrative values above (type code, parameter order) come from the GP-150 community spec and
must be re-derived for the GP-180 catalog (unknowns U4/U5).

## 3. DevicePatch (typed, device-specific)

```json
{
  "device": "valeton_gp180",
  "catalog_version": "gp180-fw1.1.1-suite2.1.0-r1",
  "name": "Everlong-ish",
  "bpm": 120,
  "patch_volume": 50,
  "chain": ["NR","PRE","WAH","DST","N>S","AMP","CAB","EQ","MOD","DLY","RVB","VOL"],
  "blocks": {
    "AMP": {"enabled": true, "model": "amp.uk800",
            "params": {"gain": 62, "bass": 45, "middle": 60, "treble": 58, "presence": 55, "volume": 50}},
    "CAB": {"enabled": true, "model": "cab.uk_4x12_v30", "params": {"...": 0}}
  }
}
```

`DevicePatch` uses device-native units and model keys. The codec resolves keys to type codes,
engine tags and float slots.

## 4. Device characterization (hardware-in-the-loop)

The GP-180 DSP is proprietary and cannot be simulated. We therefore **measure** it:

1. Record a fixed **DI corpus** (5–8 short phrases: single notes, open chords, palm mutes, pick
   attack variations) from the test guitars, as dry DI files.
2. Generate a **sweep bank** of up to 100 presets (user slots 101–200) for one model:
   e.g. gain ∈ {0,20,…,100} × treble ∈ {20,50,80}, all other blocks bypassed, CAB fixed.
3. Bulk-import the bank via Suite (the one manual step).
4. The rig script steps through slots with official MIDI Program Change, re-amps the DI corpus
   (USB playback if the device supports it — unknown U7 — else an analog loop through any audio
   interface) and records the output.
5. Extract features (see [audio architecture](../../audio/audio-architecture.md)) and store
   `(model, params) → features`.

Outcome: a per-model **response surface** — how gain, EQ and presence move the long-term spectrum,
saturation and dynamics *on this device*. The mapper uses it to solve for knob values instead of
guessing. At ~20 core models × ~60 settings × ~40 s of audio, one full sweep is ~13 hours of
unattended rig time, split into banks.

Characterization is internal R&D data (never shown to users as-is) and is versioned by firmware.

## 5. Mapper

```text
ToneIntent (archetypes + perceptual targets + optional measured target features)
  │
  ├─ 1. Candidate models per role: archetype match (curated) ∩ gain class ∩ catalog
  ├─ 2. Slot assignment: roles → GP-180 slots (e.g. two drives → PRE + DST; comp → PRE)
  ├─ 3. Parameter solving per candidate:
  │      - with characterization: minimise feature distance to target (CMA-ES / grid refine)
  │      - without: curated starting points + perceptual offsets (rules table)
  ├─ 4. Guitar compensation: pickup type/position offsets (gain, brightness); optional
  │      PRE "S to H"/"H to S" pickup simulator when the intent requires it
  ├─ 5. Rank candidates, keep top-k (alternatives shown to the user)
  └─ 6. Validator → DevicePatch
```

Hard rules the mapper never breaks: catalog ranges, one effect per slot, observed chain orders
and engine tags, sensible output level (patch volume normalization target).

## 6. Why not let the LLM pick knob values directly?

- Knob positions are not transferable across models (gain 6 on a Twin ≠ gain 6 on a JCM800) and the
  LLM has no knowledge of *this* device's response curves.
- LLM output is non-deterministic and unverifiable; the mapper's output is reproducible and testable.
- The LLM's value is upstream: interpreting research and intent. See
  [AI architecture](../../ai/ai-architecture.md).

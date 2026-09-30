# Tone Representation

Decision record: [ADR-003](../decisions/ADR-003-tone-representation.md).

> **Naming.** In the product and the API, the user-facing **Tone Profile** is Layer 1 + Layer 2
> (ToneEvidence + ToneIntent): everything we know and intend, independent of any device
> (`GET /v1/tone-profiles/{id}`). Layer 3 is the **preset version** for a specific device
> (`GET /v1/presets/{id}/versions/{n}`). The brief's "Universal Tone Profile" maps to this split:
> tonal balance → measured spectrum + brightness/low-end/mid targets; gain structure → saturation +
> gain class; dynamics/compression → compression target; amp/cab characteristics → archetypes;
> modulation/delay/reverb/spatial → ambience facts + archetypes; signal chain → intent chain;
> confidence → per claim, per block, per target and overall.

## 1. The problem with a "universal knob" model

The brief's initial idea was a device-independent JSON with normalized knob values
(`amp.gain: 0.68, mid: 0.71 …`). We reject that as the *central* abstraction because:

- Knob positions do not transfer between amp models or devices (gain 0.68 is clean on one model and
  saturated on another; "mid" is a different filter per model).
- It hides *why* a value was chosen and *how sure* we are.
- It mixes three different kinds of information: facts about the reference, the tonal intent, and
  device settings.

Alternatives considered: semantic tone graph, DSP parameter graph, equipment graph, signal-chain DSL,
tone embedding, hybrid. We adopt a **three-layer hybrid** in which each layer has one job and one
owner.

## 2. The three layers

```text
 Layer 1  ToneEvidence    "what we know about the reference"      facts + measurements, with provenance
     │                    (research claims, audio descriptors)
     ▼
 Layer 2  ToneIntent      "what we are trying to achieve"         device-independent, symbolic + perceptual
     │                    (signal-chain roles, archetypes,
     │                     perceptual targets, measured targets)
     ▼
 Layer 3  DevicePatch     "how this device does it"               device-specific, native units
                          (GP-180 models + parameter values)
```

| Layer | Produced by | Device-independent? | Stored |
|---|---|---|---|
| ToneEvidence | Research pipeline (LLM + sources), audio analyzer (DSP) | Yes | Per song (research, shared) and per upload (analysis) |
| ToneIntent | LLM drafts from evidence under schema; user can edit | Yes | Per generation, versioned |
| DevicePatch | Device mapper (deterministic) | No | Per preset version, immutable |

Multi-device support later = new Layer 3 mapper per device. Layers 1–2 are reused unchanged.

## 3. ToneEvidence (sketch)

```json
{
  "song": {"title": "Everlong", "artist": "Foo Fighters", "mbid": "…"},
  "section": "main riff",
  "claims": [
    {
      "subject": {"role": "amp", "item": "<model name as stated by source>"},
      "statement": "used on the recording",
      "evidence_level": "reported",
      "confidence": 0.55,
      "sources": [{"url": "…", "publisher": "…", "quote_hash": "…", "retrieved_at": "…"}]
    }
  ],
  "audio": {
    "analyzer_version": "0.3.0",
    "excerpt": {"start_s": 12.0, "end_s": 42.0, "guitar_dominance": 0.71},
    "ltas_db_third_octave": [/* 100 Hz … 10 kHz */],
    "gain_class": {"value": "high_gain", "p": 0.78},
    "delay": {"detected": false},
    "modulation": {"detected": false},
    "reverb": {"amount": "low", "p": 0.6}
  }
}
```

Evidence levels (UI vocabulary): `confirmed` (artist/official/rig-rundown for that recording),
`reported` (credible press, not specific to the recording), `likely` (multiple consistent
secondary sources or strong audio evidence), `inferred` (reasoning from style/era/audio),
`unknown`. Levels are assigned by **rules** over source type and agreement, not by the LLM's
self-reported certainty.

## 4. ToneIntent (the central abstraction)

```json
{
  "intent_version": 1,
  "summary": "Tight, bright high-gain rhythm with a mid push; dry.",
  "chain": [
    {"role": "gate",   "enabled": true,  "strength": "medium"},
    {"role": "drive",  "archetype": "ts_style_boost", "purpose": "tighten",
     "targets": {"gain": "low", "level": "high"}, "confidence": 0.5},
    {"role": "amp",    "archetype": "british_high_gain", "confidence": 0.6,
     "alternatives": ["american_high_gain_modern"],
     "targets": {"saturation": 0.75, "bass": "medium", "mid_emphasis": "high",
                 "brightness": "medium_high", "tightness": "high"}},
    {"role": "cab",    "archetype": "closed_back_4x12", "mic_character": "bright_close"},
    {"role": "reverb", "enabled": true, "archetype": "room", "amount": 0.1}
  ],
  "measured_targets": {"ltas_db_third_octave": [/* optional, from ToneEvidence */]},
  "player_context": {"guitar": "strat_like", "pickup": "bridge_single_coil",
                     "tuning": "standard"},
  "rationale_refs": ["claim:3", "audio:gain_class"]
}
```

Properties:
- **Symbolic** parts (roles, archetypes) come from a controlled vocabulary maintained by us — the
  LLM cannot invent new archetypes.
- **Perceptual** targets are ordinal or 0–1 values with clear meanings (saturation, brightness,
  mid emphasis, tightness, ambience), not knob positions.
- **Measured** targets (optional) are actual spectra the mapper can optimize against.
- Every element can carry confidence and references to evidence.
- Users edit *intent* ("more mids", "swap to a Vox-style amp") and the mapper re-solves; power
  users can also edit the DevicePatch directly.

## 5. DevicePatch

Device-native, see [device engine](../devices/valeton-gp180/device-engine.md#3-devicepatch-typed-device-specific).

## 6. Why not a learned tone embedding as the core?

Embeddings (CLAP, MERT, AFx-Rep) are useful as **similarity metrics** inside the mapper and the
evaluation, but they are not editable, not explainable, and not portable between devices on their
own. They live inside Layer 1 (measurements) and the mapper's objective, not as the interface.

## 7. Archetype vocabulary (initial, to be curated)

- Amp: `fender_tweed`, `fender_blackface_clean`, `vox_ac_topboost`, `british_plexi`,
  `british_high_gain`, `american_high_gain_modern`, `dumble_style`, `boutique_edge`,
  `jazz_solid_state_clean`, `acoustic_sim`.
- Drive: `ts_style_boost`, `klon_style`, `rat_style_distortion`, `muff_style_fuzz`,
  `fuzz_face_style`, `octave_fuzz`, `clean_boost`, `compressor`.
- Cab: `open_back_1x12`, `open_back_2x12`, `closed_back_4x12`, `alnico_blue_style`, `acoustic_body`.
- Ambience/mod: `room`, `plate`, `spring`, `hall`, `shimmer`, `digital_delay`, `analog_delay`,
  `tape_delay`, `dotted_eighth_delay`, `chorus`, `phaser`, `flanger`, `uni_vibe`, `tremolo`, `rotary`.

Each GP-180 model is tagged with archetypes in the curated device semantics layer.

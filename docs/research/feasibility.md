# Technical Feasibility — Can a musical reference become a useful GP-180 preset?

Short answer: **yes for a "useful starting point", no for "the exact studio tone"**, and the gap
between the two is exactly where the product must be honest.

## 1. Why the problem is hard

A guitar sound on a record is the product of a long, mostly invisible chain:

```text
player hands → guitar/pickups/strings → pedals → amp (volume, EQ, power-amp sag) → speaker/cab
→ microphone(s) + placement → preamp → studio EQ/compression → double tracking, panning
→ mix bus processing → mastering → lossy encoding
```

Only the end result is observable, blended with other instruments. Many different chains produce
similar spectra (the inverse problem is ill-posed), and the target device (GP-180) can only realise
a subset of chains. So the goal is not "recover the original rig" but **"find the GP-180 settings
that a guitarist agrees get them close, fast"**.

## 2. What can be analysed, and how reliably

| Aspect | Reliability from a full mix | From an isolated/solo guitar excerpt | Technique |
|---|---|---|---|
| Tempo, key, sections | High | High | DSP/MIR (beat tracking, chroma) |
| Long-term spectral balance (bass/mid/treble tilt, mid hump, high-cut) | Medium (other instruments leak, mastering EQ) | High | LTAS on guitar-dominant frames, 1/3-octave or ERB bands |
| Gain / saturation class (clean / crunch / high gain / fuzz) | Medium | High | Spectral flatness, harmonic density, envelope compression, learned classifier |
| Exact gain knob value | Low | Low–medium | Only relative, and only *per device model* (needs characterization) |
| Amp family (Fender/Vox/Marshall/Mesa…) | Low | Low–medium | Weak acoustic evidence; research is usually stronger |
| Cabinet/mic character | Low | Medium | High-cut/resonance estimation from spectrum |
| Delay (time, feedback, mix) | Medium | High | Onset-envelope autocorrelation; dotted-eighth detection vs. tempo |
| Reverb amount / type | Low–medium (mix reverb is shared) | Medium | Decay estimation (RT60 proxies), DRR |
| Modulation (chorus/phaser/trem rate) | Medium | Medium–high | Modulation spectrum of band envelopes |
| Compression | Low | Medium | Crest factor, envelope statistics |
| Wah/filter movement | Medium | High | Spectral centroid trajectory |
| Pickup type/position of the original | Low | Low | Not attempted; use research + user's own guitar |

## 3. Who does what

| Task | Deterministic code | DSP | ML | LLM | Human curation |
|---|---|---|---|---|---|
| Song identification & canonical IDs | ✓ (MusicBrainz lookup) | | | disambiguation only | |
| Gear research (what did they use?) | source fetching via provider tool | | | ✓ synthesis **with citations** | review of popular songs |
| Evidence grading (confirmed/likely/…) | ✓ rules on source type & agreement | | | proposes, rules decide | |
| Guitar isolation | | | ✓ (separation model) | | |
| Audio descriptors | | ✓ | ✓ (gain class, embeddings) | | |
| Tone intent (roles, archetypes, perceptual targets) | schema + validation | | | ✓ drafts it | ✓ archetype vocabulary |
| Device model selection & knob values | ✓ mapper/optimizer | ✓ features | optional surrogate | **never directly** | ✓ semantics & starting points |
| Validation of patch | ✓ | | | ✗ | |
| Serialization | ✓ | | | ✗ | |
| Explanation to the user | templates for facts | | | ✓ prose from structured facts | |
| Fine-tune by natural language ("less fizzy") | ✓ applies bounded deltas | | | ✓ maps words → deltas via tool | |
| Comparison reference vs. user recording | ✓ | ✓ | optional embedding | ✓ phrasing of suggestions | |

## 4. Reconstruction approaches compared

| Approach | Description | Quality ceiling | Cost | Verifiable? | Verdict |
|---|---|---|---|---|---|
| **A. LLM-only** | Song → LLM → knob values | Low–medium; knob values are guesses, not device-aware; hallucinated gear risk | Lowest | No | Baseline to beat (it is what most competitors ship) |
| **B. Audio analysis + LLM** | Descriptors fed to LLM, LLM picks settings | Medium; LLM still guesses mapping from descriptors to knobs | Low | Partially | Insufficient alone |
| **C. Research + analysis + deterministic tone engine** | LLM only produces evidence & intent; engine maps to device | Medium–high; bounded by curated mapping quality | Low | Yes | **MVP core** |
| **D. ML tone matching** | Train a model reference-audio → device params | Potentially high | High (needs large paired dataset from the device) | Yes | Later; our characterization data is the seed dataset |
| **E. Hybrid: C + device-in-the-loop optimization** | C, plus solving knobs against measured device response and refining with the user's recording | High for spectral/gain aspects | Moderate R&D, low runtime | Yes | **Target architecture** — C first, E incrementally |

Chosen path: **C now, growing into E**. The same comparison code serves three purposes:
evaluation, device characterization and the user-facing "Match my recording" mode.

## 5. Where the LLM must not be trusted

- Numeric parameter values for a specific device.
- Claims about gear without a retrievable source.
- Byte-level anything (formats, ranges).
- Deciding whether its own output is valid.

## 6. Feasibility conclusions

1. **Preset generation:** feasible (see [GP-180 research](gp180-ecosystem.md#8-feasibility-verdict)).
2. **Useful tone from song name only:** feasible as a *research-grounded starting point*; quality
   capped by research availability. Must show uncertainty.
3. **Useful tone from an audio excerpt:** feasible for spectral balance, gain class, delay/modulation;
   weak for exact amp identity.
4. **Closing the loop with the user's recording through the GP-180:** feasible and the strongest
   quality lever, because it removes the "different studio chain" confound: the user records the
   same part through the device, and we compare like with like.
5. **Hard limits to communicate:** player technique, guitar, and studio post-processing cannot be
   put into a preset. The UI says so.

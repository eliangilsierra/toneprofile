# Creative Direction

ToneProfile has to feel like a **music technology instrument**, not an AI demo. The brief's four
starting concepts (audio engineering, digital instrument, audio intelligence, editorial) were
condensed into three genuinely different directions, prototyped mentally against the five core
screens (landing, create, analysis, tone profile, preset), and scored.

## Direction 1 — Signal Lab *(selected)*

**Concept.** The product is a measurement and translation instrument. Everything hangs off one
visible signal path: a reference goes in on the left, a device preset comes out on the right.

| Aspect | Decision |
|---|---|
| Personality | Precise, calm, honest, a little nerdy. Talks like a good studio tech. |
| Colour | Warm graphite surfaces (`#0b0c0d → #212428`), off-white ink, **one** accent — *signal amber* `#ffb23f` — reserved for live signal, primary actions and measured data. A cool *measure* tone only inside charts. Semantic colours always paired with icons/labels. |
| Typography | Instrument Sans (UI), JetBrains Mono (labels, values, units), Instrument Serif borrowed from Direction 2 for editorial headlines on marketing pages only. |
| Layout | Engineering grid, hairline dividers, modules as bordered panels; generous whitespace around dense data. |
| Navigation | Minimal top bar (Library · New tone · locale · demo marker); results use in-page section jumps. |
| Hero | Huge serif statement "From song to tone." above a live **Signal Rail** panel playing a labelled illustration. |
| Create | Three numbered modules (Reference · Guitar · Device) + sticky summary with the single primary action. |
| Analysis | The Signal Rail *is* the progress UI: real steps, real findings, elapsed vs typical time. |
| Tone profile | Fingerprint spectrum with perceptual bands, LED-ladder meters for character, evidence cards with glyphs. |
| Preset | The chain translates from archetypes into device modules; an inspector shows every knob as a readout. |
| Motion | Signal flow (linear), layout morphs (soft spring), short fades. Nothing loops except the live signal. |
| Responsive | Rail turns vertical on phones; chains stack; charts keep aspect ratio with text alternatives. |
| Technical | SVG + CSS; Motion (LazyMotion) for layout morphs; no WebGL. |

## Direction 2 — Liner Notes

**Concept.** ToneProfile as a music magazine's rig rundown. Paper-toned light theme, large serif
display type, photography of gear and players, tone profiles laid out like album liner notes.

- Personality: literate, warm, curatorial.
- Colour: paper `#f4efe6`, ink black, one oxblood accent.
- Typography: high-contrast serif display + humanist sans.
- Analysis: a typeset "story" that fills in paragraph by paragraph.
- Motion: restrained page transitions, text reveals.
- Strengths: memorable brand, great for sharing and SEO.
- Weaknesses: dense numeric data (knobs, spectra) looks out of place; relies on photography we
  don't have rights to (artists, branded gear); light UI is uncomfortable in dim rehearsal rooms.

## Direction 3 — Pedalboard

**Concept.** A tactile digital pedalboard: each block is a skeuomorphic pedal/amp face with knobs you
can turn; colour-coded by effect category.

- Personality: playful, hands-on.
- Colour: dark board with saturated category colours (green drive, blue mod, purple verb…).
- Typography: rounded sans, big numerals.
- Analysis: pedals "light up" as they are researched.
- Strengths: instantly understandable to guitarists; fun.
- Weaknesses: looks like every modeler app (and risks trade-dress confusion with real brands);
  skeuomorphic knobs are hard to make accessible and precise; many colours fight with evidence and
  status semantics; heavy assets.

## Scoring

| Criterion (weight) | Signal Lab | Liner Notes | Pedalboard |
|---|---|---|---|
| Product clarity (3) | 5 | 3 | 4 |
| Brand potential / differentiation (2) | 4 | 5 | 2 |
| Usability with dense technical data (3) | 5 | 2 | 3 |
| Technical feasibility & performance (2) | 5 | 4 | 2 |
| Accessibility (2) | 5 | 4 | 2 |
| Emotional impact (1) | 4 | 5 | 4 |
| **Weighted total (/65)** | **63** | **46** | **38** |

**Selected: Signal Lab**, with Liner Notes' editorial serif for marketing headlines so the brand
has a voice beyond the dashboard.

## Signature interactions

1. **The Signal Rail** — the analysis pipeline drawn as a signal path. Segments light up as real
   steps finish; each station posts the finding the backend reported. On phones it becomes vertical.
2. **The Translation** — the same chain shown as a device-independent tone profile or as the
   device's modules. Toggling (or the automatic first reveal) morphs each archetype card into the
   GP-180 module that realises it ("British high gain → UK 800 · GAIN 68"). It is the product
   thesis — *one tone, rebuilt with the models your device actually has* — made visible.
3. **The Tone Fingerprint** — log-frequency spectrum with five perceptual bands a guitarist can
   reason about (Body, Warmth, Mids, Bite, Air & fizz), each explained in plain language.

## Things we deliberately don't do

Purple/blue AI gradients, glassmorphism, sparkle icons, chat bubbles, fake typing, fake progress
bars, stock photos of guitars, brand logos of gear or artists.

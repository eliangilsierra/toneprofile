# UX Research — Premium Music Software and AI Audio Products

Scope: what makes professional audio software feel trustworthy, and how AI/audio products
communicate processing, uncertainty and results. Sources: public product pages researched for the
[competitive analysis](competitive-analysis.md) plus general familiarity with the products listed.
Items marked *(not re-verified)* describe well-known product UX that was not re-checked in this pass.
We study patterns; we don't copy interfaces.

## 1. Premium music software — patterns worth keeping

| Product family | What makes it feel professional | Lesson for ToneProfile |
|---|---|---|
| FabFilter (Pro-Q) *(not re-verified)* | The spectrum *is* the interface; precise log-frequency axes; restrained colour; values always readable | Fingerprint as a first-class, precise chart; readable values |
| Ableton Live *(not re-verified)* | Dense but calm; flat surfaces; one accent colour for "active"; typography over decoration | Graphite surfaces + single amber accent for live signal |
| Neural DSP plugins *(not re-verified)* | Photographic amp faces create desire, but settings live in clean panels | We can't use gear imagery; convey craft through type, data and motion instead |
| Universal Audio, Arturia *(not re-verified)* | Hardware fidelity: labels match the physical device exactly | Device labels and parameter names are never translated or renamed |
| Line 6 Helix / HX Edit *(not re-verified)* | Signal chain as a horizontal path of blocks; select a block → edit its parameters | Chain translation + block inspector |
| Valeton Suite | Mirrors the device's 12-module chain | Show the GP-180 in its own module order and names |
| Positive Grid (Spark AI, BIAS X) | AI proposes several options; shows a visible signal chain reflecting its reasoning | Alternatives per block; chain shown explicitly |

## 2. AI/audio products — processing, uncertainty, results

| Pattern | Seen in | Assessment |
|---|---|---|
| Indeterminate spinner + fake percentage | Many AI generators | ❌ breeds distrust; we show real steps only |
| Named stages ("separating stems…") | Stem-separation tools (Moises, LALAL.AI) | ✅ good when the stages are real; we add real findings per stage |
| Single confident answer | LLM-only tone generators | ❌ hides uncertainty; we add evidence levels, confidence and alternatives |
| "Starting point" framing | Dial My Tone | ✅ honest; we make it concrete (what we can't capture) |
| Transparent "recipes" | ToneCraft "parameter cards" | ✅ every knob visible and explained |
| Audio → section-aware tones | GP Tone Builder | ✅ worth adding (section hint in P0, auto-detection P2) |

## 3. Implications (implemented)

1. The progress UI is the pipeline itself (Signal Rail), fed only by backend step states.
2. Every claim shows evidence level (shape-coded glyph + label) and sources with quotes.
3. Numbers are readable (mono, tabular) and units are explicit.
4. The result is editable in spirit: alternatives per block now; fine-tune in P1.
5. The fallback always works: a printable dial-in sheet.
6. No gear photography or brand logos (trademark and licensing risk); craft is expressed through
   typography, data visualisation and motion.

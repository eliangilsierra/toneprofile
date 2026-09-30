# UX Architecture

## 1. Information architecture

```text
/[locale]                       Landing (static)
/[locale]/sign-in               Guest-mode notice (auth arrives with the backend)
/[locale]/tones                 Library
/[locale]/tones/new             New tone
/[locale]/tones/[id]            Analysis → Result (same URL; the page evolves with the job)
/[locale]/tones/[id]/sheet      Dial-in sheet (printable)
/[locale]/examples              Curated examples (public, read-only)
/[locale]/examples/[slug]       Finished Signal Rail + complete result, no feedback
/[locale]/examples/[slug]/sheet Dial-in sheet of an example
/[locale]/methodology           How it works in depth + FAQ (static)
/[locale]/legal/[doc]           privacy · terms · audio — drafts pending legal review (static)
/[locale]/lab                   Design-system lab (internal)
```

Locales: `en`, `es`; always in the URL; the header switcher keeps the current path and query (on
phones the app header shows only the other locale, one tap to switch).
Navigation: marketing header (How it works · Examples · Methodology · Limits, sign-in, "Start a
tone"); app header (Library, New tone, demo marker, locale, sign-in). A site footer on every page
links Examples, Methodology, Start a tone and the three legal pages. Results use in-page jumps
(Tone profile · Preset · Feedback).
Cross-links: the rights checkbox in New tone → audio policy (new tab, so the form isn't lost);
the evidence section of every result → Methodology#evidence; sign-in → privacy.

**Why the analysis and the result share a URL.** The job is the object; the page shows its state.
There's no redirect to lose, a reload always shows the truth, and the Signal Rail stays on screen
as context once the result appears.

## 2. Screens and states

### Landing
Hero (claim + live illustration) → How it works (4 layers) → Evidence vocabulary → Translation demo
→ Device (GP-180) → Limits → CTA. The illustration is labelled as such and uses a fictional song.

### New tone
Three numbered modules + sticky summary.

| State | Behaviour |
|---|---|
| Empty | Summary says what's missing; the button is enabled and validation explains on submit |
| Song search | Debounced; states: hint (< 2 chars), searching, results, no results, demo catalogue note |
| Excerpt | Drop/choose → client checks (type, size) → decode preview → duration check → waveform + window (range inputs + drag) → rights attestation |
| Submitting | Button shows the real phase: uploading → checking audio → starting analysis |
| Failed submit | Inline problem card with retry when retryable |

### Analysis (generation running)
Signal Rail with 7 real steps, each with description while pending/running and the reported
finding when done; skipped steps say why; elapsed time from the server's timestamps and the
typical range from `estimate`; "taking longer than usual" after p90; cancel.

### Result (generation ready)
Summary + overall confidence → warnings (if any) → section jumps → Signal chain translation
(auto-plays once from tone profile to device; toggle; selecting a block opens it in the inspector)
→ Tone profile (fingerprint or "no excerpt" note, character meters with basis + confidence,
measured facts, evidence cards with sources) → Preset (inspector, explanation, download or reason,
dial-in sheet, validation checks, import guide) → Feedback.

### Dial-in sheet
Printable table: slot · model · every setting, disabled blocks marked "leave off", patch volume/BPM.

### Library
Rows with song, preset name, excerpt badge, device, status chip, relative time; empty state with CTA;
running items refresh themselves.

### Examples
List of cards (song, one-line headline, "measured excerpt"/"research only", gain class, "lower
confidence" when the example carries warnings, overall confidence meter) with a visible "fictional"
note. The detail reuses the result exactly (finished Signal Rail, warnings, chain, profile, preset,
sheet) without feedback, plus a "Create a tone" CTA. The set deliberately includes a degraded
result, so visitors see how the product behaves when it knows less. Unknown slug → problem card
with "All examples".

### Methodology and legal
Static long-form pages from typed content modules (`src/content/**`): heading, lede, last-updated
date, table of contents (sticky on desktop), sections. Methodology reuses the shared evidence-level
vocabulary. Legal pages show a visible "Draft — pending legal review" notice; the entity name and
contact address are placeholders until provided.

## 3. Honest async UX

| Principle | Implementation |
|---|---|
| Never fake progress | No percentage bars; stations only change when the backend reports it |
| Always show it's alive | Running station pulses; elapsed clock ticks; live region announces stage changes |
| Show intermediate insight only if real | Findings come from `step.summary` (structured, localized by the client) |
| Set expectations | "Usually takes X–Y" from measured estimates; "taking longer than usual" after p90 |
| Survive reloads and background tabs | State lives in the backend; polling continues in background tabs |

## 4. Error and edge-case catalogue

| Case | Where | Presentation | Recovery |
|---|---|---|---|
| Unsupported file | Create (client) and server 415 | Inline under the drop zone | Choose another file |
| Invalid / corrupt audio | Create (decode) or probe rejection | Inline / problem card | Re-export the file |
| Audio too short (< 5 s) / too long (> 10 min) / too large (> 20 MB) | Create | Inline | Trim / choose another file |
| Window < 5 s or > 90 s | Create | Inline under the waveform | Adjust window |
| Rights not confirmed | Create | Inline under the checkbox | Confirm |
| No song and no excerpt | Create | Summary alert | Add one |
| No guitar detected | Analysis (`no_guitar_detected`, not retryable) | Problem card | Choose another passage |
| Multiple guitars / low quality | Result warning (non-blocking) | "Worth knowing" panel | — |
| Research unavailable, excerpt present | Research station fails softly; warning | Result with lower confidence | — |
| Research unavailable, no excerpt | Analysis (`research_unavailable`, hint `add_excerpt`) | Problem card — we refuse to invent a tone | Add an excerpt / retry |
| AI/engine unavailable | Analysis (`ai_unavailable`, retryable) | Problem card | Retry from last step |
| Mapping failed / preset generation failed | Analysis | Problem card | New tone; logged |
| Job timeout | Analysis (`job_timeout`, retryable) | Problem card | Retry from last step |
| Unsupported device | Create / API 422 | Device card disabled | Choose available device |
| Network failure | Anywhere | Problem card with "Connection problem" | Retry |
| Cancelled | Analysis | Neutral panel | Start a new tone |
| Not found | Analysis/result/sheet | Problem card | Library |
| Unknown route | Any | Localized 404 | Home |
| File download unavailable (demo, validation, format unverified) | Result | Disabled button + reason | Dial-in sheet |

## 5. Responsive strategy

| Element | Desktop | Tablet | Phone |
|---|---|---|---|
| Signal Rail | Horizontal, 7 columns | Horizontal | Vertical list with connectors |
| Chain translation | Horizontal cards with connectors | Wraps | Stacked cards |
| Create | Modules + sticky summary | Stacked, summary after modules | Stacked |
| Fingerprint | Full chart + 5 band buttons | Same | Chart scales; bands 2 per row |
| Inspector | Two-column readouts | Two columns | One column |
| Tables (sheet, spectrum) | Full | Full | Scroll-safe, compact mono |

## 6. Accessibility checklist

Skip link · landmarks and heading order · visible focus · keyboard combobox (↑ ↓ Enter Esc) ·
native radios/checkboxes/selects · `aria-pressed` toggles · `role="meter"` · chart alternatives
(band buttons, table) · live regions for job progress and submit phase · `lang` on generated prose ·
reduced motion · colour never the only signal (evidence glyph shapes, status labels) · axe in E2E.

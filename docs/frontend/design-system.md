# Design System — Signal Lab

Source of truth: CSS custom properties in `src/app/globals.css` (Tailwind v4 `@theme`) and motion
tokens in `src/motion/tokens.ts`. The internal lab at `/[locale]/lab` renders every token and
component (enabled in development or with `NEXT_PUBLIC_ENABLE_LAB=1`).

## Colour

| Token | Value | Use |
|---|---|---|
| `canvas` | `#0b0c0d` | Page background |
| `surface-1/2/3` | `#121315` / `#181a1d` / `#212428` | Panels, raised panels, pressed/selected |
| `line` / `line-strong` | `#2a2e33` / `#3b4047` | Hairlines, control borders |
| `ink` | `#ecebe6` | Primary text (≈16:1 on canvas) |
| `ink-muted` | `#a3a19b` | Secondary text (≈8:1) |
| `ink-faint` | `#817f79` | Tertiary text, captions (≥4.5:1 on canvas and surface-1) |
| `signal` / `signal-strong` | `#ffb23f` / `#ffc46b` | The only accent: live signal, primary action, measured values |
| `signal-soft` | amber 14 % | Selected backgrounds |
| `signal-ink` | `#1c1305` | Text on amber |
| `measure` | `#8cc8d4` | Research-based values in charts only |
| `ok` / `warn` / `danger` | `#74cf98` / `#f28a55` / `#f2585d` | Semantics — always with an icon or label |

Rules: one accent per screen region; never encode meaning in colour alone; dark-first (light theme
is P1).

## Typography

| Role | Family | Size / leading |
|---|---|---|
| Display (marketing) | Instrument Serif | `clamp(3.25rem, 9vw, 8.5rem)` / 0.92 |
| Headline (marketing) | Instrument Serif | `clamp(2rem, 4.2vw, 3.5rem)` / 1.02 |
| Page title | Instrument Sans 600 | 1.875–3rem, tight tracking |
| Body | Instrument Sans 400 | 1rem / 1.55 |
| Label | JetBrains Mono, uppercase, +0.09em | 0.6875rem / 1rem |
| Data | JetBrains Mono, tabular numerals | 0.75–1.125rem |

Fonts are self-hosted by `next/font` (no runtime Google requests). Units (Hz, ms, dB) and device
labels (GAIN, UK 800) are never translated.

## Spacing, radius, elevation

- Spacing: Tailwind's 4 px scale; sections breathe at 64–112 px, panels at 20–28 px.
- Radius: `xs 3px` (chips), `sm 6px` (controls, cards), `md 10px` (panels), `lg 16px` (rare).
  Small radii keep a hardware feel.
- Elevation: surfaces step up in lightness + hairline borders. Shadows only for popovers and the hero
  panel's amber glow.

## Motion

The full motion language ("Calibrated Signal": principles, tokens, hierarchy, signature moments,
reduced-motion behaviour, performance) lives in [motion system](motion-system.md). Summary of the
tokens (`src/motion/tokens.ts` ↔ CSS variables):

| Token | Value | Used for |
|---|---|---|
| `instant` · `micro` · `fast` | 80 · 120 · 160 ms | State flips · hover/press · small swaps |
| `base` · `slow` · `deliberate` | 220 · 360 · 560 ms | Component changes · section reveals and route slides · drawing data |
| `signal` · `ambient` | 900 · 2400 ms | One signal hop · loop period (only while work is reported) |
| `ease.standard` · `out` · `in` · `linear` · `settle` | see tokens | Default · arrivals · departures · signal travel · instruments settling |
| `spring.snappy` · `soft` · `needle` | 520/42 · 210/30 · 260/24 | Toggles · layout morphs · knobs and needles |
| `staggers.micro` · `list` · `signalHop` | 30 · 45 · 120 ms | LED segments · lists · blocks along the chain |

Principles in one line each: motion follows the signal (left → right); amber moves only where
signal or focus is; measured things settle, never bounce; loops only while the backend reports
work; celebrate only what the user watched; one signature moment at a time.

## Components

| Component | Location | Notes |
|---|---|---|
| Button / ButtonLink | `src/ui/button.tsx` | primary · secondary · ghost · danger; sm/md/lg |
| Field / Select | `src/ui/field.tsx` | Native select (mobile-friendly), label + hint/error ids |
| EvidenceMark / EvidenceGlyph | `src/ui/evidence-mark.tsx` | Shape-coded: ● confirmed, ◉ reported, ◐ likely, ◌ inferred, ○? unknown |
| Meter | `src/ui/meter.tsx` | LED ladder, `role="meter"` |
| StatusChip | `src/ui/status-chip.tsx` | Generation status with breathing dot while running |
| Skeleton / PageSkeleton | `src/ui/skeleton.tsx` | `role="status"` |
| Logo, icons | `src/ui/logo.tsx`, `src/ui/icons.tsx` | Hand-drawn 20 px icon set (no icon library) |
| SignalRail | `src/features/generation/signal-rail.tsx` | Signature #1 |
| ChainTranslation / TranslationToggle | `src/features/preset/chain-translation.tsx` | Signature #2 |
| Fingerprint | `src/features/tone-profile/fingerprint.tsx` | Signature #3 (+ table alternative) |
| SongSearch | `src/features/create-tone/song-search.tsx` | ARIA 1.2 combobox |
| WaveformWindow | `src/features/create-tone/waveform-window.tsx` | Canvas waveform + range inputs as source of truth |
| BlockInspector | `src/features/preset/block-inspector.tsx` | Knob readouts |
| ProblemState | `src/features/shell/problem-state.tsx` | Errors as product states |

Not built (not justified yet): modal dialogs, toasts, tooltips library, drawers. Popovers use
native `<details>`.

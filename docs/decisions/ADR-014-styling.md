# ADR-014 — Styling: Tailwind CSS v4 tokens + own components

- Status: accepted
- Date: 2026-09-29

## Decision

- Design tokens as CSS custom properties in Tailwind v4 `@theme` (`src/app/globals.css`); utilities
  generated from them; motion tokens mirrored in `src/motion/tokens.ts`.
- Own small component set in `src/ui`, native elements first (select, radio, checkbox, details).
- No shadcn/ui theme and no Radix for now: nothing built so far needed them, and the visual identity
  must not look like a template. Radix remains the choice when a complex primitive (dialog with
  focus trap, menu) becomes necessary.

## Consequences

Small CSS and JS footprint; accessibility relies on native semantics plus tested ARIA patterns
(combobox).

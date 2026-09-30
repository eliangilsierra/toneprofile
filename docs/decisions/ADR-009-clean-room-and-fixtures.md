# ADR-009 — Clean-room use of community reverse engineering; fixture policy

- Status: accepted
- Date: 2026-09-29

## Context

Key GP-180 knowledge lives in a GPL-3.0 repository and an unlicensed gist; this repository is
Apache-2.0. Factory presets and Valeton Suite metadata are Valeton's content.

## Decision

- Use community findings as **facts** (offsets, encodings, behaviours), re-verify them on our
  device, and write our own code. Do not copy code, generated tables, captures or dumps.
- Credit sources in the documentation.
- Fixtures committed to the repository: only presets and audio we create ourselves. Factory presets
  and third-party dumps live in `tests/fixtures/private/` (gitignored).
- Device catalog: generated locally from the user's own Suite installation by our extractor; the
  committed data is original (schema + curated semantics).

## Consequences

Slightly more work; clean licensing; easier legal review.

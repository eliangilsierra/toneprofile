# API Contract v1

Source: [`openapi-v1.yaml`](openapi-v1.yaml) (OpenAPI 3.1, contract-first, linted with Redocly).
Until the backend repository exists this file is the source of truth; the web app generates its
types from it (`npm run api:types` → `src/lib/api/schema.d.ts`) and the demo backend implements it
(`src/mocks/handlers.ts`).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/devices` | Available and planned devices |
| GET | `/v1/songs/search?q=` | Song lookup (MusicBrainz IDs in production) |
| POST | `/v1/uploads` | Presigned upload ticket (≤ 20 MB, audio allow-list) |
| PUT | *presigned URL* | Upload bytes directly to storage |
| POST | `/v1/uploads/{id}/complete` | Start server-side probing |
| GET | `/v1/uploads/{id}` | `awaiting_upload · probing · ready · rejected` (+ problem) |
| POST | `/v1/generations` | Start a tone generation (202) |
| GET | `/v1/generations` | My generations (cursor) |
| GET | `/v1/generations/{id}` | Poll: status, steps, estimate, warnings, result, error |
| POST | `/v1/generations/{id}/cancel` | Cancel a running generation |
| POST | `/v1/generations/{id}/retry` | Retry a failed, retryable generation from the failed step |
| GET | `/v1/tone-profiles/{id}` | Evidence + intent + confidence (device-independent) |
| GET | `/v1/presets/{id}` | Preset and its versions |
| GET | `/v1/presets/{id}/versions/{n}` | Device chain, explanation, validation, download availability |
| GET | `/v1/presets/{id}/versions/{n}/download` | Device file (`.prst`) or 409 with the reason |
| POST | `/v1/presets/{id}/versions/{n}/feedback` | Rating, tags, comment |
| GET | `/v1/examples?locale=` | Curated public examples (read-only generations) |
| GET | `/v1/examples/{slug}?locale=` | One example; its `generation_id` is read with the usual generation, tone-profile and preset endpoints |

P1 additions (not in v1 yet): `POST /v1/presets/{id}/versions` (fine-tune / edits),
`POST …/versions/{n}/comparisons` and `GET /v1/comparisons/{id}` (Match).

## Async job model

```text
POST /v1/generations ──► 202 Generation{status: queued}
            ▼
GET /v1/generations/{id}  (repeat after poll_after_ms while status ∈ {queued, running})
            ▼
status: ready ──► result {tone_profile_id, preset_id, preset_version}
status: failed ──► error: Problem {code, retryable, hint}  ──► POST …/retry if retryable
status: cancelled
```

- `steps[]` lists all pipeline steps in order with `pending · running · done · skipped · failed`
  and a structured `summary` when done. A step may fail **softly** (e.g. research unavailable while
  audio exists): the generation continues and a `warning` is added.
- `estimate {p50_s, p90_s}` is measured on recent generations of the same mode.
- Human prose (summary, explanations, claim statements) is written in the `locale` sent at creation;
  everything else is structured and localized by the client.

## Examples

Examples are curated, finished generations shown publicly (`/examples` in the web app). Because
their prose is per locale, `GET /v1/examples?locale=es` returns, for each example, the
`generation_id` of the Spanish generation. Examples never appear in `GET /v1/generations` and
reject mutations (`cancel`, `retry`, `feedback`) with `409 conflict`. The demo backend serves
three fictional ones, including a deliberately degraded result (research unavailable).

## Errors

RFC 9457 `application/problem+json` with a stable `code` (see `ErrorCode` in the spec), `retryable`
and an optional `hint` (`choose_other_section`, `add_excerpt`, `demo_mode`). Clients map codes to
copy; they never parse `detail`.

## Authentication

Bearer JWT (Supabase Auth in the proposed hosting). Catalog endpoints are public; everything else is
scoped to the caller. The demo backend runs without auth.

# ADR-016 — Contract-faithful mock backend with MSW

- Status: accepted
- Date: 2026-09-29

## Context

The backend doesn't exist yet. The frontend must be built, tested and demoed against realistic,
asynchronous behaviour without faking capabilities inside UI components.

## Decision

- The UI always uses the real HTTP client (`openapi-fetch`, types from the OpenAPI contract).
- In mock mode (`NEXT_PUBLIC_API_MODE=mock`, default) MSW implements the contract in the browser
  (`src/mocks/handlers.ts`); the same handlers run in Vitest via `msw/node`.
- Job progress is a pure function of time (`computeGeneration(record, now)`): deterministic,
  testable, no random progress.
- Fixtures are fictional (songs, artists, publications, quotes; `example.com` sources) so the demo
  never attributes invented gear to real musicians.
- Scenario triggers: song fixtures (research unavailable, transient AI failure, timeout) and upload
  file-name keywords (`noguitar`, `multi`, `lowq`, `corrupt`).
- Honesty in the UI: persistent demo marker; preset files are not offered in the demo.

## Consequences

The mock is a second implementation of the contract; changes to `openapi-v1.yaml` must update
both the generated types and the handlers (type errors surface most mismatches).

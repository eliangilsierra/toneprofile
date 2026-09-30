# ADR-012 — Next.js for the web application

- Status: accepted
- Date: 2026-09-29
- Supersedes: the frontend part of [ADR-006](ADR-006-system-architecture.md) (React + Vite SPA)

## Context

ADR-006 chose a Vite SPA because the app is an authenticated tool and the domain lives in Python.
The frontend brief makes the marketing experience a first-class surface (static pages, SEO,
editorial typography, localized metadata) and asks for Next.js explicitly.

## Decision

Next.js 16 (App Router) in this repository, used strictly as a frontend:

- Static rendering for marketing pages per locale; client-driven app routes.
- `proxy.ts` only for locale negotiation; `rewrites` proxy `/api/v1/*` to the backend in http mode.
- No domain logic, no LLM calls, no database access in Next.js. Route Handlers / Server Actions are
  not used; the Python backend remains the single API.

## Consequences

- One project covers landing and app; fonts, metadata and i18n are handled by the framework.
- The Next.js runtime costs ≈ 130 KB gzip of JavaScript per page (measured).
- A Node server (or a Next-capable host) is needed for the proxy and rewrites.

## Revisit when

The app needs server-side session handling (auth cookies) — then consider thin Route Handlers, still
without domain logic.

# ADR-004 — AI provider strategy

- Status: accepted
- Date: 2026-09-29

## Context

Candidates: OpenRouter, Anthropic, OpenAI, Google, local models. Research needs web search with
citations; intent needs strict structured outputs; costs must stay low (market price anchor
≈ $30/year).

## Decision

- Domain code depends on an `LLMGateway` port. Adapters: **Anthropic (production primary)**,
  **OpenRouter (evaluation/dev only)**, **Recorded (tests, offline dev)**.
- Anthropic chosen for provider-side web search with citations, strict structured outputs, prompt
  caching and batch discounts, without an intermediary fee.
- Model per task is decided by the eval harness. Starting hypothesis: Sonnet 5.5 for research and
  intent, Haiku 4.5 for disambiguation and explanations, Opus 5.5 as eval judge. Before adding any
  cheap→strong cascade, measure a capable model at low effort against it.
- No LLM in deterministic steps (catalog, parameter values, validation, serialization, metrics).

## Alternatives considered

OpenRouter as primary (5.5 % credit fee, abstracts away provider-specific features, extra hop);
Gemini with search grounding (viable secondary; $14 per 1k grounded queries after the free tier);
local models (insufficient for research synthesis today).

## Consequences

Vendor concentration mitigated by the port; switching requires an adapter + an eval run.

## Revisit when

The eval shows another provider cheaper at equal quality, or provider terms/prices change.

# AI Architecture

Decision record: [ADR-004](../decisions/ADR-004-ai-provider-strategy.md).

## 1. Principle: a deterministic pipeline with a few specialised AI steps

No agent swarm. The pipeline is a fixed sequence of steps orchestrated by ordinary code; each AI
step has one job, a typed input, a JSON-schema output, a validator and a fallback.

```text
Generation
 ├─ 1. resolve_song        deterministic (MusicBrainz) + LLM disambiguation only if ambiguous
 ├─ 2. research_gear       LLM + provider web search (cached per song, shared across users)
 ├─ 3. grade_evidence      deterministic rules over claims/sources
 ├─ 4. analyze_audio       DSP/ML (only if the user uploaded an excerpt)
 ├─ 5. draft_intent        LLM → ToneIntent (schema-constrained, controlled vocabulary)
 ├─ 6. map_to_device       deterministic mapper/optimizer → DevicePatch
 ├─ 7. validate_patch      deterministic
 ├─ 8. explain             LLM prose from structured facts (or templates if LLM unavailable)
 └─ 9. serialize           deterministic → .prst + dial-in sheet
```

The only step with open-ended, multi-turn tool use is **research_gear** (search → read → search
again). It is a bounded loop (max searches, max tokens, task budget), not an autonomous agent with
side effects.

## 2. Responsibilities

| Step | Model tier | Why AI | Output contract | Failure fallback |
|---|---|---|---|---|
| Song disambiguation | small (Haiku 4.5) | Fuzzy user text ("that Mayer song about the burning room") | `{title, artist, confidence}` | Ask the user to pick from MusicBrainz candidates |
| Gear research | mid/high (Sonnet 5.5 or Opus 5.5 at low effort — decide by eval) | Reading heterogeneous sources, extracting claims | `claims[]` with **mandatory source URLs + supporting quote** | "No research available" — intent from audio/style only, marked low confidence |
| Claim verification | deterministic + small model | Check the quote actually appears in the fetched source | pass/fail per claim | Drop claim |
| Intent drafting | mid/high | Reasoning from evidence + style to roles/archetypes/targets | `ToneIntent` JSON schema with enum-constrained archetypes | Rule-based intent from gain class + genre template |
| Explanation | small/mid | Readable prose | Markdown ≤ 250 words referencing claim IDs | Template text |
| NL fine-tune | small/mid | "Less fizzy", "more like the live version" | Tool call with bounded deltas on intent targets | Offer sliders |
| Evaluation judge (internal) | high | Rubric grading of explanations/research | Scores + rationale | Human review |

**Never AI:** catalog, ranges, serialization, validation, DSP features, similarity metrics, knob
solving, evidence-level assignment, confidence aggregation, cost/rate limits.

## 3. Hallucination controls for gear research

1. Research runs with a web-search tool executed **by the provider** (no server-side fetching by us
   from LLM-chosen URLs → no SSRF surface).
2. Output schema requires, per claim: source URL, publisher, a verbatim supporting quote (≤ 25 words,
   stored as hash + short excerpt for audit), and whether the source refers to *this recording* or
   the artist in general.
3. Deterministic check: the quote must appear in the retrieved source text (provider citations);
   otherwise the claim is dropped.
4. Evidence level assigned by rules (source type × specificity × agreement), not by the model.
5. The UI shows "Unknown" rather than filling gaps; the intent step may *infer*, but inferred items
   are labelled `inferred`.
6. Research is cached per song and **reviewable**: popular songs can be human-verified once and
   reused.

## 4. Provider strategy

| Option | Pros | Cons | Role |
|---|---|---|---|
| **Anthropic API direct** | Server-side web search + citations, strict structured outputs, prompt caching (cache reads ~0.05–0.1× input), batch −50%, no intermediary fee | Single vendor | **Primary** |
| OpenAI / Google direct | Strong alternatives; Gemini has search grounding ($14/1k grounded queries after free tier) | Different tool/caching semantics | Secondary adapters if evals justify |
| **OpenRouter** | One key, many models, fast A/B across vendors | 5.5% credit fee; extra hop; provider-specific features (server tools, cache semantics, citations) partially abstracted away | **Evaluation/dev tool** to benchmark models on our eval set; not in the production path |
| Local models | No per-token cost, privacy | Weak at research synthesis; ops burden | Not for MVP; revisit for NL fine-tune |

Architecture: domain code depends on an `LLMGateway` port with operations such as
`structured(task, input, schema) -> T` and `research(query, budget) -> ResearchResult`. Adapters:
`AnthropicGateway` (prod), `OpenRouterGateway` (evals), `RecordedGateway` (tests replay recorded
responses — deterministic CI without API calls).

## 5. Model selection — decide by measurement

Current list prices (per million tokens, input/output): Claude Opus 5.5 $4/$20, Sonnet 5.5 $2/$10,
Haiku 4.5 $1/$5 (Anthropic, cached 2026-09-25); OpenAI GPT-5.6 tiers from $0.20/$1.20 to
$5/$30; Gemini 3.1 Pro $2/$12, Gemini 3.8 Flash $0.75/$3.75 intro (third-party pricing summaries,
September 2026 — confirm on vendor pages before budgeting).

Rather than pre-committing to a cheap→medium→strong cascade, the plan is:

1. Build the eval set first (20-song suite, gold claims for 10 songs, intent rubric).
2. Measure **one capable model at low/medium effort** vs. a cheaper model on research + intent.
   Newer capable models at low effort often match older/cheaper models at high effort, and a single
   model keeps one prompt cache.
3. Introduce routing only where the eval shows equal quality at lower cost per *completed*
   generation (not per request).

Starting hypothesis to test: Sonnet 5.5 for research and intent, Haiku 4.5 for disambiguation and
explanation, Opus 5.5 as eval judge.

## 6. Cost controls (from day one)

| Lever | Mechanism |
|---|---|
| Research cache | Keyed by canonical song (MusicBrainz recording/work ID) + research prompt version; shared across users; TTL ~180 days |
| Intent cache | Keyed by (evidence hash, guitar profile, device, intent prompt version) |
| Prompt caching | Stable system prompt + archetype vocabulary + catalog summary first; volatile input last |
| Batch API | Pre-compute research for the top-N requested songs nightly at −50% |
| Budgets | Per-step `max_tokens`, max web searches (e.g. 5), per-generation hard cap, per-user daily quota, global daily spend circuit breaker |
| Structured outputs | No retries due to malformed JSON |
| Metering | Every call logged with tokens (incl. cache read/write), cost, latency, prompt version |

## 7. Prompt & schema management

- Prompts are versioned files in the repository (`prompts/<task>/vN.md`) with the JSON schema next
  to them; the version is stored on every LLM call and generation.
- Changing a prompt requires running the eval suite; results are committed as a report.
- Untrusted content (web pages, user text) is passed as data blocks, never concatenated into
  instructions; the model has no tools that mutate state.

## 8. Where agents *would* be justified later

- Research over hard cases (obscure songs) with deeper multi-source reading — still one bounded
  loop, measured by claim precision.
- An offline "curator" workflow that proposes archetype tags for new device models for human
  review.

Neither requires multiple autonomous agents talking to each other.

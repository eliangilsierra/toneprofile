# Observability

AI-generated results are only debuggable if every generation can be replayed step by step.

## 1. Two complementary layers

| Layer | Audience | Store | Content |
|---|---|---|---|
| **Product trace** (`generation`, `generation_step`, `llm_call` tables) | Us, via admin UI; later users ("why this amp?") | Postgres | Inputs, step outputs (evidence, intent, patch), versions, costs, errors — durable, queryable |
| **Telemetry** (OpenTelemetry traces, metrics, structured logs) | Operations | Grafana Cloud (or any OTLP backend) | Spans/latency, error rates, queue depth, resource usage — sampled, short retention |

The `generation_id` is the join key: it is the OTel root span attribute, the log field and the DB
primary key.

## 2. Trace shape

```text
generation 7f3c…  (root span, attributes: user_id hash, device, pipeline_version)
 ├─ resolve_song            mbid, cache_hit
 ├─ research_gear           cache_hit, searches=4, claims=7, dropped_unverified=2
 │   └─ llm.call            gen_ai.system=anthropic, gen_ai.request.model, tokens in/out/cache, cost_usd
 ├─ analyze_audio           analyzer_version, duration_s, separation=demucs_cpu, cpu_s
 │   ├─ ffmpeg.decode
 │   ├─ separate
 │   └─ features
 ├─ draft_intent            prompt_version, schema_valid=true
 │   └─ llm.call
 ├─ map_to_device           candidates=6, objective=1.8 dB, catalog_version
 ├─ validate_patch          ok
 ├─ explain                 └─ llm.call
 └─ serialize               prst_sha256
```

LLM spans follow the OpenTelemetry GenAI semantic conventions (`gen_ai.*` attributes). Prompt and
response bodies are **not** exported to telemetry; they are stored (truncated, PII-scrubbed) in
`llm_call` with 30-day retention for debugging and eval curation.

## 3. Metrics

| Metric | Why |
|---|---|
| `generation_duration_seconds{mode,step}` | Latency SLOs (p50 ≤ 90 s with audio) |
| `generation_outcome_total{status}` | Failure rate |
| `llm_cost_usd_total{task,model}` and per-generation cost histogram | Cost control |
| `llm_tokens_total{type=input|output|cache_read|cache_write}` | Cache effectiveness |
| `research_cache_hit_ratio` | Main cost lever |
| `job_queue_depth`, `job_wait_seconds` | Scaling trigger |
| `audio_cpu_seconds{step}` | Worker sizing |
| `preset_feedback_score` | Product quality |

## 4. Logging

- `structlog` JSON logs, one event per step boundary, with `generation_id`, `trace_id`, `step`,
  `pipeline_version`.
- No raw audio, no full prompts, no secrets in logs; user identifiers hashed.

## 5. Alerts (MVP)

- Daily LLM spend > budget threshold (also enforced by a hard circuit breaker in code).
- Generation failure rate > 10 % over 1 h.
- Queue wait p95 > 5 min.
- Error spikes (Sentry).

## 6. Reproducibility

Every generation stores `pipeline_version` (git SHA), prompt versions, analyzer version, catalog
version and model IDs. With `RecordedGateway` (replayed LLM responses) any generation can be
re-run bit-for-bit through the deterministic steps.

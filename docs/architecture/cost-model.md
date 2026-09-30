# Cost Model

All figures are **estimates** for planning (September 2026 list prices; verify before budgeting).
They must be replaced by measured per-step costs from `llm_call` and job metrics during Phase 5.

## 1. Unit prices used

| Item | Price | Source |
|---|---|---|
| Claude Sonnet 5.5 | $2 in / $10 out per MTok; cache read $0.20/MTok | Anthropic pricing (cached 2026-09-25) |
| Claude Haiku 4.5 | $1 / $5 per MTok | same |
| Claude Opus 5.5 | $4 / $20 per MTok; cache read $0.20/MTok | same |
| Web search (provider tool) | ~$10 per 1,000 searches | Anthropic pricing page — verify |
| Batch API | −50 % on all tokens | Anthropic |
| CPU worker (dedicated 2 vCPU) | ~$0.09/h, billed per second | Fly.io-class estimate |
| Serverless GPU (L4) | ~$0.80/h billed per second | Modal (third-party summaries) |
| Guitar stem API | ~$0.10/min (Music.AI), ~$0.15/min/stem (LALAL.AI) | vendor pricing pages |

## 2. Per-generation variable cost

| Step | Assumption | Cost |
|---|---|---|
| Song resolution | MusicBrainz (free); Haiku only if ambiguous | ≈ $0.001 |
| Gear research (cache **miss**) | ~40k input tokens across search turns, ~3k output, 5 searches, Sonnet 5.5 | ≈ $0.16 (Opus 5.5 low effort: ≈ $0.27) |
| Gear research (cache **hit**) | — | $0 |
| Intent drafting | ~6k cached system prompt + ~4k fresh input, ~2.5k output, Sonnet 5.5 | ≈ $0.035 |
| Explanation | ~3k in / 0.5k out, Haiku 4.5 | ≈ $0.006 |
| Audio (60 s excerpt, CPU separation + features) | ~2 CPU-minutes | ≈ $0.005 |
| Audio via stem API instead | 60 s | ≈ $0.10 |
| Storage & egress | a few MB for < 24 h | < $0.001 |

| Scenario | Cost / generation |
|---|---|
| Song only, research cached | **≈ $0.04–0.05** |
| Song only, research miss | **≈ $0.20** |
| Song + excerpt (CPU separation), research miss | ≈ $0.21 |
| Song + excerpt (stem API), research miss | ≈ $0.31 |
| "Match" comparison (audio + short Haiku phrasing) | ≈ $0.01 |

## 3. Monthly projections

Assumptions: 50 % of generations include an excerpt (CPU separation); research cache hit rate grows
with volume because requests concentrate on popular songs (20 % → 40 % → 60 %); at 10k/month,
research for the most requested songs is precomputed via Batch (−50 %).

| Volume | LLM + audio variable | Fixed infra | **Total / month** | **All-in / generation** |
|---|---|---|---|---|
| 100 generations | ≈ $17 | ≈ $10–35 (free tiers + scale-to-zero machines; Supabase Pro optional) | **≈ $30–55** | ≈ $0.30–0.55 |
| 1,000 generations | ≈ $145 | ≈ $50–70 (Supabase Pro $25, API + on-demand worker) | **≈ $200–215** | ≈ $0.20 |
| 10,000 generations | ≈ $1,000–1,150 | ≈ $250–300 (2–3 dedicated workers, DB compute add-on, paid observability tier) | **≈ $1,300–1,450** | ≈ $0.13–0.15 |

One-off / R&D:
- Evaluation run (20 songs × 5 repeats, research uncached): ≈ $25 per full run.
- Hardware rig: $0 if USB re-amp works (U7); otherwise a basic 2-in/2-out audio interface (~$100).
- Device characterization: rig time only.

## 4. Sensitivities and targets

- The dominant cost is **uncached research**. Every point of cache hit rate matters more than
  model choice elsewhere. A human-verified research library for the top ~500 requested songs
  converts most traffic to the ≈ $0.05 path.
- Market price anchor is low (a direct competitor charges $29.99/year). Target: **≤ $0.10 median
  variable cost per generation at 1,000+/month**, enforced by per-user quotas (e.g. free tier 3/day).
- If Phase 5 evals show Haiku 4.5 or a small Gemini/OpenAI model matches quality for intent
  drafting, intent cost drops ~3×; only adopt with eval evidence.
- Commercial stem APIs double the cost of audio generations; use only if they measurably improve
  results over local separation.

## 5. Controls implemented in code

Per-step `max_tokens`, max web searches per research, per-generation cost cap (abort + partial result
if exceeded), per-user daily generation quota, global daily spend circuit breaker, cost recorded per
LLM call and aggregated per generation.

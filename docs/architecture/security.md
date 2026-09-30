# Security Model

## 1. Assets

| Asset | Why it matters |
|---|---|
| LLM / API keys, database credentials | Direct financial and data exposure |
| User accounts and their presets/uploads | Privacy, trust |
| Budget (LLM + compute spend) | Abuse can create unbounded cost |
| Worker hosts | Parse untrusted media; compromise → lateral movement |
| Users' GP-180 devices | A malformed preset must never harm a device or its settings |
| Research cache integrity | Poisoned claims would mislead all users |

## 2. Trust boundaries

```text
Browser (untrusted) ──► API (authn/z, validation) ──► Postgres
          │                       │
          └── presigned PUT ──► Object storage ◄── Worker (sandboxed media parsing)
                                                    │
                                                    ├──► LLM provider (untrusted outputs)
                                                    │       └── provider-side web search (untrusted content)
                                                    └──► MusicBrainz (untrusted metadata)
```

## 3. Threats and mitigations (STRIDE-oriented)

| # | Threat | Mitigation |
|---|---|---|
| T1 | Stolen/forged session | Managed auth (Supabase/Clerk), short-lived JWTs verified by signature + audience + expiry; HTTPS only; no tokens in URLs |
| T2 | Broken object-level authorization (IDOR) | Every user-owned query scoped by `user_id` in the repository layer; UUIDs; RLS as defence in depth; tests for cross-user access |
| T3 | **SSRF via user URLs** | **Eliminated by design: the MVP never fetches user-supplied URLs.** Web research runs as a provider-side tool; MusicBrainz calls go to a fixed host. Worker egress restricted by allow-list where the platform supports it |
| T4 | **Malicious media file → FFmpeg/decoder exploit** | Size cap on presigned upload (Content-Length condition); magic-byte + `ffprobe` check against an allow-list (wav, flac, mp3, aac/m4a, ogg/opus); FFmpeg run as a subprocess with `-protocol_whitelist file`, explicit demuxer (`-f`), no network, CPU/memory/time limits (rlimits + timeout), in an unprivileged container (Fly Machines are Firecracker micro-VMs); pinned, regularly updated FFmpeg build; decoded output re-validated (duration, channels) |
| T5 | Zip bombs / decompression amplification | Duration and decoded-size caps enforced during decode (stop after N seconds) |
| T6 | Malware distribution through our storage | Uploads are private, never served to other users; audio is transcoded, never re-served raw; deleted within 24 h. AV scanning (ClamAV) is optional since we never redistribute uploads |
| T7 | **Prompt injection** from web pages or user text | Untrusted content is passed as data, not instructions; the LLM has **no state-changing tools**; outputs must validate against strict schemas with enum-constrained vocabularies; claims require verbatim quotes found in the cited source; the deterministic device engine re-validates everything; explanation text is rendered as escaped Markdown (no HTML) |
| T8 | Research cache poisoning (SEO spam, fake "rig rundowns") | Evidence rules weight source types (publisher allow-list for `confirmed`); human verification flag for popular songs; claims are per-version and can be revoked |
| T9 | Cost abuse (scripted generations) | Per-user daily quotas, per-IP rate limits at the edge, account-age limits, global daily spend circuit breaker, per-generation token caps, research cache |
| T10 | Secret leakage | Secrets only in platform secret stores; never in the image or repo; `gitleaks` in CI; least-privilege DB roles (api vs worker vs migrations); rotation runbook |
| T11 | Supply chain | Lockfiles (uv, pnpm), Dependabot/Renovate, `pip-audit` / `pnpm audit` in CI, pinned base images by digest, SBOM on release |
| T12 | Harmful preset to user device | Validator rejects anything outside the catalog; only observed engine-tag/chain combinations; conservative output level; no firmware or SysEx writes in MVP; users import through the official editor |
| T13 | XSS in the SPA | React escaping, strict CSP (no inline scripts), sanitized Markdown, no `dangerouslySetInnerHTML` |
| T14 | Denial of service via long jobs | Job timeouts per step, bounded concurrency per user, queue fairness (per-user in-flight cap) |
| T15 | Privacy of recordings | Minimal retention, deletion on request, analytics without raw content, EU/US region choice documented |

## 4. Upload flow (hardened)

1. `POST /uploads` → API checks quota, creates `audio_asset` row, returns presigned PUT limited to
   20 MB, fixed content-type, 10-minute expiry, key under `uploads/{user_id}/{uuid}`.
2. Client uploads directly to storage.
3. `POST /uploads/{id}/complete` → enqueue probe job.
4. Worker: download to tmpfs → magic bytes → `ffprobe` (sandboxed) → allow-list → decode (sandboxed)
   → analysis → delete raw + intermediates → mark `deleted_at`.

## 5. Secrets management

| Environment | Store |
|---|---|
| Local | `.env` (gitignored), `.env.example` committed without values |
| CI | GitHub Actions encrypted secrets, environment-scoped (production requires approval) |
| Production | Platform secret store (Fly secrets), injected as env vars at runtime |

## 6. Security testing

- Unit tests for authorization scoping and upload validation.
- Fuzzing the `.prst` parser (hypothesis/atheris) — it parses user-supplied files in the future
  "import my preset" feature.
- A corpus of malformed audio files in integration tests (truncated, wrong magic, huge headers).
- `bandit`, `semgrep` rules in CI; dependency audit.

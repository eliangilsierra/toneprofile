# ADR-005 — Audio processing architecture

- Status: accepted
- Date: 2026-09-29

## Context

Guitar isolation quality is limited even for state-of-the-art models; model weights have mixed
licenses; GPUs are expensive to keep warm; uploads are untrusted media.

## Decision

- User-uploaded excerpts only; analyse ≤ 90 s; delete raw audio ≤ 24 h; keep derived features.
- Sandboxed ffprobe/ffmpeg with a format allow-list and resource limits.
- `StemSeparator` port: Noop, Demucs CPU (default), commercial API adapter. The production default
  is chosen by benchmark + license review in P4. No GPU at MVP volume; serverless GPU is the
  scale-up path.
- Features with numpy/scipy/librosa/pyloudnorm; avoid AGPL-licensed Essentia in the SaaS core.
- One comparison module shared by evaluation, device characterization and Match mode.

## Consequences

CPU jobs of 1–2 minutes are fine asynchronously; separation quality is a measured risk.

## Revisit when

Volume makes GPU cheaper per job, or a commercially licensed guitar model clearly wins.

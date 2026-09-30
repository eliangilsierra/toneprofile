# Audio Architecture

Decision record: [ADR-005](../decisions/ADR-005-audio-processing.md).

## 1. Inputs we accept (MVP)

| Input | Accepted | Notes |
|---|---|---|
| Song name only | ✓ | No audio processed |
| User-uploaded excerpt (WAV/FLAC/MP3/AAC/OGG) | ✓ | ≤ 20 MB, ≤ 10 min file; we analyse ≤ 90 s selected by the user (default: auto-picked guitar-dominant window) |
| User recording through their GP-180 ("Match" mode) | ✓ | Same limits; ideally the same passage as the reference |
| URLs (YouTube, Spotify, etc.) | ✗ | Not fetched. See [legal](../product/legal-considerations.md) and [security](../architecture/security.md) |

Uploaded audio is deleted within 24 h (or immediately after analysis); only derived features are
retained.

## 2. Pipeline

```text
upload (presigned URL, size-capped)
  │
  ▼
[probe]      ffprobe in sandbox: container/codec allow-list, duration, channels, sample rate
  │
  ▼
[decode]     ffmpeg in sandbox → 48 kHz float32 WAV, mono + stereo kept (for L/R double-tracks)
  │
  ▼
[select]     user window or auto: frames with high guitar-likelihood (post-separation energy ratio,
  │          pitch confidence), ≤ 90 s
  ▼
[separate]   optional: guitar stem via StemSeparator port (see §3)
  │
  ▼
[features]   descriptors (see §4) on guitar-dominant frames
  │
  ▼
[store]      AudioAnalysis JSON (versioned) → delete raw + intermediate audio
```

All steps are pure functions of (input bytes, analyzer version, params) → cacheable by content hash.

## 3. Stem separation

| Option | Quality (guitar) | Runtime | Cost | License / commercial notes |
|---|---|---|---|---|
| Demucs v4 `htdemucs_6s` (has a guitar stem) | Moderate; guitar stem known to bleed | CPU ~0.5–2× real time on 4 vCPU; GPU seconds | Compute only | Code MIT; weights released by Meta — verify terms and training data |
| BS-RoFormer / Mel-RoFormer community models (via `audio-separator`) | Current SOTA family; "other"/guitar stems still ~9 dB SDR range | GPU recommended | Compute only | Wrapper MIT; **weights licenses vary, some explicitly non-commercial**; many trained on MUSDB18 (research-only data) → legal review |
| Music.AI (Moises) API | Electric/acoustic guitar, rhythm/lead split | Seconds–minutes | ~$0.10/min | Commercial API; check data-retention terms |
| LALAL.AI API | 6+ stems incl. electric guitar | Fast | ~$0.15/min/stem | Commercial API |
| No separation | n/a | — | — | Works for solo/intro/isolated excerpts; the UI encourages choosing such passages |

**MVP decision:** separation behind a `StemSeparator` port with `NoopSeparator`, `DemucsCpu`
(local/dev and default production), and `MusicAiApi` adapters. Choose the production default
after the Phase 4 benchmark on our test suite (metric: downstream descriptor stability and
human-rated result, not SDR). GPU is not needed at MVP volumes; a serverless GPU (e.g. Modal,
L4 ≈ $0.80/h billed per second) is the scale-up path.

## 4. Descriptors

| Descriptor | Purpose | Library |
|---|---|---|
| LTAS in 1/3-octave (and ERB) bands, loudness-normalised (LUFS) | Spectral balance target for the mapper; main objective metric | numpy/scipy + pyloudnorm |
| Spectral tilt, centroid, roll-off, flatness (stats over frames) | Brightness, fizz, gain proxies | librosa |
| Harmonic density / inharmonic energy, crest factor, envelope attack | Saturation & compression proxies | numpy/scipy |
| Gain class classifier | clean / edge / crunch / high-gain / fuzz | small classifier trained on our device-characterization renders + NAM-capture renders |
| Onset-envelope autocorrelation vs. tempo | Delay presence/time (incl. dotted eighths) | librosa |
| Band-envelope modulation spectrum | Chorus/phaser/tremolo rate & depth | numpy |
| Decay after note-offs, DRR proxy | Reverb amount | numpy |
| Tempo, key, sections | Context, section selection | librosa (beat/chroma); Essentia optional |
| Audio embedding (AFx-Rep, CLAP, MERT) | Secondary similarity metric — adopt only if it correlates with our human ratings | torch |

Library choice: **numpy/scipy + librosa + pyloudnorm** as the base (permissive licenses, simple
install). **Essentia is AGPL-3.0** (commercial license available) — avoid in the SaaS core unless
licensed. TorchAudio only where a model requires torch anyway.

## 5. Comparison ("Match" mode and evaluation)

Given reference R and candidate C (user's GP-180 recording, or a device render):

1. Loudness-normalise both; restrict to guitar-dominant frames; optionally align passages.
2. Compute per-band LTAS difference ΔdB(f), with a tilt-removed variant.
3. Compute saturation, dynamics and ambience deltas.
4. Map deltas to **device-level suggestions** through the characterization data
   ("treble −8 on AMP", "presence −10", "CAB high-cut to 7.5 kHz", "gain +10"), capped in size and
   explained.

Known confound: the user's guitar/pickups/playing differ from the reference. Mitigations: compare
spectral *shape* after tilt removal for guitar-dependent bands, weight mid bands more than extremes,
and prefer the user's own before/after recordings for iterative matching.

## 6. Test signals & corpora

- **DI corpus** (ours): dry recordings from our test guitars (single coil + humbucker at minimum),
  fixed phrases. Used for device characterization and known-answer tests.
- **NAM-capture references**: DI corpus rendered through public NAM captures of real amps
  (TONE3000, license permitting) → "real amp" targets without mixing confounds.
- **Song excerpts**: user-provided, for end-to-end tests; not stored in the repository.

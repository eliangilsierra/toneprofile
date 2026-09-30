# ToneProfile documentation

Turn a song reference into a playable preset for your guitar processor — starting with the
**Valeton GP-180** — with honest evidence about what is known, measured and inferred.

> Status: discovery complete; **web MVP implemented against a contract-faithful demo backend**
> (this repository). Backend not started — next milestone: GP-180 preset codec proof of concept on
> real hardware (roadmap P1).

## How it works

```text
song (+ optional excerpt, + your guitar)
  → evidence   (gear research with sources, audio descriptors)
  → intent     (device-independent signal chain, archetypes, perceptual targets)
  → GP-180 patch (deterministic mapper, solved against measured device response)
  → .prst file → import with Valeton Suite → play → (P1) record yourself → Match
```

## Repositories

| Repository | Stack | Content |
|---|---|---|
| `toneprofile` (this one) | TypeScript · Next.js | Web app + all documentation + contract-first API draft |
| `toneprofile-api` (planned) | Python | Backend: API, worker, GP-180 device engine, audio, AI, CLI, hardware rig |

## Documents

Start with the **[technical proposal](proposal.md)** and the **[MVP master plan](product/mvp-master-plan.md)**, then:

| Area | Documents |
|---|---|
| Product | [Product definition](product/product-definition.md) · [MVP master plan](product/mvp-master-plan.md) · [UX architecture](product/ux-architecture.md) · [Legal considerations](product/legal-considerations.md) |
| Research | [GP-180 ecosystem](research/gp180-ecosystem.md) · [Competitive analysis](research/competitive-analysis.md) · [UX research](research/ux-research.md) · [Feasibility](research/feasibility.md) |
| Frontend | [Creative direction](frontend/creative-direction.md) · [Design system](frontend/design-system.md) · [Frontend architecture](frontend/frontend-architecture.md) · [Performance](frontend/performance.md) |
| API | [Contract v1](api/README.md) ([OpenAPI](api/openapi-v1.yaml)) |
| Device | [GP-180 preset format](devices/valeton-gp180/preset-format.md) · [Device engine](devices/valeton-gp180/device-engine.md) |
| Architecture | [Overview](architecture/overview.md) · [Tone representation](architecture/tone-representation.md) · [Domain model](architecture/domain-model.md) · [Security](architecture/security.md) · [Cost model](architecture/cost-model.md) · [Observability](architecture/observability.md) · [Repositories & CI/CD](architecture/repository.md) |
| AI & audio | [AI architecture](ai/ai-architecture.md) · [Audio architecture](audio/audio-architecture.md) |
| Testing | [Validation strategy](testing/validation-strategy.md) |
| Plan | [Roadmap](roadmap.md) · [Risk register](risk-register.md) · [ADRs](decisions/README.md) |

## Disclaimer

ToneProfile is an independent project, not affiliated with or endorsed by Valeton. Product and
artist names are used descriptively.

## License

[Apache-2.0](../LICENSE)

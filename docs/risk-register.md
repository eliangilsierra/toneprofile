# Risk Register

Likelihood (L) and impact (I): 1 low – 3 high. Owner is the product owner unless stated.

| # | Risk | Type | L | I | Mitigation | Trigger / signal |
|---|---|---|---|---|---|---|
| R1 | Valeton Suite rejects hand-authored `.prst` files (U1/U2) | Feasibility | 1 | 3 | Template-based generation, verify on hardware in P1; fallback = dial-in sheet (already in the UI) | PoC-1 fails |
| R2 | Unknown engine-tag / chain-order rules produce silent presets (U3/U4) | Technical | 2 | 3 | Emit only observed combinations; hardware verification ladder; validator | Silence or no-audio reports |
| R3 | Firmware/Suite update changes the format or catalog | Technical | 2 | 2 | Catalog versioned by firmware; golden tests on user-exported presets | New firmware release |
| R4 | Tone quality not better than an LLM-only baseline | Product | 2 | 3 | Device characterization, eval suite, blind tests; First Loop go/no-go gate | S6 fails |
| R5 | Research hallucinations / fabricated gear | Product/Legal | 2 | 3 | Verified quotes, rule-based evidence levels, "unknown" allowed, human-verified popular songs | Claim precision < 90 % |
| R6 | Direct competitor (GP Tone Builder) or Valeton ships "good enough" | Market | 2 | 2 | Differentiate on measured quality, honesty, multi-device intent layer; ship fast | Competitor releases |
| R7 | Copyright/ToS exposure from audio handling | Legal | 1 | 3 | No URL ingestion, user uploads only, ≤ 24 h retention, no redistribution; counsel review | Takedown request |
| R8 | Trademark/false-endorsement issues (artists, gear, Valeton) | Legal | 1 | 2 | Descriptive naming, no logos, disclaimers | Complaint |
| R9 | Stem-separation model licences prohibit commercial use | Legal | 2 | 2 | Separation behind a port; licence review before production; commercial API fallback | Licence audit |
| R10 | LLM cost per generation above price anchor | Cost | 2 | 2 | Research cache per song, prompt caching, batch pre-compute, quotas, spend breaker | Median > $0.15 |
| R11 | Uploaded media exploits the decoder | Security | 1 | 3 | Sandboxed ffmpeg, allow-lists, resource limits, patched builds | Security advisory |
| R12 | Next.js runtime weight hurts mobile performance | Technical | 2 | 1 | Measured budgets, lazy result/chart chunks, static marketing pages | Budget exceeded in CI |
| R13 | Demo mode mistaken for real results | Product/Trust | 1 | 2 | Persistent demo marker, fictional data, no files in demo | User feedback |
| R14 | Two-repository contract drift | Technical | 2 | 2 | Contract-first OpenAPI, generated types, CI checks, versioned releases | Type errors after spec change |
| R15 | Solo-developer bandwidth | Delivery | 3 | 2 | Ruthless P0 scope, backend First Loop before web integration, automation | Milestones slipping |
| R16 | Windows SWC native-cache ACL issue blocks Next.js tooling locally | Tooling | 2 | 1 | `SWC_NATIVE_BINDING_CACHE` pointing to a user-private folder (documented in README) | `ERR_SWC_NATIVE_CACHE` |
| R17 | Legal pages published without legal review, or missing entity/contact details | Legal | 2 | 3 | Pages carry a visible "Draft — pending legal review" notice; entity and contact are placeholders; review before the private alpha | Private alpha scheduled |

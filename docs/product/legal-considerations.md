# Legal & Copyright Considerations

**This is not legal advice.** It lists the technical/legal considerations identified during
research, the design choices made to reduce exposure, and the questions that need review by a
qualified lawyer before public launch. Jurisdiction matters (EU vs US vs elsewhere) and is not yet
decided.

## 1. Considerations

| Area | Consideration | Design choice | Needs legal review |
|---|---|---|---|
| **Song audio** | Songs and sound recordings are copyrighted. Downloading, storing or redistributing them may infringe reproduction rights; "analysis" does not automatically make copying lawful. | No automatic acquisition of songs. Users upload short excerpts they attest they have the right to use; processing only; raw audio deleted ≤ 24 h; only non-reversible derived features kept; nothing redistributed. | Yes — scope of user-upload processing, attestation wording, text-and-data-mining exceptions (e.g. EU DSM Directive arts. 3–4 and rights-holder opt-outs), US fair use. |
| **YouTube** | YouTube Terms prohibit downloading content except where expressly permitted; circumventing technical measures may raise anti-circumvention issues. | Not supported. No `yt-dlp` or equivalent anywhere in the product. | Only if URL input is ever reconsidered. |
| **Spotify** | Developer Terms prohibit using Spotify content to train or be ingested into ML/AI models; audio-features/analysis endpoints were closed to new apps (Nov 2024). | Not used for audio. Metadata only if ever needed, under its terms. | If Spotify metadata is used. |
| **Song metadata** | Titles/artists are facts; lyrics and tabs are copyrighted. | Use MusicBrainz (CC0 core data); never display lyrics; no scraped tabs. | Low. |
| **Artist names** | Using names to describe "tone inspired by X" is common; implying endorsement is not OK. | Neutral wording ("reference: …"), no artist imagery, no "official" claims, disclaimer of non-affiliation. | Yes — false endorsement/right of publicity varies by jurisdiction. |
| **Gear trademarks** | Marshall, Fender, Vox… are trademarks; Valeton itself uses renamed models ("UK 800"). | Nominative, descriptive use only ("based on"), no logos; follow the device's own naming in presets. | Yes — review of UI copy and marketing. |
| **Valeton ecosystem** | Using Valeton's name, file format and Suite metadata for interoperability. | Describe as "compatible with"; no Valeton logos; not affiliated. Catalog generated locally from the user's own Suite installation; Valeton's JSON not redistributed; our semantics layer is original work. | Yes — interoperability reverse-engineering (e.g. EU Software Directive 2009/24/EC art. 6; US DMCA §1201(f)), Suite EULA terms. |
| **Community reverse engineering** | GP-180 RE repository is GPL-3.0; GP-150 spec gist has no stated license; our repo is Apache-2.0. | Clean-room policy: we use facts (formats are not copyrightable expression) and our own verification; we do not copy code, generated tables or dumps. See ADR-009. | Low–medium. |
| **Factory presets** | Valeton's factory presets are likely their copyrighted content. | Used only locally as private test fixtures, never committed or redistributed; our generated presets are not derived copies. | Low. |
| **Stem separation models** | Model weights have their own licenses; several popular community weights are non-commercial; training data (e.g. MUSDB18) may be research-only. | Separation behind a port; production adapter chosen only after license check; commercial API as alternative. | Yes. |
| **NAM captures (future)** | Captures on TONE3000 carry creator-chosen terms. | Out of MVP; if used, respect per-capture license and attribution. | When introduced. |
| **User-generated presets & sharing (future)** | Hosting user content → notice-and-takedown process, terms of service. | Not in MVP (no public sharing). | When introduced. |
| **Privacy** | Accounts, recordings (can contain voices), analytics. | Data minimisation, short audio retention, deletion on request, privacy policy, DPA with processors (LLM provider, hosting). GDPR if EU users. | Yes. |
| **LLM outputs about real people** | Hallucinated gear claims about artists. | Evidence-required claims, "unknown" allowed, correction channel. | Low. |

## 2. Architecture principles that follow

1. **Don't acquire** copyrighted audio on the user's behalf.
2. **Don't retain** raw audio beyond processing.
3. **Don't redistribute** audio or third-party preset content.
4. **Derive, don't copy**: store features and our own settings, not reproductions.
5. **Attribute and hedge**: sources for claims, neutral descriptive naming.
6. **Isolate risky adapters** (separation models, future URL ingestion) behind ports so they can be
   swapped or disabled without touching the core.

## 3. Open questions for counsel

1. Is processing user-uploaded excerpts for feature extraction acceptable in our target markets,
   and what terms/attestation are needed?
2. Is generating a Suite-compatible file and extracting Valeton Suite metadata locally for
   interoperability permitted under the Suite EULA and applicable law?
3. Naming guidelines for artist/song references and gear models in the UI and in preset names.
4. Obligations if we later host a public preset library.

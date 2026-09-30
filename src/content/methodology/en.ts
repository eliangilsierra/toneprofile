import type { LongformDoc } from "../types";

const doc: LongformDoc = {
  title: "How ToneProfile works",
  description: "What ToneProfile measures, how it grades evidence, where AI is used and what it can't do.",
  eyebrow: "Methodology",
  lede: "ToneProfile turns a song into a preset for your device. This page explains every step, what each number means and where the limits are — so you can judge a result instead of trusting it.",
  updated: "2026-09-30",
  draft: false,
  sections: [
    {
      id: "overview",
      title: "The short version",
      blocks: [
        {
          kind: "p",
          text: "You pick a song and, if you want, upload a short excerpt you have the right to use. ToneProfile researches the gear documented for that recording, measures the excerpt, describes the tone in device-independent terms and then solves settings for your device. Every claim carries an evidence level and every setting can be traced back to why it was chosen.",
        },
        {
          kind: "p",
          text: "Nothing is copied from a song: ToneProfile reconstructs a tone from evidence. Want to see complete results first? Browse the [examples](/examples).",
        },
      ],
    },
    {
      id: "pipeline",
      title: "From a song to a preset",
      blocks: [
        { kind: "p", text: "A result is built in four layers. Each layer has one job, and you can inspect all of them on the result page." },
        {
          kind: "list",
          ordered: true,
          items: [
            "Reference — the exact recording you chose and, optionally, the passage of your excerpt (5 to 90 seconds).",
            "Evidence — what is known about the tone: gear claims found in sources and measurements taken from your excerpt, each with its provenance.",
            "Tone profile — what we're trying to achieve, independent of any device: the signal chain as roles (drive, amp, cab, delay…), sound archetypes and perceptual targets such as saturation, brightness or ambience.",
            "Device patch — how your device does it: concrete models and values for each module, checked against the device's catalogue.",
          ],
        },
        {
          kind: "p",
          text: "The analysis screen shows the real pipeline steps as they happen — song, audio, research, tone profile, mapping, validation and preset. There are no progress percentages: a step only advances when the work behind it is done.",
        },
      ],
    },
    {
      id: "measurements",
      title: "What we measure in your excerpt",
      blocks: [
        { kind: "p", text: "An excerpt is optional, but it's the strongest evidence we can get. From it we measure:" },
        {
          kind: "list",
          items: [
            "Guitar isolation — the guitar is separated from the mix, and we report how dominant it was in the passage.",
            "Tone fingerprint — the long-term average spectrum in 1/3-octave bands (80 Hz to 12.5 kHz), grouped into body, warmth, mids, bite and air.",
            "Gain class — clean, edge of breakup, crunch, high gain or fuzz, with its probability.",
            "Ambience — delay time and subdivision, modulation type and rate, and how much reverb is present.",
          ],
        },
        {
          kind: "p",
          text: "Short, busy or heavily compressed passages give weaker measurements, and the result says so. Without an excerpt nothing is measured: targets that would have been measured are marked as inferred and their confidence is lowered.",
        },
      ],
    },
    {
      id: "evidence",
      title: "Evidence levels",
      blocks: [
        { kind: "p", text: "Every gear claim and every block of the tone profile carries one of five levels:" },
        { kind: "evidenceLevels" },
        {
          kind: "p",
          text: "Levels are assigned by rules — the type of source, whether it refers to this specific recording and whether sources agree — not by how confident an AI model sounds. Quotes are checked against their source, and claims whose quote can't be found are removed. When nothing reliable exists, the answer is “unknown”.",
        },
      ],
    },
    {
      id: "confidence",
      title: "What the confidence numbers mean",
      blocks: [
        {
          kind: "p",
          text: "Confidence appears per claim, per block, per perceptual target and overall. It expresses how well-supported that element is by evidence — not the probability that the preset will sound identical to the record.",
        },
        {
          kind: "list",
          items: [
            "Measured targets from a clean excerpt score highest; research-only and inferred elements score lower.",
            "The overall confidence summarises the whole profile. A degraded result — for example, when research found no sources — shows a warning and a lower number.",
            "As we test presets on real hardware, these numbers will be calibrated against how close results actually get.",
          ],
        },
      ],
    },
    {
      id: "ai",
      title: "Where AI is used — and where it isn't",
      blocks: [
        {
          kind: "list",
          items: [
            "A language model reads sources about the recording and extracts gear claims with their quotes.",
            "It drafts the device-independent tone profile, but only with a controlled vocabulary of roles and archetypes and within a fixed schema — it can't invent new gear categories.",
            "It writes the plain-language summary and explanation, in your language.",
          ],
        },
        {
          kind: "p",
          text: "A language model never sets a knob. Device models and parameter values come from a deterministic mapper that solves the tone profile against the device's catalogue, so the same profile always produces the same patch.",
        },
      ],
    },
    {
      id: "device",
      title: "Mapping to the Valeton GP-180",
      blocks: [
        {
          kind: "p",
          text: "Each GP-180 model in our catalogue is tagged with the archetypes it can represent. The mapper chooses models for each role in the chain and solves their settings to meet the perceptual — and, when available, measured — targets. Roles the device can't host are shown in the tone profile, marked as not mapped.",
        },
        { kind: "p", text: "Before a preset is delivered it passes validation:" },
        {
          kind: "list",
          items: [
            "Every model exists on the device and firmware.",
            "Every value is within its range.",
            "The chain order is one the device accepts.",
            "Internal engine settings are consistent.",
            "The output level is safe.",
          ],
        },
        {
          kind: "p",
          text: "Presets are delivered as a file you import with Valeton Suite, plus a printable dial-in sheet with every setting. The sheet always works, even when a file can't be offered.",
        },
      ],
    },
    {
      id: "limits",
      title: "What ToneProfile can't do",
      blocks: [
        {
          kind: "list",
          items: [
            "Your hands, your guitar and your amp are part of the tone. We compensate for pickups and tuning, but a Stratocaster won't become a Les Paul.",
            "Records are produced: double-tracking, mic choice, mixing and mastering shape what you hear. We aim for the guitar's core tone, not the finished mix.",
            "Unknown gear stays unknown. When evidence is thin you get a lower confidence and a clear warning, never a confident guess.",
          ],
        },
      ],
    },
    {
      id: "faq",
      title: "Frequently asked questions",
      blocks: [
        {
          kind: "defs",
          items: [
            {
              term: "Which devices are supported?",
              description: "The Valeton GP-180. The tone profile is device-independent, so more processors can be added later without redoing the analysis.",
            },
            {
              term: "Which audio files can I upload?",
              description: "WAV, FLAC, MP3, M4A or OGG, up to 20 MB and between 5 seconds and 10 minutes long. You choose a passage of 5 to 90 seconds to analyse.",
            },
            {
              term: "Why can't I paste a YouTube or Spotify link?",
              description: "Downloading audio from those services breaks their terms and copies copyrighted recordings. ToneProfile never downloads songs; you upload a short excerpt you're entitled to use.",
            },
            {
              term: "What happens to my audio?",
              description: "It is analysed, the raw audio is deleted within 24 hours and only non-reversible measurements are kept. Details in the [audio & copyright policy](/legal/audio).",
            },
            {
              term: "Why doesn't the demo let me download a preset file?",
              description: "The demo runs a simulated backend. Preset files are produced by the real backend once its file format has been verified on hardware. The dial-in sheet works in the demo.",
            },
            {
              term: "Can I see a complete result before trying?",
              description: "Yes — the [examples](/examples) show finished results, including one where research found nothing.",
            },
          ],
        },
      ],
    },
  ],
};

export default doc;

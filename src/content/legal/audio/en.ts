import type { LongformDoc } from "../../types";

const doc: LongformDoc = {
  title: "Audio & copyright policy",
  description: "What audio you can upload to ToneProfile, what we do with it and how rights holders can reach us.",
  eyebrow: "Legal",
  lede: "ToneProfile never downloads songs. You upload a short excerpt you're entitled to use; we measure it, delete it and keep only the numbers.",
  updated: "2026-09-30",
  draft: true,
  sections: [
    {
      id: "allowed",
      title: "What you can upload",
      blocks: [
        {
          kind: "list",
          items: [
            "Recordings you made yourself, such as your own playing.",
            "Recordings you own or have a licence or permission to use.",
            "Material you're otherwise allowed to analyse under the law where you live.",
          ],
        },
        {
          kind: "p",
          text: "Files can be 5 seconds to 10 minutes long and up to 20 MB. Only the passage you select — 5 to 90 seconds — is analysed.",
        },
      ],
    },
    {
      id: "not-allowed",
      title: "What not to upload",
      blocks: [
        {
          kind: "list",
          items: [
            "Files obtained unlawfully, for example ripped from streaming services.",
            "Recordings of people who haven't agreed to be recorded.",
            "Anything you're not entitled to use.",
          ],
        },
      ],
    },
    {
      id: "processing",
      title: "What we do with your excerpt",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "We separate the guitar from the rest of the mix.",
            "We measure it: spectrum, gain class, delay, modulation and reverb.",
            "We delete the raw audio within 24 hours.",
            "We keep only the measurements, which can't be turned back into the recording.",
          ],
        },
        {
          kind: "p",
          text: "Your audio is never redistributed, published or used to train models without your explicit consent. See also the [privacy policy](/legal/privacy).",
        },
      ],
    },
    {
      id: "links",
      title: "Why there are no YouTube or Spotify links",
      blocks: [
        {
          kind: "p",
          text: "Pulling audio from streaming services breaks their terms and makes a copy of a protected recording. Choosing a song only identifies the recording to research; the audio always comes from you.",
        },
      ],
    },
    {
      id: "research",
      title: "Song research",
      blocks: [
        {
          kind: "p",
          text: "To research gear, ToneProfile reads public sources such as interviews, articles and rig rundowns. Results show short quotes with a link to the original source, and claims whose quote can't be verified are removed. How claims are graded is explained in the [methodology](/methodology#evidence).",
        },
      ],
    },
    {
      id: "report",
      title: "Reporting a problem",
      blocks: [
        {
          kind: "p",
          text: "If you're a rights holder and believe something on ToneProfile infringes your rights, you'll be able to ask us to review and remove it. A dedicated contact address will be published here before the private alpha opens.",
        },
      ],
    },
  ],
};

export default doc;

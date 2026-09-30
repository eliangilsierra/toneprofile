import type { LongformDoc } from "../../types";

const doc: LongformDoc = {
  title: "Privacy policy",
  description: "What data ToneProfile collects, why, for how long, and your rights.",
  eyebrow: "Legal",
  lede: "ToneProfile is designed to collect as little as possible: a short excerpt that is deleted within a day, the song you chose and your feedback. No advertising, no selling data.",
  updated: "2026-09-30",
  draft: true,
  sections: [
    {
      id: "scope",
      title: "Who we are and what this covers",
      blocks: [
        {
          kind: "p",
          text: "ToneProfile is an independent project in development. This policy covers this website and the ToneProfile web app. The name of the entity responsible for your data and a contact address will be published here before the private alpha opens.",
        },
      ],
    },
    {
      id: "demo",
      title: "The current demo",
      blocks: [
        {
          kind: "p",
          text: "The public demo runs a simulated backend inside your browser. The files you choose and the tones you create are not sent to any ToneProfile server: they stay in your browser's local storage, and you can remove them at any time by clearing this site's data.",
        },
      ],
    },
    {
      id: "data",
      title: "What we collect when the service is live",
      blocks: [
        {
          kind: "list",
          items: [
            "Account data — your email address, once accounts are available.",
            "Audio excerpts you upload, for analysis only (see [your audio](#audio)).",
            "What you ask for — the song you chose, your guitar settings and your device.",
            "Results and feedback — tone profiles, presets and the ratings or comments you send.",
            "Technical data — IP address, browser and error logs, used to keep the service secure and working.",
          ],
        },
      ],
    },
    {
      id: "audio",
      title: "Your audio",
      blocks: [
        {
          kind: "p",
          text: "Raw audio is deleted within 24 hours of the analysis. We keep only derived measurements — such as the spectrum, gain class and detected effects — which can't be used to reconstruct the recording. Your audio is never published, shared with other users or used to train models without your explicit consent. More in the [audio & copyright policy](/legal/audio).",
        },
      ],
    },
    {
      id: "purposes",
      title: "Why we use it",
      blocks: [
        {
          kind: "list",
          items: [
            "To run the analysis and deliver your tone profile and preset.",
            "To improve accuracy, using feedback and aggregated measurements.",
            "To keep the service secure and prevent abuse.",
          ],
        },
        { kind: "p", text: "We don't show advertising and we don't sell or rent personal data." },
      ],
    },
    {
      id: "processors",
      title: "Who processes it for us",
      blocks: [
        {
          kind: "p",
          text: "Some providers process data on our instructions: hosting, file storage and the AI language models used to read sources and write explanations. Language models receive song information and research texts, not your audio. The list of providers, and where they process data, will be published before launch and covered by data processing agreements.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and local storage",
      blocks: [
        {
          kind: "p",
          text: "We use one functional cookie, NEXT_LOCALE, to remember your language. There are no advertising or tracking cookies. The demo also uses your browser's local storage to keep your tones between visits.",
        },
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        {
          kind: "list",
          items: [
            "Raw audio: up to 24 hours.",
            "Measurements, tone profiles, presets and feedback: while your account exists, or until you delete them.",
            "Technical logs: for a limited period that will be stated here before launch.",
          ],
        },
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      blocks: [
        {
          kind: "p",
          text: "You can ask to access, correct, export or delete your data, and to object to or restrict its processing. Depending on where you live — for example in the European Union — you may also complain to your data protection authority. We will explain how to exercise these rights, with a contact address, before launch.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          kind: "p",
          text: "When this policy changes we update the date at the top. If a change is significant, we'll tell you in the product before it applies.",
        },
      ],
    },
  ],
};

export default doc;

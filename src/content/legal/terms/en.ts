import type { LongformDoc } from "../../types";

const doc: LongformDoc = {
  title: "Terms of use",
  description: "The rules for using ToneProfile, its results and presets.",
  eyebrow: "Legal",
  lede: "ToneProfile is in development. These terms explain what you can expect from it, what we expect from you and what happens to what you upload.",
  updated: "2026-09-30",
  draft: true,
  sections: [
    {
      id: "status",
      title: "Status of the service",
      blocks: [
        {
          kind: "p",
          text: "ToneProfile is under active development. The public demo runs a simulated analysis with fictional songs and sources. Features may change, pause or be removed, and the service is offered without guarantees of availability.",
        },
      ],
    },
    {
      id: "use",
      title: "Using ToneProfile",
      blocks: [
        { kind: "p", text: "You may use ToneProfile for your own music. Please don't:" },
        {
          kind: "list",
          items: [
            "Upload content you don't have the right to use, or anything unlawful.",
            "Try to disrupt, overload or gain unauthorised access to the service.",
            "Use automated means to extract results at scale.",
          ],
        },
      ],
    },
    {
      id: "content",
      title: "Your content",
      blocks: [
        {
          kind: "p",
          text: "You keep all rights to what you upload. You give us a limited permission to process it only to provide the service, as described in the [privacy policy](/legal/privacy). By uploading audio you confirm you're entitled to use it for analysis; see the [audio & copyright policy](/legal/audio).",
        },
      ],
    },
    {
      id: "results",
      title: "Results and presets",
      blocks: [
        {
          kind: "p",
          text: "Tone profiles and presets are reconstructions based on evidence, provided as they are. They are a starting point to adjust by ear, not a guaranteed copy of a recording. Each result shows how confident it is and why.",
        },
        {
          kind: "p",
          text: "When you try a new preset, start with a low volume on your amp, speakers or headphones.",
        },
      ],
    },
    {
      id: "devices",
      title: "Third-party devices and software",
      blocks: [
        {
          kind: "p",
          text: "ToneProfile is not affiliated with or endorsed by Valeton. Valeton Suite and your device are governed by their own terms. Back up your existing presets before importing new ones; importing files is at your own risk.",
        },
      ],
    },
    {
      id: "ip",
      title: "Open source and trademarks",
      blocks: [
        {
          kind: "p",
          text: "The ToneProfile web app is open source under the Apache-2.0 license. Product, device and artist names are used descriptively and belong to their owners.",
        },
      ],
    },
    {
      id: "liability",
      title: "Liability",
      blocks: [
        {
          kind: "p",
          text: "To the extent the law allows, ToneProfile is not liable for indirect losses arising from the use of the service or its results. Nothing in these terms limits rights you have as a consumer that can't be waived.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes and ending",
      blocks: [
        {
          kind: "p",
          text: "We may update these terms; the date at the top shows the latest version, and significant changes will be announced in the product. You can stop using ToneProfile at any time.",
        },
      ],
    },
  ],
};

export default doc;

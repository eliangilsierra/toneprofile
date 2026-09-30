/*
 * Long-form pages (methodology, legal) are typed content modules, one per locale, rendered by
 * `LongformPage`. Inline links use a tiny markdown subset: `[label](/path)` or `[label](#anchor)`.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "defs"; items: { term: string; description: string }[] }
  /** The five evidence levels, rendered from the shared `Evidence` messages. */
  | { kind: "evidenceLevels" };

export interface Section {
  /** Stable anchor, identical across locales. */
  id: string;
  title: string;
  blocks: Block[];
}

export interface LongformDoc {
  /** Short title for <title> and the page heading. */
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  /** ISO date (YYYY-MM-DD). */
  updated: string;
  /** Legal drafts show a visible "pending legal review" notice. */
  draft: boolean;
  sections: Section[];
}

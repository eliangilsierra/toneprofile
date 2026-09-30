import { describe, expect, it } from "vitest";
import { DOCS } from "./index";
import type { Block, LongformDoc } from "./types";

/** Shape of a document without its prose: what must match between locales. */
function outline(doc: LongformDoc) {
  const block = (item: Block) => {
    switch (item.kind) {
      case "p":
        return { kind: item.kind, links: [...item.text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]) };
      case "list":
        return { kind: item.kind, ordered: Boolean(item.ordered), items: item.items.length };
      case "defs":
        return { kind: item.kind, items: item.items.length };
      default:
        return { kind: item.kind };
    }
  };
  return {
    draft: doc.draft,
    updated: doc.updated,
    sections: doc.sections.map((section) => ({ id: section.id, blocks: section.blocks.map(block) })),
  };
}

describe("long-form content", () => {
  for (const [key, locales] of Object.entries(DOCS)) {
    it(`${key}: English and Spanish have the same structure, anchors and links`, () => {
      expect(outline(locales.es)).toEqual(outline(locales.en));
    });

    it(`${key}: section anchors are unique and in-page links resolve`, () => {
      for (const doc of [locales.en, locales.es]) {
        const ids = doc.sections.map((section) => section.id);
        expect(new Set(ids).size).toBe(ids.length);
        const text = JSON.stringify(doc.sections);
        for (const [, anchor] of text.matchAll(/\]\(#([^)]+)\)/g)) expect(ids).toContain(anchor);
      }
    });
  }

  it("legal documents are marked as drafts until reviewed", () => {
    expect([DOCS.privacy.en, DOCS.terms.en, DOCS.audio.en].every((doc) => doc.draft)).toBe(true);
  });
});

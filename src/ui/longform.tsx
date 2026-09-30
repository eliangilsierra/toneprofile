import { useFormatter, useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import type { Block, LongformDoc } from "@/content/types";
import { Link } from "@/i18n/navigation";
import type { EvidenceLevel } from "@/lib/api/types";
import { EvidenceGlyph } from "./evidence-mark";
import { Info } from "./icons";

const LEVELS: EvidenceLevel[] = ["confirmed", "reported", "likely", "inferred", "unknown"];
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const linkClass = "text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink";

/** Renders text with `[label](href)` links: internal paths are locale-aware, "#…" stays in page. */
function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match as unknown as [string, string, string];
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(
      href.startsWith("/") ? (
        <Link key={index} href={href} className={linkClass}>
          {label}
        </Link>
      ) : (
        <a key={index} href={href} className={linkClass}>
          {label}
        </a>
      ),
    );
    last = index + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function EvidenceLevels() {
  const te = useTranslations("Evidence");
  return (
    <dl className="divide-y divide-line rounded-md border border-line">
      {LEVELS.map((level) => (
        <div key={level} className="grid gap-2 p-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-ink">
            <EvidenceGlyph level={level} className="size-3" />
            {te(`levels.${level}`)}
          </dt>
          <dd className="text-ink-muted">{te(`descriptions.${level}`)}</dd>
        </div>
      ))}
    </dl>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return (
        <p className="leading-relaxed text-ink-muted">
          <Rich text={block.text} />
        </p>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={`flex flex-col gap-2 pl-5 leading-relaxed text-ink-muted ${block.ordered ? "list-decimal" : "list-disc"} marker:text-ink-faint`}>
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              <Rich text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "defs":
      return (
        <dl className="flex flex-col gap-5">
          {block.items.map((item) => (
            <div key={item.term}>
              <dt className="font-medium text-ink">{item.term}</dt>
              <dd className="mt-1 leading-relaxed text-ink-muted">
                <Rich text={item.description} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "evidenceLevels":
      return <EvidenceLevels />;
  }
}

/** Static long-form page: heading, optional draft notice, table of contents and sections. */
export function LongformPage({ doc }: { doc: LongformDoc }) {
  const t = useTranslations("Longform");
  const format = useFormatter();
  const updated = format.dateTime(new Date(`${doc.updated}T12:00:00Z`), { dateStyle: "long" });

  return (
    <main id="content" className="mx-auto w-full max-w-[88rem] px-5 pb-24 pt-12 md:px-8 md:pt-20">
      <header className="max-w-3xl">
        <p className="label !text-signal">{doc.eyebrow}</p>
        <h1 className="mt-4 font-serif text-headline">{doc.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">{doc.lede}</p>
        <p className="mt-4 font-mono text-xs text-ink-faint">
          <time dateTime={doc.updated}>{t("updated", { date: updated })}</time>
        </p>
        {doc.draft && (
          <div role="note" className="mt-6 flex items-start gap-3 rounded-md border border-warn/40 bg-surface-1 p-4">
            <Info className="mt-0.5 shrink-0 text-warn" />
            <div>
              <p className="font-medium text-ink">{t("draftTitle")}</p>
              <p className="mt-1 text-sm text-ink-muted">{t("draftBody")}</p>
            </div>
          </div>
        )}
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={t("toc")} className="lg:sticky lg:top-24 lg:self-start">
          <p className="label">{t("toc")}</p>
          <ol className="mt-3 flex flex-col gap-2 border-l border-line pl-4 text-sm">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-ink-muted transition-colors hover:text-ink">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex max-w-3xl flex-col gap-14">
          {doc.sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id} className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="mt-5 flex flex-col gap-5">
                {section.blocks.map((block, index) => (
                  <Fragment key={index}>
                    <BlockView block={block} />
                  </Fragment>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

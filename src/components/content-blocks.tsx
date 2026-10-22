import type { ReactNode } from "react";
import { resolve } from "@/lib/content";
import type { Block } from "@/lib/content";

/**
 * Renders a content `block` list (from content/pages/*.txt legal pages) into
 * the styled `<h2> / <p> / <ul>` markup LegalLayout expects.
 *
 * Inline markup supported in text and bullets:
 *   **bold**            -> <strong>bold</strong>
 *   [label](url)        -> <a href="url">label</a>  (mailto:, http(s), or internal path)
 *
 * `{email}` / `{phone}` / `{name}` tokens are resolved first via `resolve()`.
 */

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const close = token.indexOf("](");
      const label = token.slice(1, close);
      const url = token.slice(close + 2, -1);
      nodes.push(
        <a key={key++} href={url}>
          {label}
        </a>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function ContentBlocks({
  blocks,
}: {
  blocks: Record<string, unknown>;
}) {
  return (
    <>
      {Object.values(blocks).map((raw, i) => {
        const b = (raw ?? {}) as Partial<Block>;
        const kind = b.kind === "ul" || b.kind === "h2" ? b.kind : "p";
        if (kind === "h2") {
          return <h2 key={i}>{resolve(b.text)}</h2>;
        }
        if (kind === "ul") {
          const items = Object.values((b.item ?? {}) as Record<string, string>);
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{renderInline(resolve(item))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(resolve(b.text))}</p>;
      })}
    </>
  );
}

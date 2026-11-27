import { WrapTextIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { highlightLines, type Language, languageOf, tokenClass } from "../lib/highlight";
import { cn } from "../lib/utils";
import { CopyButton } from "./copy-button";

/*
 * Read-only code: snippets, stack trace context, payloads. Light syntax
 * colouring (lib/highlight), line numbers that can start anywhere (a slice
 * of a file), highlighted lines, an optional header with the file name, a
 * copy button and a wrap toggle. Long blocks scroll inside `maxHeight`.
 *
 *   <CodeBlock code={snippet} language="ts" />
 *   <CodeBlock code={context} filename="src/api/client.ts" startLine={40} highlight={[44]} />
 */

export function CodeBlock({
  code,
  language,
  filename,
  title,
  startLine = 1,
  highlight = [],
  lineNumbers = true,
  wrap: wrapProp,
  copy = true,
  maxHeight,
  actions,
  className,
  ...props
}: Omit<ComponentProps<"figure">, "title"> & {
  code: string;
  /** Defaults to the file name's extension; "plain" turns colouring off. */
  language?: Language;
  /** Shown in the header (and picks the language). */
  filename?: string;
  /** Header text when there is no file name. */
  title?: ReactNode;
  /** Number of the first line (for a slice of a file). */
  startLine?: number;
  /** Line numbers (as shown, i.e. counting from startLine) to emphasise. */
  highlight?: number[];
  lineNumbers?: boolean;
  /** Wraps long lines; without it a toggle appears in the header. */
  wrap?: boolean;
  copy?: boolean;
  /** CSS max-height of the scrolling area, e.g. "20rem". */
  maxHeight?: string;
  /** Extra header buttons. */
  actions?: ReactNode;
}) {
  const lang = language ?? languageOf(filename);
  const lines = useMemo(() => highlightLines(code.replace(/\n$/, ""), lang), [code, lang]);
  const [wrapState, setWrapState] = useState(false);
  const wrap = wrapProp ?? wrapState;
  const marked = new Set(highlight);
  const head = filename ?? title;
  const last = startLine + lines.length - 1;

  return (
    <figure
      data-slot="code-block"
      className={cn(
        "group/code relative min-w-0 overflow-hidden rounded-lg border bg-(--code-bg)",
        className,
      )}
      {...props}
    >
      {head || actions ? (
        <figcaption className="flex min-h-9 items-center gap-2 border-b py-1 pr-1 pl-3 text-xs">
          <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">{head}</span>
          {actions}
          {wrapProp === undefined ? (
            <button
              type="button"
              aria-pressed={wrap}
              aria-label="Satırları kaydır"
              title="Satırları kaydır"
              onClick={() => setWrapState((w) => !w)}
              className="grid size-7 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) aria-pressed:bg-(--surface-active) aria-pressed:text-foreground"
            >
              <WrapTextIcon className="size-4" />
            </button>
          ) : null}
          {copy ? <CopyButton value={code} label="Kodu kopyala" /> : null}
        </figcaption>
      ) : copy ? (
        <div className="absolute top-1.5 right-1.5 z-10 rounded-md bg-(--code-bg) opacity-0 transition-opacity duration-(--duration-fast) group-hover/code:opacity-100 group-focus-within/code:opacity-100 max-md:opacity-100">
          <CopyButton value={code} label="Kodu kopyala" />
        </div>
      ) : null}
      <div className="overflow-auto overscroll-contain" style={maxHeight ? { maxHeight } : undefined}>
        <pre
          className={cn(
            "min-w-full py-2.5 font-mono text-[0.8125rem] leading-6",
            wrap ? "whitespace-pre-wrap break-all" : "w-max whitespace-pre",
          )}
        >
          <code>
            {lines.map((tokens, i) => {
              const n = startLine + i;
              const hl = marked.has(n);
              return (
                <span
                  // Lines are static: the index is their identity.
                  // biome-ignore lint/suspicious/noArrayIndexKey: see above.
                  key={i}
                  data-highlighted={hl || undefined}
                  className={cn(
                    "flex border-l-2 border-transparent pr-4",
                    hl && "border-(--code-line-hl-border) bg-(--code-line-hl)",
                  )}
                >
                  {lineNumbers ? (
                    <span
                      aria-hidden
                      // Opaque, so code scrolled sideways passes under it.
                      className={cn(
                        "sticky left-0 shrink-0 select-none bg-(--code-bg) pr-4 pl-3 text-right text-(--code-gutter) tabular",
                        hl &&
                          "bg-[linear-gradient(var(--code-line-hl),var(--code-line-hl)),linear-gradient(var(--code-bg),var(--code-bg))] text-foreground",
                      )}
                      style={{ width: `calc(${String(last).length}ch + 1.75rem)` }}
                    >
                      {n}
                    </span>
                  ) : (
                    <span className="w-3 shrink-0" />
                  )}
                  <span className="min-w-0">
                    {tokens.length === 0 ? "\n" : null}
                    {tokens.map((t, j) =>
                      t.kind === "plain" ? (
                        t.text
                      ) : (
                        // biome-ignore lint/suspicious/noArrayIndexKey: tokens are static per line.
                        <span key={j} className={tokenClass[t.kind]}>
                          {t.text}
                        </span>
                      ),
                    )}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </figure>
  );
}

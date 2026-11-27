/*
 * A small syntax highlighter for code shown in the UI (stack trace context,
 * snippets, payloads). It is not a parser: it splits text into comments,
 * strings, numbers, keywords, literals and the rest, which is enough to make
 * code easy to scan without shipping a grammar library. Tokens never span
 * lines, so callers can render line by line (block comments and multi-line
 * strings are coloured per line, as far as they can tell).
 */

export type TokenKind = "comment" | "string" | "number" | "keyword" | "literal" | "type" | "plain";
export type Token = { kind: TokenKind; text: string };
export type Language = "plain" | "js" | "ts" | "json" | "csharp" | "python" | "bash" | "go" | "sql";

const keywords: Record<Exclude<Language, "plain" | "json">, string> = {
  js: "async await break case catch class const continue debugger default delete do else export extends finally for from function if import in instanceof let new of return static super switch this throw try typeof var void while with yield",
  ts: "abstract as async await break case catch class const continue declare default delete do else enum export extends finally for from function if implements import in infer instanceof interface keyof let namespace new of private protected public readonly return satisfies static super switch this throw try type typeof var void while yield",
  csharp:
    "abstract as async await base break case catch class const continue default delegate do else enum event explicit extern finally fixed for foreach get goto if implicit in init interface internal is lock namespace new operator out override params private protected public readonly record ref return sealed set sizeof static struct switch this throw try typeof unchecked unsafe using var virtual void volatile when where while yield",
  python:
    "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield",
  bash: "case do done elif else esac export fi for function if in local return then until while",
  go: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var",
  sql: "add all alter and as asc between by case create delete desc distinct drop else end exists from group having in index inner insert into is join left like limit not null offset on or order outer primary references right select set table then union update values when where with",
};

const literals = new Set(["true", "false", "null", "undefined", "nil", "None", "True", "False", "NaN"]);

const keywordSets = new Map<Language, Set<string>>();
function keywordSet(lang: Language): Set<string> {
  let set = keywordSets.get(lang);
  if (!set) {
    const list = lang === "plain" || lang === "json" ? "" : keywords[lang];
    set = new Set(lang === "sql" ? list.split(" ").flatMap((k) => [k, k.toUpperCase()]) : list.split(" "));
    keywordSets.set(lang, set);
  }
  return set;
}

/** Maps file extensions and common names to a Language. */
export function languageOf(name: string | undefined | null): Language {
  const ext = (name ?? "").toLowerCase().split(/[./]/).pop() ?? "";
  switch (ext) {
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
    case "javascript":
      return "js";
    case "ts":
    case "tsx":
    case "typescript":
      return "ts";
    case "json":
      return "json";
    case "cs":
    case "csharp":
      return "csharp";
    case "py":
    case "python":
      return "python";
    case "sh":
    case "bash":
    case "zsh":
    case "shell":
      return "bash";
    case "go":
      return "go";
    case "sql":
      return "sql";
    default:
      return "plain";
  }
}

const lineComment: Partial<Record<Language, string>> = {
  js: "//",
  ts: "//",
  csharp: "//",
  go: "//",
  python: "#",
  bash: "#",
  sql: "--",
};

const blockComments = new Set<Language>(["js", "ts", "csharp", "go", "sql"]);

/** Splits one line into tokens; `inBlock` carries an open block comment from the previous line. */
function tokenizeLine(line: string, lang: Language, inBlock: boolean): { tokens: Token[]; inBlock: boolean } {
  const tokens: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    if (!text) return;
    const last = tokens.at(-1);
    if (last && last.kind === kind) last.text += text;
    else tokens.push({ kind, text });
  };
  if (lang === "plain") return { tokens: [{ kind: "plain", text: line }], inBlock: false };
  const kw = keywordSet(lang);
  const comment = lineComment[lang];
  let i = 0;
  if (inBlock) {
    const end = line.indexOf("*/");
    if (end < 0) return { tokens: [{ kind: "comment", text: line }], inBlock: true };
    push("comment", line.slice(0, end + 2));
    i = end + 2;
    inBlock = false;
  }
  while (i < line.length) {
    const rest = line.slice(i);
    const ch = line[i];
    if (comment && rest.startsWith(comment)) {
      push("comment", rest);
      break;
    }
    if (blockComments.has(lang) && rest.startsWith("/*")) {
      const end = line.indexOf("*/", i + 2);
      if (end < 0) {
        push("comment", rest);
        inBlock = true;
        break;
      }
      push("comment", line.slice(i, end + 2));
      i = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j += line[j] === "\\" ? 2 : 1;
      const text = line.slice(i, Math.min(j + 1, line.length));
      // JSON keys read better as names than as strings.
      const isKey = lang === "json" && /^\s*:/.test(line.slice(j + 1));
      push(isKey ? "type" : "string", text);
      i += text.length;
      continue;
    }
    const num = /^-?(?:0x[\da-f]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)[a-z]*/i.exec(rest);
    if (num && (i === 0 || !/[\w$]/.test(line[i - 1]))) {
      push("number", num[0]);
      i += num[0].length;
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(rest);
    if (word) {
      const w = word[0];
      if (literals.has(w)) push("literal", w);
      else if (kw.has(w)) push("keyword", w);
      // Capitalised names (types, classes) in typed languages.
      else if (/^[A-Z][a-z]/.test(w) && lang !== "bash" && lang !== "sql") push("type", w);
      else push("plain", w);
      i += w.length;
      continue;
    }
    push("plain", ch);
    i += 1;
  }
  return { tokens, inBlock };
}

/** Tokens per line. */
export function highlightLines(code: string, lang: Language): Token[][] {
  const out: Token[][] = [];
  let inBlock = false;
  for (const line of code.split("\n")) {
    const result = tokenizeLine(line, lang, inBlock);
    out.push(result.tokens);
    inBlock = result.inBlock;
  }
  return out;
}

/** Tailwind classes per token kind (token colours from tokens.css). */
export const tokenClass: Record<TokenKind, string> = {
  comment: "text-(--code-comment) italic",
  string: "text-(--code-string)",
  number: "text-(--code-number)",
  keyword: "text-(--code-keyword)",
  literal: "text-(--code-number)",
  type: "text-(--code-type)",
  plain: "",
};

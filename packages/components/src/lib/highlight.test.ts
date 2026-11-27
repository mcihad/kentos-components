import { describe, expect, it } from "vitest";
import { highlightLines, languageOf } from "./highlight";

const kinds = (line: string, lang: Parameters<typeof highlightLines>[1]) =>
  highlightLines(line, lang)[0]
    .filter((t) => t.kind !== "plain")
    .map((t) => `${t.kind}:${t.text}`);

describe("languageOf", () => {
  it("maps extensions and names", () => {
    expect(languageOf("src/api/client.ts")).toBe("ts");
    expect(languageOf("Program.cs")).toBe("csharp");
    expect(languageOf("app.py")).toBe("python");
    expect(languageOf("data.json")).toBe("json");
    expect(languageOf("README")).toBe("plain");
    expect(languageOf(undefined)).toBe("plain");
  });
});

describe("highlightLines", () => {
  it("colours keywords, strings, numbers and comments", () => {
    expect(kinds('const n = 42; // "x"', "ts")).toEqual(["keyword:const", "number:42", 'comment:// "x"']);
    expect(kinds("if x is None: return 'a'", "python")).toEqual([
      "keyword:if",
      "keyword:is",
      "literal:None",
      "keyword:return",
      "string:'a'",
    ]);
  });

  it("keeps escaped quotes inside strings", () => {
    expect(kinds('var s = "a\\"b";', "csharp")).toEqual(["keyword:var", 'string:"a\\"b"']);
  });

  it("marks JSON keys apart from string values", () => {
    expect(kinds('{"id": "abc", "n": 1, "ok": true}', "json")).toEqual([
      'type:"id"',
      'string:"abc"',
      'type:"n"',
      "number:1",
      'type:"ok"',
      "literal:true",
    ]);
  });

  it("carries block comments across lines", () => {
    const lines = highlightLines("a /* start\nstill\nend */ b", "js");
    expect(lines[1]).toEqual([{ kind: "comment", text: "still" }]);
    expect(lines[2][0]).toEqual({ kind: "comment", text: "end */" });
  });

  it("does not read digits inside names as numbers", () => {
    expect(kinds("value2 = x1", "python")).toEqual([]);
  });

  it("leaves plain text alone", () => {
    expect(highlightLines("if 1", "plain")).toEqual([[{ kind: "plain", text: "if 1" }]]);
  });
});

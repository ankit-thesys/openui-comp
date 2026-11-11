import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

/*
 * A lint for the library's css-tag styles, not a test of their contents. goober splits every
 * selector at its commas, even inside :is(), :not() or :has(), and so turns
 * `:is(.a, .b).c > span` into a descendant selector and `:not(:has(a, b))` into an invalid one
 * the browser drops. Group tickets port more of his stylesheet, so this catches it at the source.
 */
const src = join(import.meta.dirname, "../../packages/libraries/dashboard-next/src");

function styleFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return styleFiles(path);
    return /\.tsx?$/.test(entry.name) && readFileSync(path, "utf8").includes("css`") ? [path] : [];
  });
}

/** Selectors in a css`` block with a comma inside parentheses. */
function commaInParens(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const found: string[] = [];
  for (const block of text.matchAll(/css`([\s\S]*?)`/g)) {
    const body = block[1]!.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const rule of body.matchAll(/([^{};]+)\{/g)) {
      const selector = rule[1]!.trim();
      if (selector.startsWith("@")) continue;
      let depth = 0;
      for (const char of selector) {
        if (char === "(") depth++;
        else if (char === ")") depth--;
        else if (char === "," && depth > 0) {
          found.push(`${file.slice(src.length + 1)}: ${selector.replace(/\s+/g, " ")}`);
          break;
        }
      }
    }
  }
  return found;
}

test("no css-tag selector puts a comma inside parentheses", () => {
  const files = styleFiles(src);
  expect(files.length).toBeGreaterThan(0);
  expect(files.flatMap(commaInParens)).toEqual([]);
});

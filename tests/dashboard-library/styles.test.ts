import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

/*
 * A lint for the library's css-tag styles, not a test of their contents. goober mis-scopes two
 * kinds of selector, and the browser then drops the rule or applies it to nothing:
 * - a comma inside parentheses: it splits selectors at every comma, so `:is(.a, .b).c > span`
 *   becomes a descendant selector and `:not(:has(a, b))` an invalid one;
 * - anything after a ")": it inserts its class there, so `.a:has(.b) .c` compiles to
 *   `.go1 .a:has(.b).go1 .c`, and `:not(:has(a))` to `:not(:has(a).go1 )`.
 * So a functional pseudo-class (:has(), :not(), :nth-child()…) may only end a selector, and
 * holds no comma. Group tickets port more of his stylesheet; this catches it at the source.
 */
const src = join(import.meta.dirname, "../../packages/libraries/dashboard/src");

function styleFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return styleFiles(path);
    return entry.name.endsWith(".styles.ts") ||
      (/\.tsx?$/.test(entry.name) && readFileSync(path, "utf8").includes("css`"))
      ? [path]
      : [];
  });
}

/** Selectors in a css`` block that goober mis-scopes (see above). */
function misScoped(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const found: string[] = [];
  for (const block of text.matchAll(/(?:css|String\.raw)`([\s\S]*?)`/g)) {
    const body = block[1]!.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const rule of body.matchAll(/([^{};]+)\{/g)) {
      const selector = rule[1]!.trim();
      if (selector.startsWith("@")) continue;
      let depth = 0;
      let part = "";
      const flag = () =>
        found.push(`${file.slice(src.length + 1)}: ${selector.replace(/\s+/g, " ")}`);
      for (const char of `${selector},`) {
        if (char === "(") depth++;
        else if (char === ")") depth--;
        if (char === "," && depth > 0) {
          flag();
          break;
        }
        if (char === "," && depth === 0) {
          // One selector of a list: its only ")" may be its last character.
          const text = part.trim();
          const close = text.indexOf(")");
          if (close !== -1 && close !== text.length - 1) {
            flag();
            break;
          }
          part = "";
        } else part += char;
      }
    }
  }
  return found;
}

test("no css-tag selector is one goober mis-scopes", () => {
  const files = styleFiles(src);
  expect(files.length).toBeGreaterThan(0);
  expect(files.flatMap(misScoped)).toEqual([]);
});

// Tracks the move to hook-free styling (ADR 0002): no file may start using the old API, and every
// file still on it is listed in old-styling-api.json. Converting a file means removing it from the
// list, so the list only shrinks; when it is empty, the old API itself must be gone.
import { library } from "#paths";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const listPath = fileURLToPath(new URL("../old-styling-api.json", import.meta.url));
const devRoot = join(dirname(listPath), "..");
const repoRoot = join(library(), "../..");

// Each marker names one piece of the old API. Comments count: a doc comment that still teaches
// the old API is a leftover too.
const markers: Record<string, RegExp> = {
  useStyles: /\buseStyles\b/,
  StyleFactory: /\bStyleFactory\b/,
  StyleCss: /\bStyleCss\b/,
  CssLayerContext: /\bCssLayerContext\b/,
  cssLayer: /\bcssLayer\b/,
  // A style factory: a module-level function that receives `css` instead of importing it.
  factory: /=\s*\(\s*css\s*(?::[^)]*)?\)\s*=>/,
};

const scanned = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return ["node_modules", "dist", "test-results", "playwright-report", ".fixtures"].includes(
        entry.name,
      )
        ? []
        : scanned(path);
    }
    return /\.([cm]?[jt]sx?|md)$/.test(entry.name) ? [path] : [];
  });

// Shipped source and docs, plus the fork's tests, fixtures and docs. Not this guard itself, and
// not ADRs and specs, which record the old API on purpose.
const files = [
  ...scanned(library("src")),
  library("README.md"),
  ...scanned(join(devRoot, "test")),
  join(devRoot, "README.md"),
].filter((path) => path !== fileURLToPath(import.meta.url));

const usages = new Map(
  files
    .map((path) => {
      const text = readFileSync(path, "utf8");
      const found = Object.keys(markers).filter((name) => markers[name]!.test(text));
      return [relative(repoRoot, path), found] as const;
    })
    .filter(([, found]) => found.length > 0),
);

const listed: string[] = JSON.parse(readFileSync(listPath, "utf8"));

describe("old styling API", () => {
  it("is used only by the files still listed for conversion", () => {
    const unlisted = [...usages.keys()].filter((file) => !listed.includes(file));
    expect(unlisted, "new use of the old styling API; use the public css instead").toEqual([]);
  });

  it("is still used by every listed file, so converted files leave the list", () => {
    const converted = listed.filter((file) => !usages.has(file));
    expect(converted, "remove these from test/old-styling-api.json").toEqual([]);
  });

  it.runIf(listed.length === 0)("is gone once every file is converted", () => {
    expect(existsSync(library("src/styles/useStyles.ts"))).toBe(false);
  });
});

// Only the styling infrastructure may import Goober (ADR 0002).
import { library } from "#paths";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, it } from "vitest";

const packageRoot = library();
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [relative(packageRoot, path)] : [];
  });
// Any import, re-export, side-effect import or require of goober or one of its entry points, such
// as goober/global.
const importsGoober = (file: string) =>
  /\b(?:from|import)\s*["']goober(?:\/[\w-]+)?["']|\b(?:require|import)\(\s*["']goober(?:\/[\w-]+)?["']\s*\)/.test(
    readFileSync(join(packageRoot, file), "utf8"),
  );

it("imports Goober only in the styling infrastructure", () => {
  expect(sourceFiles(join(packageRoot, "src")).filter(importsGoober).sort()).toEqual([
    "src/styles/css.ts", // component rule store and public styling API
  ]);
});

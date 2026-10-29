// Only the styling infrastructure imports Goober. Components get `css` from `useStyles`, so their
// rules register at render, honour `cssLayer` and stay under the contract checks; a direct import
// could register CSS on a path no contract element renders (ADR 0001, Q2 and Q27).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [relative(packageRoot, path)] : [];
  });
// Any import or require of goober or one of its entry points, such as goober/global.
const importsGoober = (file: string) =>
  /\bfrom\s*["']goober(?:\/[\w-]+)?["']|\b(?:require|import)\(\s*["']goober(?:\/[\w-]+)?["']\s*\)/.test(
    readFileSync(join(packageRoot, file), "utf8"),
  );

it("imports Goober only in the styling infrastructure", () => {
  expect(sourceFiles(join(packageRoot, "src")).filter(importsGoober).sort()).toEqual([
    "src/styles/defaults.ts", // theme token defaults on <html> (ADR 0001, Q29)
    "src/styles/useStyles.ts", // hands Goober's css to components at render
    "src/utils/componentStyles.ts", // getComponentStyles(): reads the sheet, registers nothing
  ]);
});

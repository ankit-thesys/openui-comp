// Guards migration progress. A source module still on the old styling (it imports Goober and
// registers CSS itself, usually behind an <html> class) must be on the allowlist, and a module on
// the allowlist must still be unmigrated, so the list only ever shrinks. Release gate: empty list.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { migratedComponents, sharedStyleContracts } from "./components";

const packageRoot = fileURLToPath(new URL("../../../", import.meta.url));
const allowlist: string[] = JSON.parse(
  readFileSync(new URL("../../flat-allowlist.json", import.meta.url), "utf8"),
);

// Modules that use Goober by design and never migrate.
const EXEMPT = new Set([
  "src/styles/defaults.ts", // theme token defaults on <html> (ADR 0001, Q5)
  "src/styles/useStyles.ts", // the hook that hands Goober's css to migrated components
  "src/utils/componentStyles.ts", // getComponentStyles(): reads the sheet, registers nothing
]);

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [relative(packageRoot, path)] : [];
  });

const files = sourceFiles(join(packageRoot, "src"));
const read = (file: string) => readFileSync(join(packageRoot, file), "utf8");
// Any import or require of goober or one of its entry points, such as goober/global.
const usesGoober = (file: string) =>
  /\bfrom\s*["']goober(?:\/[\w-]+)?["']|\brequire\(\s*["']goober(?:\/[\w-]+)?["']\s*\)/.test(
    read(file),
  );

describe("flat-styles migration allowlist", () => {
  it("lists every module still on the old styling", () => {
    const unlisted = files.filter(
      (file) => usesGoober(file) && !EXEMPT.has(file) && !allowlist.includes(file),
    );
    expect(unlisted).toEqual([]);
  });

  it("lists no module that is already migrated or gone", () => {
    const stale = allowlist.filter((file) => !files.includes(file) || !usesGoober(file));
    expect(stale).toEqual([]);
  });

  it("checks every component that exports stable names in the contract test", () => {
    const withNames = [
      ...new Set(
        files
          .filter((file) => /^export const names\b/m.test(read(file)))
          .map(
            (file) =>
              sharedStyleContracts.find((entry) => entry.module === file)?.folder ??
              file.split("/")[2],
          ),
      ),
    ];
    expect(withNames.sort()).toEqual(
      [...migratedComponents, ...sharedStyleContracts].map(({ folder }) => folder).sort(),
    );
  });
});

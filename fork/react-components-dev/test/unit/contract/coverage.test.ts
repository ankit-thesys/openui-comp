// Guards the contract's reach: every component folder that registers styles or exports stable names
// has an entry in components.tsx (or a shared style contract), every built names-exporting style
// module is covered by an entry's own names, and every entry has its own contract test file, so it
// is checked in a fresh module graph (see defineContract.tsx). Classes an entry lists only because
// it renders another component (`dependencyN` keys) never count as coverage.
import { library } from "#paths";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { readStableNames } from "../../../scripts/selector-reference.mjs";
import { namesIn } from "./collect";
import { migratedComponents, otherChartContracts, sharedStyleContracts } from "./components";

const packageRoot = library();
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [relative(packageRoot, path)] : [];
  });
const files = sourceFiles(join(packageRoot, "src"));
const read = (file: string) => readFileSync(join(packageRoot, file), "utf8");

describe("contract coverage", () => {
  it("gives every migrated component its own contract test file", () => {
    const missing = [...migratedComponents, ...otherChartContracts, ...sharedStyleContracts]
      .map(({ folder }) => `${folder}.contract.test.tsx`)
      .filter((file) => !existsSync(new URL(`./${file}`, import.meta.url)));
    expect(missing).toEqual([]);
  });

  it("covers every built names-exporting style module with its own contract names", async () => {
    const covered = namesIn(
      [...migratedComponents, ...sharedStyleContracts].flatMap((entry) =>
        entry.names.filter(
          (names) => !Object.keys(names).every((key) => key.startsWith("dependency")),
        ),
      ),
    );
    const missing = (await readStableNames())
      .filter((entry) => [...namesIn([entry.names])].some((name) => !covered.has(name)))
      .map((entry) => `${entry.component}/${entry.module}`);
    expect(missing).toEqual([]);
  });

  it("has a contract entry for every component that exports stable names", () => {
    const withNames = [
      ...new Set(
        files
          .filter((file) => /^export const names\b/m.test(read(file)))
          .map((file) => file.split("/")[2]),
      ),
    ];
    expect(withNames.sort()).toEqual(
      [
        ...new Set(
          [...migratedComponents, ...sharedStyleContracts].map(
            ({ folder }) => folder.split("/")[0],
          ),
        ),
      ].sort(),
    );
  });

  it("has a contract entry for every component that registers styles", () => {
    const entries = new Set(
      [...migratedComponents, ...sharedStyleContracts].map(({ folder }) => folder.split("/")[0]),
    );
    const styled = new Set(
      files
        .filter((file) => file.startsWith("src/components/") && /\buseStyles\(/.test(read(file)))
        .map((file) => file.split("/")[2]),
    );
    expect([...styled].filter((folder) => !entries.has(folder))).toEqual([]);
  });
});

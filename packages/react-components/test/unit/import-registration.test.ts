// No module registers CSS or marks <html> when it is imported: styles register when a component
// renders (ADR 0001, Q27). Imports every built ESM module, not just the entry, so a module the
// public entry happens not to evaluate is covered too. The token defaults (Q29) only run with a
// document; the browser half of this check is test/browser/import-registration.spec.ts.
// Run after build: pnpm exec vitest run test/unit/import-registration.test.ts.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, it } from "vitest";

const dist = fileURLToPath(new URL("../../dist/", import.meta.url));
const modules = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : modules(path);
    return entry.name.endsWith(".mjs") ? [path] : [];
  });

it("imports every built module without registering any CSS", async () => {
  const files = modules(dist);
  expect(files.length).toBeGreaterThan(100);
  for (const file of files) await import(pathToFileURL(file).href);
  const { getComponentStyles } = await import(pathToFileURL(join(dist, "index.mjs")).href);
  expect(getComponentStyles().trim()).toBe("");
}, 60_000);

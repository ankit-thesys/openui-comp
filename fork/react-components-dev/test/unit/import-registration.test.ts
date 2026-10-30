// Imports may register component rules in their own store (ADR 0002). The host sheet stays
// untouched; the browser half also checks the token defaults and <html> marker.
// Run after build: pnpm exec vitest run test/unit/import-registration.test.ts.
import { library } from "#paths";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, it } from "vitest";

const dist = library("dist/");
const modules = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : modules(path);
    return entry.name.endsWith(".mjs") ? [path] : [];
  });

it("imports every built module without registering CSS in the host Goober sheet", async () => {
  const files = modules(dist);
  expect(files.length).toBeGreaterThan(100);
  for (const file of files) await import(pathToFileURL(file).href);
  const { getComponentStyles } = await import(pathToFileURL(join(dist, "index.mjs")).href);
  expect(getComponentStyles().length).toBeGreaterThan(0);
  const require = createRequire(library("package.json"));
  const host = await import(
    pathToFileURL(require.resolve("goober").replace("goober.cjs", "goober.modern.js")).href
  );
  expect(host.extractCss().trim()).toBe("");
}, 60_000);

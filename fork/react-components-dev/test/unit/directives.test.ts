/**
 * Built-output seam: every component must retain its client boundary in ESM and CJS.
 * Build the library, then run `pnpm test test/unit/directives.test.ts` here.
 * Every component is checked. The exclusions below are non-component TSX helpers;
 * update them only if another such helper is added, never to exempt a component.
 */
import { library } from "#paths";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const componentsDir = library("dist/components/");
const nonComponentHelpers = new Set([
  "Calendar/utils/helperFn",
  "Calendar/utils/styles",
  "DatePicker/helpers/utils/helperFn",
]);

// The unbundled build's source-map metadata preserves TSX module identities,
// including aliases and context providers. Only dist is read, never source files.
const componentModules = readdirSync(componentsDir, { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".mjs.map"))
  .filter((file) => {
    const { sources } = JSON.parse(readFileSync(join(componentsDir, file), "utf8")) as {
      sources: string[];
    };
    return sources.some((source) => source.endsWith(".tsx"));
  })
  .map((file) => file.replace(/\.mjs\.map$/, ""))
  .filter((file) => !nonComponentHelpers.has(file))
  .sort();

describe("built component client boundaries", () => {
  it.each(["mjs", "cjs"])("starts every .%s component with use client", (extension) => {
    expect(componentModules.length).toBeGreaterThan(0);

    const missingDirectives = componentModules
      .map((file) => `${file}.${extension}`)
      .filter(
        (file) => !/^(["'])use client\1;/.test(readFileSync(join(componentsDir, file), "utf8")),
      );

    expect(missingDirectives).toEqual([]);
  });
});

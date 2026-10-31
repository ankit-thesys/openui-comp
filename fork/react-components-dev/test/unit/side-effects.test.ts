// Tree-shaking of unused components depends on package.json `sideEffects`: a style module's css``
// calls register rules, so without it a bundler must keep every style module. Only the entry and
// the theme defaults may be side-effectful; listing a style module, or dropping the field, makes a
// Button-only bundle carry every component's rules (#139: 221 kB versus 2.7 MB).
import { library } from "#paths";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const { sideEffects } = JSON.parse(readFileSync(library("package.json"), "utf8")) as {
  sideEffects?: unknown;
};

it("marks only the entry and the theme defaults as side-effectful", () => {
  expect(Array.isArray(sideEffects) ? [...sideEffects].sort() : sideEffects).toEqual([
    "./dist/index.cjs",
    "./dist/index.mjs",
    "./dist/styles/defaults.cjs",
    "./dist/styles/defaults.mjs",
    "./src/index.ts",
    "./src/styles/defaults.ts",
  ]);
});

// Guards the private names in migrated components' CSS (ADR 0001, Q14): keyframes carry the private
// `_openui-` prefix, every private variable a rule reads is set somewhere (by a CSS declaration, a
// server-rendered inline style, the built package's client code, as a quoted `setProperty` name,
// or the charts' part-variable helper), and each belongs to the component that uses it.
// Charts are fixed separately and keep their own keyframe names for now.
import { library } from "#paths";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { readStableNames } from "../../../scripts/selector-reference.mjs";
import { blocksIn, namesIn, renderAndCollect } from "./collect";
import { migratedComponents } from "./components";
import { renderWithPortals, withPortalTarget } from "./portal";
import { helperProperties, publicKeyframesIn, unsetPrivateVariables } from "./privateNames";

// React's server renderer cannot render portals; keep their children inline at the DOM boundary.
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  createPortal: (children: ReactNode) => children,
}));

// One render of every migrated component, so variables set by a wrapping component count too.
const rendered = migratedComponents.map((component) => {
  const portal = component.folder === "Modal";
  const elements = portal ? withPortalTarget(() => component.elements()) : component.elements();
  return {
    folder: component.folder,
    ...renderAndCollect(elements, portal ? renderWithPortals : undefined),
  };
});
const everything = rendered.map(({ css, html }) => css + html).join("\n");

it("collects CSS for every component whose private names it audits", () => {
  expect(rendered.filter(({ css }) => !css.trim()).map(({ folder }) => folder)).toEqual([]);
});

it("names every non-chart keyframe with the private _openui- prefix", () => {
  const publicKeyframes = rendered
    .filter(({ folder }) => !folder.startsWith("Charts"))
    .flatMap(({ folder, css }) => publicKeyframesIn(css).map((name) => `${folder}: ${name}`));
  expect(publicKeyframes).toEqual([]);
});

const stableClasses = namesIn((await readStableNames()).map(({ names }) => names));

it("recognises the part-variable helper's properties", () => {
  expect([...helperProperties].sort()).toEqual(["opacity", "path-length", "transition"]);
});

it("sets every private variable that a rule reads", () => {
  const unset = rendered.flatMap(({ folder, css }) =>
    unsetPrivateVariables(css, everything, stableClasses).map((name) => `${folder}: ${name}`),
  );
  expect(unset).toEqual([]);
});

// A component's private variables belong to it alone (ADR 0001, Q14): every `--_openui-*` name a
// component's source reads or sets belongs to one of its own roots or parts. A name belongs to the
// longest root or part of any component that prefixes it, so `openui-image` does not own
// `--_openui-image-block-*`. A primitive that needs a look from the component around it takes a
// public prop instead. A file belongs to the nearest folder at or above it whose subtree holds
// style modules, such as a chart's `parts/`.
const src = library("src/");
const sourceFiles = (readdirSync(src, { recursive: true }) as string[])
  .map((file) => file.split(/[\\/]/).join("/"))
  .filter((file) => /\.tsx?$/.test(file));
const styleModules = await Promise.all(
  sourceFiles
    .filter((file) => file.endsWith(".styles.ts"))
    .map(async (file) => ({
      file,
      names: ((await import(/* @vite-ignore */ join(src, file))) as { names?: StableNames }).names,
    })),
);
type StableNames = Parameters<typeof blocksIn>[0][number];
const ownersOf = (file: string) => {
  for (let folder = file.slice(0, file.lastIndexOf("/")); folder;) {
    const modules = styleModules.filter((module) => module.file.startsWith(`${folder}/`));
    if (modules.length > 0)
      return [...blocksIn(modules.flatMap(({ names }) => (names ? [names] : [])))];
    folder = folder.slice(0, Math.max(folder.lastIndexOf("/"), 0));
  }
  return [];
};

// Every root and part, longest first, so the first one prefixing a name is the one it belongs to.
const allBlocks = [...blocksIn(styleModules.flatMap(({ names }) => (names ? [names] : [])))].sort(
  (a, b) => b.length - a.length,
);
const blockOf = (name: string) => allBlocks.find((block) => name.startsWith(`--_${block}-`));

it("reads and sets only its own component's private variables", () => {
  const foreign = sourceFiles.flatMap((file) => {
    const owners = new Set(ownersOf(file));
    return [...new Set(readFileSync(join(src, file), "utf8").match(/--_openui-[\w-]+/g) ?? [])]
      .filter((name) => !owners.has(blockOf(name) ?? ""))
      .map((name) => `${file}: ${name} (${blockOf(name) ?? "no component"})`);
  });
  expect(foreign).toEqual([]);
});

// Firefox has no style queries on custom properties, so no look may depend on one.
it("uses no @container style() query", () => {
  expect(
    sourceFiles.filter((file) =>
      /@container\s+style\(/.test(readFileSync(join(src, file), "utf8")),
    ),
  ).toEqual([]);
});

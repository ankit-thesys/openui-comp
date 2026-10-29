// Guards the private names in migrated components' CSS (ADR 0001, Q14): keyframes carry the private
// `_openui-` prefix, every private variable a rule reads is set somewhere (by a CSS declaration, a
// server-rendered inline style, the built package's client code, as a quoted `setProperty` name,
// or the charts' part-variable helper), and each belongs to the component that uses it.
// Charts are fixed separately and keep their own keyframe names for now.
import { library } from "#paths";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { readStableNames } from "../../../scripts/selector-reference.mjs";
import { blocksIn, namesIn, renderAndCollect } from "./collect";
import { migratedComponents } from "./components";

const dist = library("dist/");
const clientCode = (readdirSync(dist, { recursive: true }) as string[])
  .filter((file) => /\.m?js$/.test(file))
  .map((file) => readFileSync(join(dist, file), "utf8"))
  .join("\n");

// One render of every migrated component, so variables set by a wrapping component count too.
const rendered = migratedComponents.map((component) => ({
  folder: component.folder,
  ...renderAndCollect(component.elements()),
}));
const everything = rendered.map(({ css, html }) => css + html).join("\n");

it("names every non-chart keyframe with the private _openui- prefix", () => {
  const publicKeyframes = rendered
    .filter(({ folder }) => !folder.startsWith("Charts"))
    .flatMap(({ folder, css }) =>
      [...css.matchAll(/@keyframes\s+([\w-]+)/g)]
        .map((match) => match[1]!)
        .filter((name) => !/^(--)?_openui-/.test(name))
        .map((name) => `${folder}: ${name}`),
    );
  expect(publicKeyframes).toEqual([]);
});

// Shared chart parts set `--_<stable part class>-<property>` through `partVariable(className,
// "<property>")` or `partVariables(className, { <property>: … })`, so dist holds only the
// property. Accept a variable when it is a stable class plus a property the helper is called with.
const helperProperties = new Set([
  ...[...clientCode.matchAll(/\bpartVariable\([^,()]+,\s*"([\w-]+)"\)/g)].map((m) => m[1]!),
  ...[...clientCode.matchAll(/\bpartVariables\([^,()]+,\s*\{([^}]*)\}/g)].flatMap(([, body]) =>
    [...body!.matchAll(/(?:^|,)\s*"?([a-z][\w-]*)"?\s*:/g)].map((m) => m[1]!),
  ),
]);
const stableClasses = namesIn((await readStableNames()).map(({ names }) => names));
const setByHelper = (name: string) =>
  [...helperProperties].some((property) => {
    const suffix = `-${property}`;
    return (
      name.endsWith(suffix) &&
      name.startsWith("--_") &&
      stableClasses.has(name.slice(3, -suffix.length))
    );
  });

it("recognises the part-variable helper's properties", () => {
  expect([...helperProperties].sort()).toEqual(["opacity", "path-length", "transition"]);
});

it("sets every private variable that a rule reads", () => {
  const declared = new Set([...everything.matchAll(/(--_openui-[\w-]+)\s*:/g)].map((m) => m[1]));
  const unset = rendered.flatMap(({ folder, css }) =>
    [...new Set([...css.matchAll(/var\((--_openui-[\w-]+)/g)].map((match) => match[1]!))]
      .filter(
        (name) => !declared.has(name) && !clientCode.includes(`"${name}"`) && !setByHelper(name),
      )
      .map((name) => `${folder}: ${name}`),
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

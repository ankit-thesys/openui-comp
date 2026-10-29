// Guards the private names in migrated components' CSS (ADR 0001, Q14): keyframes carry the private
// `_openui-` prefix, and every private variable a rule reads (`var()` or an `@container style()`
// query) is set somewhere: by a CSS declaration, a server-rendered inline style, the built
// package's client code (a quoted `setProperty` name), or the charts' part-variable helper.
// Charts are fixed separately and keep their own keyframe names for now.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { readStableNames } from "../../../scripts/selector-reference.mjs";
import { namesIn, renderAndCollect } from "./collect";
import { migratedComponents } from "./components";

const dist = fileURLToPath(new URL("../../../dist/", import.meta.url));
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

// `@container style(--_openui-x: 1)` reads the variable; only the remaining `name:` are declarations.
const styleQuery = /style\(\s*(--_openui-[\w-]+)\s*:[^)]*\)/g;

it("recognises the part-variable helper's properties", () => {
  expect([...helperProperties].sort()).toEqual(["opacity", "path-length", "transition"]);
});

it("sets every private variable that a rule reads", () => {
  const declared = new Set(
    [...everything.replace(styleQuery, "").matchAll(/(--_openui-[\w-]+)\s*:/g)].map((m) => m[1]),
  );
  const unset = rendered.flatMap(({ folder, css }) =>
    [
      ...new Set(
        [...css.matchAll(/var\((--_openui-[\w-]+)/g), ...css.matchAll(styleQuery)].map(
          (match) => match[1]!,
        ),
      ),
    ]
      .filter(
        (name) => !declared.has(name) && !clientCode.includes(`"${name}"`) && !setByHelper(name),
      )
      .map((name) => `${folder}: ${name}`),
  );
  expect(unset).toEqual([]);
});

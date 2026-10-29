// Guards the private names in migrated components' CSS (ADR 0001, Q14): keyframes carry the private
// `_openui-` prefix, and every private variable a rule reads is set somewhere, by CSS, by a
// server-rendered inline style, or by the built package's client code (`setProperty`).
// Charts are fixed separately and keep their own keyframe names for now.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { renderAndCollect } from "./collect";
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

it("sets every private variable that a rule reads", () => {
  const declared = new Set([...everything.matchAll(/(--_openui-[\w-]+)\s*:/g)].map((m) => m[1]));
  const unset = rendered.flatMap(({ folder, css }) =>
    [...new Set([...css.matchAll(/var\((--_openui-[\w-]+)/g)].map((match) => match[1]!))]
      .filter((name) => !declared.has(name) && !clientCode.includes(`"${name}"`))
      .map((name) => `${folder}: ${name}`),
  );
  expect(unset).toEqual([]);
});

import { library } from "#paths";
import { Button, Card, Tag } from "@openuidev/react-components";
import { getComponentStyles } from "@openuidev/react-components/styles";
import { readdirSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("imports every style module, so the full sheet needs no render", () => {
  const src = library("src/");
  const modules = readdirSync(library("src/components"), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".styles.ts"))
    .map((file) => `./${relative(src, library(`src/components/${file}`)).replace(/\.ts$/, "")}`);
  const entry = readFileSync(library("src/styles.ts"), "utf8");
  for (const module of modules) expect(entry).toContain(`"${module}"`);
});

it("holds every class a rendered component uses", () => {
  const sheet = getComponentStyles();
  const html = renderToString(
    <Card>
      <Tag text="New" />
      <Button>Save</Button>
    </Card>,
  );
  const classes = [...html.matchAll(/\bgo\d+/g)].map(([name]) => name);
  expect(classes.length).toBeGreaterThan(0);
  for (const name of classes) expect(sheet).toContain(`.${name}`);
});

it("wraps the full sheet in the requested layer", () => {
  expect(getComponentStyles({ layer: "openui" })).toMatch(/^@layer openui\{\.go\d+/);
});

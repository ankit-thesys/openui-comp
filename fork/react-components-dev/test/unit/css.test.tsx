import { library } from "#paths";
import {
  css,
  getComponentStyles,
  keyframes,
  type Css,
  type Keyframes,
} from "@openuidev/react-components";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, it } from "vitest";

it("registers public css and keyframes in the cumulative component sheet", () => {
  const style: Css = css;
  const animate: Keyframes = keyframes;
  const animation = animate`from { opacity: 0.13; } to { opacity: 0.87; }`;
  const name = style`color: rgb(13, 27, 39); animation: ${animation} 2s linear;`;
  const sheet = getComponentStyles();

  expect(name).toMatch(/^go\d+$/);
  expect(animation).toMatch(/^go\d+$/);
  expect(sheet).toContain(`.${name}{color:rgb(13, 27, 39);animation:${animation} 2s linear;}`);
  expect(sheet).toContain(`@keyframes ${animation}{from{opacity:0.13;}to{opacity:0.87;}}`);
  expect(getComponentStyles()).toBe(sheet);

  style`padding: 13px;`;
  expect(getComponentStyles()).toContain(sheet);
});

it("pins the Goober engine whose custom target routes component rules", () => {
  const manifest = JSON.parse(readFileSync(library("package.json"), "utf8"));
  const require = createRequire(library("package.json"));
  const installed = JSON.parse(
    readFileSync(join(dirname(require.resolve("goober")), "../package.json"), "utf8"),
  );
  expect(manifest.dependencies.goober).toBe("2.1.19");
  expect(installed.version).toBe("2.1.19");
});

it("keeps server component rules outside host Goober global replacement and extraction", async () => {
  const require = createRequire(library("package.json"));
  const host = await import(
    pathToFileURL(require.resolve("goober").replace("goober.cjs", "goober.modern.js")).href
  );
  const animation = keyframes`from { top: 13px; } to { top: 27px; }`;
  const name = css`
    animation: ${animation} 1s;
  `;
  const before = getComponentStyles();
  host.glob`body { --host-server: first; }`;
  host.glob`body { --host-server: second; }`;
  const extracted = host.extractCss();
  expect(extracted).toContain("--host-server:second");
  expect(extracted).not.toContain(name);
  expect(extracted).not.toContain(animation);
  expect(getComponentStyles()).toBe(before);
});

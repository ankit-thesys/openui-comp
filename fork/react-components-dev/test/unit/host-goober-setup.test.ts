// A host app's Goober `setup` installs a prefixer and shares a compiled-rule cache across every
// caller of that Goober module. Component rules must come out the same whatever the host sets up.
import { library } from "#paths";
import { css, getComponentStyles, keyframes } from "@openuidev/react-components";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { afterEach, expect, it } from "vitest";

const require = createRequire(library("package.json"));
// The Goober an app resolves next to the library, as a host importing "goober" gets it.
const host = await import(
  pathToFileURL(require.resolve("goober").replace("goober.cjs", "goober.modern.js")).href
);
const prefixer = (property: string, value: string) =>
  `${property}:${value};--host-prefixer:${property};`;

afterEach(() => {
  host.setup(null, undefined);
  host.extractCss();
});

it("keeps a host Goober prefixer out of component rules", () => {
  host.setup(null, prefixer);
  const name = css`
    user-select: none;
    padding: 13px;
  `;
  const animation = keyframes`from { opacity: 0.11; } to { opacity: 0.89; }`;
  const sheet = getComponentStyles();
  expect(sheet).toContain(`.${name}{user-select:none;padding:13px;}`);
  expect(sheet).toContain(`@keyframes ${animation}{from{opacity:0.11;}to{opacity:0.89;}}`);
  expect(sheet).not.toContain("--host-prefixer");
});

it("does not reuse rules the host compiled with its prefixer", () => {
  host.setup(null, prefixer);
  // The same text hashes to the same class, so a shared Goober would return the host's rule.
  const rule = "user-select: text; margin: 27px;";
  const hostName = host.css(rule);
  expect(host.extractCss()).toContain("--host-prefixer:user-select");
  const name = css(rule);
  expect(name).toBe(hostName);
  expect(getComponentStyles()).toContain(`.${name}{user-select:text;margin:27px;}`);
  expect(getComponentStyles()).not.toContain("--host-prefixer");
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [file, mode] = process.argv.slice(2);
assert(
  file && ["layered", "unlayered"].includes(mode),
  "Usage: node verify-html.mjs <curl-output.html> <mode>",
);
const html = await readFile(file, "utf8");
const headEnd = html.indexOf("</head>");
assert(headEnd > 0);
const tags = [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)];
const component = tags.filter((tag) => /(?:id|data-href)="openui-styles"/.test(tag[1]));
assert.equal(component.length, 1, "one server component sheet");
const sheet = component[0];
assert(sheet.index < headEnd, "component sheet is in head");
assert(sheet[2].length > 100000, "full component sheet");
assert.equal(sheet[2].startsWith("@layer openui{"), mode === "layered", "configured layer");
assert(html.includes(`data-compat-mode="${mode}"`), "rendered mode matches");
const appCss = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].filter(
  (tag) => !tag[0].includes("data-compat-overrides"),
);
assert(appCss.length > 0, "app CSS present");
for (const tag of appCss) {
  assert(tag.index < headEnd, "app CSS in head");
  if (mode === "unlayered")
    assert(sheet.index < tag.index, "component sheet precedes page/app CSS");
}
if (mode === "layered")
  assert(
    html.indexOf("@layer theme, base, openui, components, utilities;") < sheet.index,
    "layer order precedes component sheet",
  );
const host = tags.filter((tag) => /data-styled=/.test(tag[1]));
assert.equal(host.length, 1, "one host server-registry flush");
assert(host[0].index < headEnd, "host registry is in head");
assert(
  /background-color:\s*rgb\(21,\s*43,\s*65\)/.test(host[0][2]),
  "host styled CSS is server rendered",
);
console.log(
  JSON.stringify({
    mode,
    componentBytes: Buffer.byteLength(sheet[2]),
    componentInHead: true,
    appCssAfterComponent: appCss.every((tag) => sheet.index < tag.index),
    hostInHead: true,
  }),
);

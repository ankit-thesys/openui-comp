import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "vite";

// Keep module boundary comments in production output so the audit can inventory every retained
// style registration, including rules without private variables. No source maps or source reads.
await build({ build: { minify: false } });
await build({
  plugins: [
    {
      name: "all-exports-comparison",
      transformIndexHtml: {
        order: "pre",
        handler: (html) => html.replace("/src/main.tsx", "/src/all.ts"),
      },
    },
  ],
  build: { outDir: "dist/comparison", minify: false },
});

async function output(directory) {
  const files = await readdir(directory, { recursive: true });
  const parts = await Promise.all(
    files
      .filter((file) => /\.(js|css)$/.test(file) && !file.startsWith("comparison/"))
      .sort()
      .map((file) => readFile(join(directory, file), "utf8")),
  );
  return parts.join("\n");
}

const one = await output("dist");
const all = await output("dist/comparison");
function styleModules(code) {
  return [
    ...new Set(
      [...code.matchAll(/^\/\/ (?:#region )?([^\n]*\/[^/\n]+\.styles\.mjs)/gm)].map((match) =>
        match[1].replace(/^.*?\/dist\//, ""),
      ),
    ),
  ].sort();
}

const buttonModules = styleModules(one);
const allModules = styleModules(all);
assert.deepEqual(buttonModules, ["components/Button/button.styles.mjs"]);
assert.ok(allModules.length > 50, "all-exports control must retain the component style families");
assert.ok(allModules.includes(buttonModules[0]));
assert.match(one, /background-color: var\(--_openui-button-primary-bg\)/);
assert.match(one, /padding: calc\(var\(--openui-space-s, 8px\) - 1px\)/);
assert.match(one, /box-sizing: border-box/);
assert.doesNotMatch(one, /--_openui-(?!button-)[a-z-]+/);
assert.ok(one.length < all.length, "Button-only output must be smaller than all exports");
assert.ok(gzipSync(one).length < gzipSync(all).length);

const report = {
  mode: process.env.OPENUI_COMPAT_MODE ?? "unlayered",
  button: {
    bytes: Buffer.byteLength(one),
    gzipBytes: gzipSync(one).length,
    styleModules: buttonModules,
  },
  all: { bytes: Buffer.byteLength(all), gzipBytes: gzipSync(all).length, styleModules: allModules },
};
await writeFile("dist/tree-report.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));

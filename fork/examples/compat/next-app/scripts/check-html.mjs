import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const mode = process.env.OPENUI_COMPAT_MODE ?? "unlayered";
const matrix = manifest.compat.servers ?? [
  { name: "pages-production", port: manifest.compat.port },
];
const selected = process.argv[2];
if (selected && !matrix.some(({ name }) => name === selected))
  throw new Error(`Unknown server: ${selected}`);
const servers = selected ? matrix.filter(({ name }) => name === selected) : matrix;
const paths = ["/", "/dynamic/request-time", "/stream"];
for (const { name, port } of servers) {
  for (const path of paths) {
    const result = spawnSync(
      "curl",
      [
        "--fail",
        "--silent",
        "--show-error",
        "--no-buffer",
        "--retry",
        "5",
        "--retry-connrefused",
        "--retry-delay",
        "1",
        "--max-time",
        "120",
        `http://127.0.0.1:${port}${path}`,
      ],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    assert.equal(result.status, 0, result.stderr);
    const html = result.stdout;
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1];
    assert.ok(head, "head exists");
    const sheets = [...head.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)].filter(
      ([, attributes]) => /data-openui-styles|data-href="openui-styles"/.test(attributes),
    );
    assert.equal(sheets.length, 1, "one full server sheet in head");
    const sheet = sheets[0];
    assert.ok(sheet[2].length > 100_000, "full eager component sheet");
    assert.equal(sheet[2].startsWith("@layer openui{"), mode === "layered", "configured layer");
    assert.equal(
      /<style[^>]*id="openui-styles"/.test(html),
      false,
      "no browser sheet in server HTML",
    );
    const links = [...head.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)];
    assert.ok(links.length, "app CSS is linked in head");
    if (mode === "unlayered") {
      assert.ok(
        links.every((link) => link.index > sheet.index),
        "app CSS follows server sheet (README order recipe)",
      );
    } else {
      assert.ok(
        links.every((link) => link.index < sheet.index),
        "layered root CSS precedes component sheet (README recipe)",
      );
      const href = links[0][0].match(/href="([^"]+)"/)[1].replaceAll("&amp;", "&");
      const css = spawnSync(
        "curl",
        ["--fail", "--silent", "--show-error", `http://127.0.0.1:${port}${href}`],
        { encoding: "utf8" },
      );
      assert.equal(css.status, 0, css.stderr);
      // Next's production CSS optimizer may replace the order statement with the
      // equivalent first appearances: theme{}, base{}, @layer openui,components; utilities{}.
      const firstLayers = new Set();
      for (const match of css.stdout.matchAll(/@layer\s+([\w.,\s-]+)[;{]/g)) {
        for (const name of match[1].split(",")) firstLayers.add(name.trim());
      }
      assert.deepEqual(
        [...firstLayers].slice(0, 5),
        ["theme", "base", "openui", "components", "utilities"],
        "Tailwind layer priority recipe",
      );
    }
    assert.ok(html.includes(`data-compat-mode="${mode}"`), "build mode matches");
    if (path === "/stream") {
      assert.ok(
        html.indexOf("data-stream-fallback") < html.indexOf("data-stream-late"),
        "fallback precedes late components",
      );
    }
    console.log(
      `PASS ${name} ${mode} ${path}: head sheet ${Buffer.byteLength(sheet[2])} bytes; ${links.length} app CSS link(s); correct layer/order`,
    );
  }
}

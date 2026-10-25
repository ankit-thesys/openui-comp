import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, "../../../../../..");
const consumer = path.resolve(process.env.CORE_CONSUMER);
const tools = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
);
const { build } = tools("esbuild");
const candidatePath = path.join(consumer, "node_modules/@openuidev/react-ui-core");
assert(
  !(await fs.lstat(candidatePath)).isSymbolicLink(),
  "use a normally installed packed package, not a workspace/scratch symlink",
);
const candidate = createRequire(path.join(candidatePath, "package.json"));
const required = [
  "ThemeProvider",
  "InlineHeader",
  "TextBlockView",
  "Table",
  "ScrollableTable",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
  "CodeBlock",
  "MarkDownRenderer",
  "InlineMarkdownRenderer",
  "TextContentWrapper",
];
const exports = candidate("@openuidev/react-ui-core");
for (const name of required)
  assert(exports[name], `integrated public root export required: ${name}`);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const source = await fs.readFile(path.join(here, "text-media.fixture.tsx"), "utf8");
const baseline = path.join(repository, "packages/react-ui/src/components");
const legacyPrefix =
  required
    .map((name) => {
      const folder = ["GalleryModal"].includes(name)
        ? "ImageGallery"
        : ["CardSourceProvider", "ListedSourceItem"].includes(name)
          ? "Sources"
          : ["CitationItem", "TextContentCitation"].includes(name)
            ? "Citation"
            : name === "IconWrapper"
              ? "_shared/icons"
              : name === "TextBlockView"
                ? "TextBlock"
                : name.startsWith("Table") || name === "ScrollableTable"
                  ? "Table"
                  : name;
      return `import {${name}} from ${JSON.stringify(path.join(baseline, folder))};`;
    })
    .join("\n") + `\nconst Core={${required.join(",")}};`;
const aliases = Object.fromEntries(
  [
    "react",
    "react-dom",
    "lucide-react",
    "react-markdown",
    "remark-gfm",
    "remark-breaks",
    "remark-math",
    "rehype-katex",
    "react-syntax-highlighter",
    "zod",
    "@radix-ui/react-tooltip",
    "@radix-ui/react-aspect-ratio",
  ].map((name) => [
    name,
    ["react", "react-dom", "react-syntax-highlighter", "zod", "lucide-react"].includes(name)
      ? path.dirname(candidate.resolve(name + "/package.json"))
      : candidate.resolve(name),
  ]),
);
const implementationFiles = {};
async function record(relative) {
  const full = path.join(candidatePath, relative);
  const stat = await fs.stat(full);
  if (stat.isDirectory()) {
    for (const name of (await fs.readdir(full)).sort()) await record(path.join(relative, name));
  } else {
    const data = await fs.readFile(full);
    implementationFiles[relative] = { bytes: data.length, sha256: hash(data) };
  }
}
await record("package.json");
await record("dist");
const scripts = {},
  graphs = {};
for (const arm of ["baseline", "runtime"]) {
  const result = await build({
    stdin: {
      contents:
        arm === "baseline"
          ? source.replace('import * as Core from "@openuidev/react-ui-core";', legacyPrefix)
          : source,
      resolveDir: consumer,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline" ? { nodePaths: [consumer + "/node_modules"], alias: aliases } : {}),
  });
  if (arm === "runtime")
    assert(
      !Object.keys(result.metafile.inputs).some((file) => file.includes("packages/react-ui/src")),
      "candidate cannot import legacy production source",
    );
  scripts[arm] = result.outputFiles[0].text;
  graphs[arm] = { sha256: hash(scripts[arm]), bytes: Buffer.byteLength(scripts[arm]) };
}
const sass = createRequire(path.resolve(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
const legacyCss = sass.compile(path.join(baseline, "index.scss"), {
  style: "expanded",
  logger: sass.Logger.silent,
}).css;
const hosts = {};
for (const framework of ["plain", "tailwind3", "tailwind4"])
  hosts[framework] = await fs.readFile(
    path.join(process.env.CORE_HOST_STYLES, "frameworks", framework + ".css"),
    "utf8",
  );
const report = {
  status: "prepared",
  implementationFiles,
  implementationManifestSha256: hash(JSON.stringify(implementationFiles)),
  artifactRevision: process.env.CORE_ARTIFACT_REVISION,
  graphs,
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  consumerLockSha256: hash(await fs.readFile(path.join(consumer, "package-lock.json"))),
  legacyCssSha256: hash(legacyCss),
  cases: [],
  snapshots: 0,
  exclusions: [
    "Math CSS/font delivery pending architecture decision; no styled math acceptance",
    "SSR/hydration/performance/memory not covered",
  ],
};
assert(/^[a-f0-9]{40}$/.test(report.artifactRevision || ""));
const save = () =>
  fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log("Prepared matched text/media bundles; no Chrome launched.");
  process.exit(0);
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.endsWith(".js")) {
    res.setHeader("content-type", "text/javascript");
    return res.end(scripts[url.pathname.slice(1, -3)]);
  }
  if (url.pathname === "/baseline.css") {
    res.setHeader("content-type", "text/css");
    return res.end(legacyCss);
  }
  if (url.pathname.startsWith("/host/")) {
    res.setHeader("content-type", "text/css");
    return res.end(hosts[url.pathname.slice(6, -4)]);
  }
  const arm = url.searchParams.get("arm"),
    framework = url.searchParams.get("framework");
  res.setHeader("content-type", "text/html");
  res.end(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/host/${framework}.css"><style>body{margin:0}#zone{padding:16px;max-width:760px;box-sizing:border-box}#typography{display:flex;flex-direction:column;gap:12px}#unrelated{font:17px/23px serif;color:rgb(11,22,33)}</style><div id="app"></div><script type="module" src="/${arm}.js"></script>`,
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
let browser;
const properties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "color",
  "backgroundColor",
  "border",
  "borderRadius",
  "padding",
  "margin",
  "gap",
  "display",
  "boxSizing",
  "alignItems",
  "justifyContent",
  "flexDirection",
  "flexGrow",
  "width",
  "height",
  "maxWidth",
  "maxHeight",
  "overflow",
  "textAlign",
  "textOverflow",
  "whiteSpace",
  "WebkitLineClamp",
  "cursor",
  "opacity",
];
const snapshot = (page) =>
  page.locator("#zone,#zone *").evaluateAll(
    (nodes, props) =>
      nodes.map((node) => {
        const s = getComputedStyle(node),
          r = node.getBoundingClientRect();
        return {
          tag: node.tagName,
          text: node.children.length ? null : node.textContent,
          style: Object.fromEntries(props.map((p) => [p, s[p]])),
          rect: Object.fromEntries(
            ["x", "y", "width", "height"].map((k) => [k, Math.round(r[k] * 100) / 100]),
          ),
        };
      }),
    properties,
  );
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  for (const framework of ["plain", "tailwind3", "tailwind4"])
    for (const order of ["before", "after"]) {
      const pages = [];
      const errors = [];
      for (const arm of ["baseline", "runtime"]) {
        const page = await browser.newPage({
          viewport: { width: 800, height: 800 },
          permissions: ["clipboard-read", "clipboard-write"],
        });
        page.setDefaultTimeout(10000);
        page.on("pageerror", (e) => errors.push({ arm, message: e.message }));
        await page.goto(
          `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}`,
        );
        await page.waitForSelector("[data-ready]");
        await page.waitForFunction(() => !!window.configure);
        await page.evaluate(
          ({ order, arm }) => {
            const host = document.getElementById("host-style");
            const component = document.getElementById(
              arm === "baseline" ? "component-style" : "_goober",
            );
            if (!component) throw Error("Missing component stylesheet");
            if (order === "before") document.head.insertBefore(host, component);
            else document.head.append(host);
          },
          { order, arm },
        );
        assert(
          (
            await page.locator(".openui-code-block-syntax-highlighter").first().textContent()
          ).includes("const value = 42;"),
          "CodeBlock contains expected code",
        );
        assert.equal(
          await page.locator("#unrelated").evaluate((n) => getComputedStyle(n).color),
          "rgb(11, 22, 33)",
        );
        pages.push(page);
      }
      const compare = async (label) => {
        await Promise.all(
          pages.map((p) =>
            p.evaluate(
              () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
            ),
          ),
        );
        const actual = await Promise.all(pages.map(snapshot));
        try {
          assert.deepEqual(actual[1], actual[0]);
        } catch (e) {
          report.firstFailure = {
            framework,
            order,
            label,
            baseline: actual[0],
            runtime: actual[1],
          };
          throw e;
        }
        report.snapshots += actual[0].length;
      };
      for (const page of pages) {
        await page.getByRole("button", { name: "Scroll right", exact: true }).waitFor();
        assert.equal(
          await page
            .getByRole("button", { name: "Scroll left", exact: true, includeHidden: true })
            .isDisabled(),
          true,
        );
      }
      await compare("default");
      for (const page of pages) await page.locator(".openui-code-block-wrapper").first().hover();
      for (const page of pages)
        await page.waitForFunction(
          () =>
            getComputedStyle(document.querySelector(".openui-code-block-copy-button")).opacity ===
            "1",
        );
      await compare("code-hover");
      for (const page of pages) {
        await page.bringToFront();
        await page
          .locator(".openui-code-block-wrapper")
          .first()
          .getByRole("button", { name: "Copy code", exact: true })
          .first()
          .click();
        assert.equal(
          await page.evaluate(() => navigator.clipboard.readText()),
          "const value = 42;\nconsole.log(value);",
        );
        await page
          .getByRole("button", { name: "Copied to clipboard", exact: true })
          .first()
          .waitFor();
      }
      await compare("code-copied");
      for (const page of pages)
        await page
          .locator(".openui-code-block-wrapper")
          .first()
          .getByRole("button", { name: "Copy code", exact: true })
          .first()
          .waitFor();
      for (const size of ["xs", "sm", "md", "lg"])
        for (const type of ["text", "number", "textOnly"]) {
          const config = {
            mode: "light",
            size,
            type,
            align: "left",
            variant: "card",
            clamp: false,
            custom: false,
          };
          await Promise.all(pages.map((p) => p.evaluate((c) => window.configure(c), config)));
          await Promise.all(
            pages.map((p) =>
              p.waitForFunction(
                (c) =>
                  Object.entries(c).every(
                    ([k, v]) =>
                      JSON.parse(document.querySelector("[data-ready]").dataset.ready)[k] === v,
                  ),
                config,
              ),
            ),
          );
          await compare(`${size}/${type}`);
        }
      for (const config of [
        {
          mode: "dark",
          size: "md",
          type: "text",
          align: "center",
          tone: "positive",
          variant: "sunk",
          clamp: true,
          custom: false,
        },
        {
          mode: "light",
          size: "lg",
          type: "number",
          align: "right",
          tone: "negative",
          variant: "clear",
          clamp: false,
          custom: true,
        },
      ]) {
        await Promise.all(pages.map((p) => p.evaluate((c) => window.configure(c), config)));
        await Promise.all(
          pages.map((p) =>
            p.waitForFunction(
              (c) =>
                Object.entries(c).every(
                  ([k, v]) =>
                    JSON.parse(document.querySelector("[data-ready]").dataset.ready)[k] === v,
                ),
              config,
            ),
          ),
        );
        if (config.custom)
          for (const page of pages)
            assert.equal(
              await page
                .locator(".openui-table-cell")
                .first()
                .evaluate((n) => getComputedStyle(n).padding),
              "13px",
            );
        await compare(JSON.stringify(config));
      }
      for (const page of pages) {
        await page.addStyleTag({
          content:
            ".consumer-override.openui-text-block{padding:19px;border-radius:9px}.consumer-override.openui-text-block .openui-text-block__primary{color:rgb(33,44,55)}",
        });
        await page.evaluate(() =>
          window.configure({
            mode: "light",
            size: "md",
            type: "text",
            align: "left",
            variant: "card",
            override: true,
          }),
        );
        await page.waitForSelector(".consumer-override");
        assert.equal(
          await page
            .locator(".consumer-override")
            .first()
            .evaluate((n) => getComputedStyle(n).padding),
          "19px",
        );
      }
      await compare("explicit-consumer-override");
      for (const page of pages)
        assert.equal(
          await page.locator("#unrelated").evaluate((n) => getComputedStyle(n).color),
          "rgb(11, 22, 33)",
        );
      assert.deepEqual(errors, []);
      report.cases.push({ framework, order, status: "passed" });
      for (const p of pages) await p.close();
      await save();
    }
  report.status = "passed";
  await save();
  console.log(
    JSON.stringify({
      status: report.status,
      cases: report.cases.length,
      snapshots: report.snapshots,
    }),
  );
} catch (e) {
  report.status = "failed";
  report.error = String(e);
  await save();
  throw e;
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}

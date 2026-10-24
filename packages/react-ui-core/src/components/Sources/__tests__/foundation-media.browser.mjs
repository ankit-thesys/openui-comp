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
  "Callout",
  "TextCallout",
  "Tag",
  "TagBlock",
  "TextContent",
  "Image",
  "ImageBlock",
  "ImageGallery",
  "GalleryModal",
  "CardSourceProvider",
  "Sources",
  "Citation",
  "CitationItem",
  "TextContentCitation",
  "ListedSourceItem",
  "SourceFaviconImage",
  "IconWrapper",
];
const exports = candidate("@openuidev/react-ui-core");
for (const name of required)
  assert(exports[name], `integrated public root export required: ${name}`);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const source = await fs.readFile(path.join(here, "foundation-media.fixture.tsx"), "utf8");
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
              : name;
      return `import {${name}} from ${JSON.stringify(path.join(baseline, folder))};`;
    })
    .join("\n") + `\nconst Core={${required.join(",")}};`;
const aliases = Object.fromEntries(
  [
    "react",
    "react-dom",
    "lucide-react",
    "zod",
    "@radix-ui/react-tooltip",
    "@radix-ui/react-aspect-ratio",
  ].map((name) => [name, path.dirname(candidate.resolve(name + "/package.json"))]),
);
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
const image = await fs.readFile(path.join(here, "image.svg"));
const placeholder = await fs.readFile(path.join(here, "favicon-placeholder.svg"));
const artifactRevision = process.env.CORE_ARTIFACT_REVISION;
assert(
  /^[a-f0-9]{40}$/i.test(artifactRevision || ""),
  "CORE_ARTIFACT_REVISION must identify the full integrated commit",
);
const implementationFiles = {};
async function recordFiles(relative) {
  const full = path.join(candidatePath, relative);
  const stat = await fs.lstat(full);
  if (stat.isDirectory()) {
    for (const name of (await fs.readdir(full)).sort())
      await recordFiles(path.join(relative, name));
  } else {
    assert(stat.isFile(), `installed implementation must be a regular file: ${relative}`);
    const bytes = await fs.readFile(full);
    implementationFiles[relative] = { sha256: hash(bytes), bytes: bytes.length };
  }
}
await recordFiles("package.json");
await recordFiles("dist");
const report = {
  status: "prepared",
  artifactRevision,
  implementationFiles,
  implementationManifestSha256: hash(JSON.stringify(implementationFiles)),
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  packageSha256: hash(await fs.readFile(path.join(candidatePath, "package.json"))),
  entrySha256: hash(await fs.readFile(path.join(candidatePath, "dist/index.mjs"))),
  consumerLockSha256: hash(await fs.readFile(path.join(consumer, "package-lock.json"))),
  graphs,
  legacyCssSha256: hash(legacyCss),
  hostHashes: Object.fromEntries(Object.entries(hosts).map(([name, css]) => [name, hash(css)])),
  cases: [],
  snapshots: 0,
  inheritedObservations: [],
  exclusions: [
    "SSR/hydration/streaming delivery and performance/memory are not tested here",
    "No owned public disabled API; existing composition controls retain their native states",
    "Sources/Citation/Gallery lack className overrides; preserved selectors are used through an ordinary consumer stylesheet",
  ],
};
const save = async () => {
  if (process.env.CORE_BROWSER_RESULTS)
    await fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(report, null, 2) + "\n");
};
if (process.argv.includes("--prepare-only")) {
  await save();
  console.log(
    "Prepared matched fixture bundles and exact artifact/host hashes; Chrome was not launched.",
  );
  process.exit(0);
}
const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (["/baseline.js", "/runtime.js"].includes(url.pathname)) {
    response.setHeader("content-type", "text/javascript");
    return response.end(scripts[url.pathname.slice(1, -3)]);
  }
  if (url.pathname === "/baseline.css") {
    response.setHeader("content-type", "text/css");
    return response.end(legacyCss);
  }
  if (["/image.svg", "/slow.svg", "/favicon-placeholder.svg"].includes(url.pathname)) {
    response.setHeader("content-type", "image/svg+xml");
    response.setHeader("cache-control", "no-store");
    const send = () =>
      response.end(url.pathname === "/favicon-placeholder.svg" ? placeholder : image);
    if (url.pathname === "/slow.svg") setTimeout(send, 600);
    else send();
    return;
  }
  if (url.pathname === "/missing.svg") {
    response.writeHead(404);
    return response.end("Missing fixture image");
  }
  if (url.pathname.startsWith("/navigation/")) {
    response.setHeader("content-type", "text/plain");
    return response.end("Source navigation target");
  }
  if (url.pathname.startsWith("/host/")) {
    response.setHeader("content-type", "text/css");
    return response.end(hosts[url.pathname.slice(6, -4)]);
  }
  const arm = url.searchParams.get("arm"),
    framework = url.searchParams.get("framework");
  if (!scripts[arm] || !hosts[framework]) {
    response.writeHead(404);
    return response.end();
  }
  response.setHeader("content-type", "text/html");
  response.end(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/host/${framework}.css"><style>body{margin:0}#zone{width:100%;max-width:760px;padding:16px;box-sizing:border-box}#presentations,#media,#sources{display:flex;flex-direction:column;gap:18px}#unrelated{font:17px/23px serif;color:rgb(11,22,33);padding:7px;background:rgb(240,241,242)}</style></head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
const selector =
  '#zone [class*="openui-"],#zone .text-content,#zone .text-content p,#zone svg,.openui-gallery__modal,.openui-gallery__modal [class*="openui-"],.openui-gallery__modal svg,.openui-citation-tooltip,.openui-citation-tooltip [class*="openui-"],.openui-citation-tooltip svg';
const properties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "fontVariationSettings",
  "color",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
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
  "flexWrap",
  "flexGrow",
  "flexShrink",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridTemplateAreas",
  "gridArea",
  "width",
  "height",
  "minHeight",
  "maxHeight",
  "maxWidth",
  "opacity",
  "visibility",
  "overflow",
  "objectFit",
  "position",
  "zIndex",
  "isolation",
  "filter",
  "backdropFilter",
  "cursor",
  "outline",
  "outlineOffset",
  "boxShadow",
  "stroke",
  "strokeWidth",
  "transform",
  "translate",
  "textOverflow",
  "whiteSpace",
  "scrollbarWidth",
  "scrollbarColor",
  "pointerEvents",
];
const settle = async (page, finishAnimations = true) => {
  await page.evaluate(async (finish) => {
    document.querySelectorAll('[class*="openui-"]').forEach((node) => getComputedStyle(node).color);
    if (finish)
      for (const animation of document.getAnimations())
        if (Number.isFinite(animation.effect.getComputedTiming().iterations)) animation.finish();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, finishAnimations);
};
const snapshot = async (page, finishAnimations) => {
  await settle(page, finishAnimations);
  return page.locator(selector).evaluateAll(
    (nodes, props) =>
      nodes.map((node) => {
        const style = getComputedStyle(node),
          rect = node.getBoundingClientRect();
        const normalize = (value) => value.replace(/https?:\/\/127\.0\.0\.1:\d+/g, "LOCAL");
        return {
          tag: node.tagName,
          svg: node.tagName.toLowerCase() === "svg" ? node.innerHTML : null,
          classes: [...node.classList]
            .filter(
              (name) =>
                (name.startsWith("openui-") && !name.startsWith("openui-theme-")) ||
                name.startsWith("text-content"),
            )
            .sort(),
          style: Object.fromEntries(props.map((key) => [key, normalize(style[key])])),
          before: node.classList.contains("openui-image-block-wrapper")
            ? Object.fromEntries(
                [
                  "content",
                  "backgroundImage",
                  "filter",
                  "opacity",
                  "borderRadius",
                  "position",
                  "inset",
                ].map((key) => [key, normalize(getComputedStyle(node, "::before")[key])]),
              )
            : null,
          rect: Object.fromEntries(
            ["x", "y", "width", "height"].map((key) => [key, Math.round(rect[key] * 1000) / 1000]),
          ),
          disabled: node.hasAttribute("disabled"),
          state: node.getAttribute("data-state"),
          side: node.getAttribute("data-side"),
        };
      }),
    properties,
  );
};
const configure = async (pages, next) => {
  for (const page of pages) {
    await page.evaluate((value) => window.configure(value), next);
    await page.waitForFunction((value) => {
      const current = JSON.parse(document.querySelector("[data-ready]").dataset.config);
      return Object.entries(value).every(([key, expected]) => current[key] === expected);
    }, next);
  }
};
const waitImages = async (page) => {
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  await settle(page);
};
const readEvents = (page) =>
  page.locator("#events").evaluate((node) => JSON.parse(node.textContent));
const openGallery = async (page) => {
  await page.locator(".openui-gallery__image").first().click();
  await page.getByRole("dialog").waitFor();
};
const observe = async (pages, label, read) => {
  const values = await Promise.all(pages.map(read));
  assert.deepEqual(values[1], values[0], `baseline observation: ${label}`);
  report.inheritedObservations.push({ label, value: values[1] });
};
try {
  const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
  browser = await chromium.launch({ channel: "chrome", headless: true });
  report.browser = browser.version();
  report.status = "running";
  for (const framework of (process.env.CORE_MATRIX_FRAMEWORKS || "plain,tailwind3,tailwind4").split(
    ",",
  ))
    for (const order of ["before", "after"])
      for (const kind of (process.env.CORE_MATRIX_CASES || "presentation,media,sources").split(
        ",",
      )) {
        const contexts = [],
          pages = [],
          errors = [];
        let comparisons = 0;
        const compare = async (label, finishAnimations = true) => {
          const [expected, actual] = await Promise.all(
            pages.map((page) => snapshot(page, finishAnimations)),
          );
          try {
            assert.deepEqual(actual, expected, `${framework}/${order}/${kind}/${label}`);
          } catch (error) {
            report.failedComparison = { framework, order, kind, label, expected, actual };
            throw error;
          }
          comparisons += expected.length;
        };
        try {
          for (const arm of ["baseline", "runtime"]) {
            const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
            contexts.push(context);
            await context.route("https://www.google.com/s2/favicons?*", (route) =>
              route.fulfill({ contentType: "image/svg+xml", body: image }),
            );
            const page = await context.newPage();
            pages.push(page);
            page.setDefaultTimeout(8000);
            page.on("pageerror", (error) => errors.push({ arm, error: error.message }));
            await page.goto(
              `http://127.0.0.1:${server.address().port}/?arm=${arm}&framework=${framework}&case=${kind}`,
            );
            await page.locator("[data-ready]").waitFor();
            await page.evaluate(
              ({ arm, order }) => {
                const host = document.querySelector("#host-style"),
                  component = document.querySelector(
                    arm === "baseline" ? "#component-style" : "#_goober",
                  );
                if (order === "before") component.before(host);
                else component.after(host);
              },
              { arm, order },
            );
          }
          for (const theme of ["none", "light", "dark", "custom-light", "custom-dark"]) {
            await configure(pages, { theme, nested: false, overrides: false });
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await waitImages(page);
            }
            if (kind === "presentation") {
              for (const variant of ["neutral", "info", "warning", "danger", "success"]) {
                await configure(pages, { variant });
                for (const size of ["sm", "md", "lg"]) {
                  await configure(pages, { size });
                  await compare(`${theme}/${variant}/${size}`);
                }
              }
            } else if (kind === "media") {
              for (const count of [0, 1, 2, 3, 4, 5, 6]) {
                await configure(pages, { count });
                for (const page of pages) await waitImages(page);
                await compare(`${theme}/count-${count}`);
              }
              await configure(pages, { count: 6 });
              for (const scale of ["fit", "fill"])
                for (const ratio of ["1:1", "3:2", "3:4", "4:3", "16:9"]) {
                  await configure(pages, { scale, ratio });
                  await compare(`${theme}/${scale}/${ratio}`);
                }
              for (const page of pages) {
                await openGallery(page);
                await waitImages(page);
                assert.equal(
                  await page.locator('#zone [role="dialog"]').count(),
                  0,
                  "gallery is a body portal",
                );
              }
              await compare(`${theme}/gallery-portal`);
              await observe(pages, `${framework}/${order}/${theme}/gallery-initial-focus`, (page) =>
                page.evaluate(() => ({
                  inside: document
                    .querySelector('[role="dialog"]')
                    .contains(document.activeElement),
                  tag: document.activeElement?.tagName,
                })),
              );
              for (const page of pages) {
                await page.evaluate(() => {
                  window.scrollEnded = false;
                  document.querySelector(".openui-gallery__modal-carousel").addEventListener(
                    "scrollend",
                    () => {
                      window.scrollEnded = true;
                    },
                    { once: true },
                  );
                });
                await page.locator('[aria-label="Scroll images right"]').click();
                await page.waitForFunction(() => window.scrollEnded);
              }
              await compare(`${theme}/gallery-thumbnail-scroll`);
              for (const page of pages) {
                await page.locator('[aria-label="Close gallery"]').click();
                await page.getByRole("dialog").waitFor({ state: "detached" });
              }
            } else {
              for (const page of pages) await page.locator("#dynamic-icon svg").waitFor();
              for (const page of pages) {
                const previous = page
                  .locator(".openui-listed-sources-header__buttons button")
                  .first();
                if (await previous.isEnabled()) {
                  await page.evaluate(() => {
                    window.scrollEnded = false;
                    document.querySelector("#sources .openui-carousel-content").addEventListener(
                      "scrollend",
                      () => {
                        window.scrollEnded = true;
                      },
                      { once: true },
                    );
                  });
                  await previous.click();
                  await page.waitForFunction(() => window.scrollEnded);
                }
              }
              await compare(`${theme}/sources`);
              for (const page of pages) {
                const buttons = page.locator(".openui-listed-sources-header__buttons button");
                assert(
                  await buttons.first().isDisabled(),
                  "native previous control starts disabled",
                );
                assert(await buttons.last().isEnabled(), "overflow enables next control");
                await page.evaluate(() => {
                  window.scrollEnded = false;
                  document.querySelector("#sources .openui-carousel-content").addEventListener(
                    "scrollend",
                    () => {
                      window.scrollEnded = true;
                    },
                    { once: true },
                  );
                });
                await buttons.last().click();
                await page.waitForFunction(() => window.scrollEnded);
                assert(
                  await buttons.first().isEnabled(),
                  "previous control enables after scrolling",
                );
              }
              await compare(`${theme}/source-carousel-scroll`);
              for (const page of pages) {
                await page.locator('#inline-citation [aria-label="Citations"]').click();
                await page.locator(".openui-citation-tooltip").waitFor();
                await waitImages(page);
                await page.mouse.move(0, 0);
                await page.waitForTimeout(300); // Beyond the existing 200ms hover-close delay.
                assert(
                  await page.locator(".openui-citation-tooltip").isVisible(),
                  "clicked citation remains pinned after pointer leave",
                );
              }
              await compare(`${theme}/citation-portal-pinned`);
              for (const page of pages) {
                await page.keyboard.press("Escape");
                await settle(page);
              }
              await observe(pages, `${framework}/${order}/${theme}/citation-escape`, (page) =>
                page.locator(".openui-citation-tooltip").count(),
              );
              for (const page of pages) {
                await page.locator("#outside").click();
                await page.locator(".openui-citation-tooltip").waitFor({ state: "detached" });
                await page.locator('#inline-citation [aria-label="Citations"]').hover();
                await page.locator(".openui-citation-tooltip").waitFor();
                await page.mouse.move(0, 0);
                await page.locator(".openui-citation-tooltip").waitFor({ state: "detached" });
              }
            }
          }
          await configure(pages, { theme: "custom-light", nested: true, overrides: true });
          if (kind === "media") for (const page of pages) await openGallery(page);
          if (kind === "sources")
            for (const page of pages) {
              await page.locator('#inline-citation [aria-label="Citations"]').click();
              await page.locator(".openui-citation-tooltip").waitFor();
            }
          await compare("nested-theme-explicit-overrides");
          for (const page of pages) {
            assert.equal(
              await page
                .locator("#independent-color")
                .evaluate((node) => getComputedStyle(node).color),
              "oklch(0.097 0 0)",
              "independent theme unchanged",
            );
            if (kind === "presentation") {
              const root = page.locator(".openui-callout");
              assert.equal(
                await root.evaluate((node) => getComputedStyle(node).paddingTop),
                "32px",
              );
              await root.hover();
            } else if (kind === "media") {
              assert.equal(
                await page
                  .locator(".openui-gallery__modal-content")
                  .evaluate((node) => getComputedStyle(node).backgroundColor),
                "rgb(239, 68, 68)",
              );
              await page.locator(".openui-gallery__modal-thumbnail").nth(3).focus();
              await page.keyboard.press("Space");
              assert.equal(
                await page.locator(".openui-gallery__modal-main img").getAttribute("alt"),
                "Photo 4",
              );
              await page.locator(".openui-gallery__modal-thumbnail").nth(2).focus();
              await page.keyboard.press("Enter");
              assert.equal(
                await page.locator(".openui-gallery__modal-main img").getAttribute("alt"),
                "Photo 3",
              );
              await page.keyboard.press("Escape");
              await page.getByRole("dialog").waitFor({ state: "detached" });
            } else {
              assert.equal(
                await page
                  .locator(".openui-citation-tooltip")
                  .evaluate((node) => getComputedStyle(node).backgroundColor),
                "rgb(239, 68, 68)",
              );
              await page.locator("#outside").click();
              await page.locator(".openui-citation-tooltip").waitFor({ state: "detached" });
              await page
                .locator('#sources > .openui-citation-container [aria-label="Citations"]')
                .hover();
            }
          }
          if (kind === "presentation") {
            await compare("override-hover");
            await configure(pages, { overrides: false, duration: 120 });
            for (const page of pages)
              await page.locator(".openui-callout").evaluate((node) => {
                getComputedStyle(node).opacity;
                for (const animation of node.getAnimations()) {
                  animation.pause();
                  animation.currentTime = 0;
                }
              });
            await compare("callout-animation-start", false);
            for (const page of pages)
              await page.locator(".openui-callout").evaluate((node) => {
                for (const animation of node.getAnimations()) animation.finish();
              });
            await compare("callout-animation-end");
            for (const page of pages)
              assert.equal(
                await page
                  .locator(".openui-callout")
                  .evaluate((node) => getComputedStyle(node).maxHeight),
                "0px",
              );
            await configure(pages, { duration: 0 });
          } else if (kind === "media") {
            let releaseImages;
            const imageGate = new Promise((resolve) => {
              releaseImages = resolve;
            });
            for (const page of pages)
              await page.route("**/slow.svg*", async (route) => {
                await imageGate;
                await route.fulfill({ contentType: "image/svg+xml", body: image });
              });
            await configure(pages, { overrides: false, src: "/slow.svg", imageLoading: false });
            await configure(pages, { imageLoading: true });
            for (const page of pages) {
              await page.locator(".openui-image-block-loader").waitFor();
              await page.locator(".openui-image-block-loader").evaluate((node) => {
                getComputedStyle(node).transform;
                for (const animation of node.getAnimations()) {
                  animation.pause();
                  animation.currentTime = 250;
                }
              });
            }
            await compare("image-loading-spinner-phase", false);
            releaseImages();
            for (const page of pages) {
              await waitImages(page);
              await page.unroute("**/slow.svg*");
            }
            await compare("loaded-delayed-images");
            await configure(pages, { src: "/missing.svg" });
            for (const page of pages) {
              await waitImages(page);
              await page
                .locator(".openui-image-block-wrapper--error")
                .waitFor({ state: "attached" });
            }
            await compare("image-errors");
            await configure(pages, { src: "/image.svg" });
            for (const page of pages) await waitImages(page);
            await observe(pages, `${framework}/${order}/image-source-error-reset`, (page) =>
              page.evaluate(() => ({
                imageError: document
                  .querySelector(".openui-image")
                  .classList.contains("openui-image--error"),
                blockError: document
                  .querySelector(".openui-image-block-wrapper")
                  .classList.contains("openui-image-block-wrapper--error"),
              })),
            );
            await compare("source-after-error");
            for (const page of pages) {
              await openGallery(page);
              await page.mouse.click(1, 1);
              await page.getByRole("dialog").waitFor({ state: "detached" });
            }
            await observe(pages, `${framework}/${order}/gallery-body-overflow`, (page) =>
              page.evaluate(() => document.body.style.overflow),
            );
          } else {
            await configure(pages, { overrides: false });
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.locator("#outside").click();
              await page.evaluate(() => window.clearEvents());
              await page.locator("#unsafe-item button").click();
              assert.equal(await page.evaluate(() => window.__unsafeExecuted), undefined);
              assert.equal(page.context().pages().length, 1, "unsafe source must not open a tab");
              const popup = page.waitForEvent("popup");
              await page.locator("#citation-item button").click();
              const target = await popup;
              await target.waitForURL("**/navigation/direct");
              assert(
                await target.evaluate(() => window.opener === null),
                "safe source popup has no opener",
              );
              await target.close();
              for (const key of ["Enter", "Space"]) {
                await page.locator('#listed-item [role="button"]').focus();
                const opening = page.waitForEvent("popup");
                await page.keyboard.press(key);
                const tab = await opening;
                await tab.waitForURL("**/navigation/keyboard");
                await tab.close();
              }
              assert.deepEqual(await readEvents(page), [
                "unsafe-item",
                "citation-item",
                "listed-item",
                "listed-item",
              ]);
            }
            for (const favicon of ["/missing.svg", "/favicon-placeholder.svg", "/image.svg"]) {
              await configure(pages, { favicon });
              for (const page of pages) {
                await waitImages(page);
                if (favicon !== "/image.svg") await page.locator("#favicon-owner svg").waitFor();
              }
              await compare(`favicon-${favicon}`);
            }
            for (const page of pages) {
              await page.evaluate(() => window.clearEvents());
              await page.locator('#inline-citation [aria-label="Citations"]').click();
              await page.locator(".openui-citation-tooltip").waitFor();
              const opening = page.waitForEvent("popup");
              await page.locator(".openui-citation-tooltip .openui-citation-item").first().click();
              const target = await opening;
              await target.waitForURL("**/navigation/1");
              await target.close();
              await page.locator(".openui-citation-tooltip").waitFor({ state: "detached" });
              await page
                .locator('#sources > .openui-citation-container [aria-label="Citations"]')
                .click();
              await page.locator(".openui-citation-tooltip").waitFor();
            }
            await observe(pages, `${framework}/${order}/citation-trigger-onClick-prop`, readEvents);
            for (const page of pages) {
              await page.locator("#outside").click();
              await page.locator(".openui-citation-tooltip").waitFor({ state: "detached" });
            }
            await configure(pages, { icon: "not-a-real-icon" });
            for (const page of pages)
              await page.locator("#dynamic-icon .lucide-dollar-sign").waitFor();
            await compare("dynamic-icon-fallback");
            await configure(pages, { sourceCount: 1 });
            for (const page of pages) await waitImages(page);
            await compare("single-source-list");
            await configure(pages, { sourceCount: 0 });
            await compare("empty-source-list");
            await configure(pages, { sourceCount: 7 });
          }
          await configure(pages, {
            overrides: false,
            nested: false,
            src: "/image.svg",
            duration: 0,
          });
          for (const page of pages) {
            await page.mouse.move(0, 0);
            await page.setViewportSize({ width: 360, height: 900 });
            await waitImages(page);
          }
          await compare("responsive-mobile");
          const sheet = await pages[1].locator("#_goober").textContent();
          if (kind === "media") for (const page of pages) await openGallery(page);
          await configure(pages, { visible: false });
          for (const page of pages) {
            assert.equal(
              await page.locator(".openui-gallery__modal,.openui-citation-tooltip").count(),
              0,
            );
            assert.equal(await page.locator("#zone img,#zone svg").count(), 0);
          }
          await configure(pages, { visible: true });
          for (const page of pages) await waitImages(page);
          await compare("remount");
          assert.equal(
            await pages[1].locator("#_goober").textContent(),
            sheet,
            "remount does not duplicate styles",
          );
          const host = await Promise.all(
            pages.map((page) =>
              page.locator("#unrelated").evaluate((node) => {
                const style = getComputedStyle(node);
                return {
                  font: style.font,
                  color: style.color,
                  padding: style.padding,
                  background: style.backgroundColor,
                };
              }),
            ),
          );
          assert.deepEqual(host[1], host[0]);
          assert.equal(host[1].color, "rgb(11, 22, 33)");
          assert.deepEqual(errors, [], "no uncaught browser errors");
          report.cases.push({ framework, order, kind, comparisons, status: "passed" });
          report.snapshots += comparisons;
          console.log(`${framework}/${order}/${kind}: ${comparisons} paired snapshots passed`);
        } finally {
          for (const context of contexts) await context.close();
        }
      }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = String(error.stack || error);
  throw error;
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await save();
}

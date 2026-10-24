import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = fileURLToPath(new URL("../../../../../../", import.meta.url));
const consumer = path.resolve(process.env.CORE_CONSUMER),
  tools = createRequire(path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"));
const { build } = tools("esbuild"),
  { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const sass = createRequire(path.resolve(process.env.CORE_SASS_TOOLS, "package.json"))("sass");
const baseline = path.join(repository, "packages/react-ui/src/components");
const source = await fs.readFile(new URL("overlays.fixture.tsx", import.meta.url), "utf8");
const oldNames = {
  Modal: ["Modal"],
  TooltipWrapper: ["TooltipWrapper"],
  ThemeProvider: ["ThemeProvider"],
};
const oldPrefix =
  Object.entries(oldNames)
    .map(
      ([folder, names]) =>
        `import {${names.join(",")}} from ${JSON.stringify(path.join(baseline, folder))};`,
    )
    .join("\n") + `\nconst Core={${Object.values(oldNames).flat().join(",")}};`;
// Resolve legacy comparison dependencies from the same installed package graph.
const installedDependencies = path.resolve(
  await fs.realpath(path.join(consumer, "node_modules/@openuidev/react-ui-core")),
  "../..",
);
const scripts = {},
  graphs = {};
const hash = (data) => createHash("sha256").update(data).digest("hex");
for (const arm of ["baseline", "runtime"]) {
  const contents =
    arm === "baseline"
      ? source.replace('import * as Core from "@openuidev/react-ui-core";', oldPrefix)
      : source;
  const result = await build({
    stdin: { contents, resolveDir: consumer, loader: "tsx" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    ...(arm === "baseline"
      ? {
          nodePaths: [consumer + "/node_modules", installedDependencies],
          alias: {
            react: consumer + "/node_modules/react",
            "react-dom": consumer + "/node_modules/react-dom",
          },
        }
      : {}),
  });
  if (arm === "runtime")
    assert(
      !Object.keys(result.metafile.inputs).some((file) => file.includes("packages/react-ui/src")),
      "runtime must not import old source",
    );
  scripts[arm] = result.outputFiles[0].text;
  graphs[arm] = hash(scripts[arm]);
}
// Legacy CSS is an explicit comparison input; it is never used by the candidate package build or runtime arm.
const legacyCss = sass.compile(path.join(baseline, "index.scss"), {
  style: "expanded",
  logger: sass.Logger.silent,
}).css;
const hostRoot = path.resolve(process.env.CORE_HOST_STYLES),
  hosts = {};
for (const framework of ["plain", "tailwind3", "tailwind4"])
  hosts[framework] = await fs.readFile(
    path.join(hostRoot, "frameworks", framework + ".css"),
    "utf8",
  );
const layout =
  "body{margin:0}#zone{width:100%;max-width:900px;padding:16px;box-sizing:border-box}#unrelated{font:17px/23px serif;color:rgb(11,22,33);padding:7px;background:rgb(240,241,242)}";
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (u.pathname === "/baseline.js" || u.pathname === "/runtime.js") {
    res.setHeader("content-type", "text/javascript");
    return res.end(scripts[u.pathname.slice(1, -3)]);
  }
  if (u.pathname === "/baseline.css") {
    res.setHeader("content-type", "text/css");
    return res.end(legacyCss);
  }
  const framework = u.searchParams.get("framework"),
    arm = u.searchParams.get("arm");
  if (u.pathname.startsWith("/host/")) {
    res.setHeader("content-type", "text/css");
    return res.end(hosts[u.pathname.slice(6, -4)]);
  }
  if (!["baseline", "runtime"].includes(arm) || !hosts[framework]) {
    res.writeHead(404);
    return res.end();
  }
  res.setHeader("content-type", "text/html");
  res.end(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${arm === "baseline" ? '<link id="component-style" rel="stylesheet" href="/baseline.css">' : ""}<link id="host-style" rel="stylesheet" href="/host/${framework}.css"><style>${layout}</style></head><body><div id="app"></div><script type="module" src="/${arm}.js"></script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const result = {
  browser: browser.version(),
  graphs,
  legacyCssSha256: hash(legacyCss),
  hostHashes: Object.fromEntries(Object.entries(hosts).map(([k, v]) => [k, hash(v)])),
  fixtureSha256: hash(source),
  runnerSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  clock: "advancing Playwright clock initialized at 2026-10-25T12:00:00Z",
  cases: [],
  snapshots: 0,
  pending: ["SSR deferred; inherited Modal focus/label behavior reported separately"],
};
const properties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "fontVariationSettings",
  "backgroundColor",
  "color",
  "border",
  "borderRadius",
  "boxShadow",
  "padding",
  "margin",
  "gap",
  "display",
  "alignItems",
  "justifyContent",
  "boxSizing",
  "cursor",
  "resize",
  "outline",
  "outlineOffset",
  "opacity",
  "pointerEvents",
  "width",
  "height",
  "fill",
  "stroke",
  "strokeWidth",
  "strokeLinecap",
  "transform",
  "overflowX",
  "scrollSnapType",
  "maskImage",
  "minWidth",
  "borderBottom",
  "borderTop",
  "flexShrink",
  "flexGrow",
  "position",
  "zIndex",
  "animationDuration",
  "overflowY",
  "maxHeight",
  "maxWidth",
  "inset",
  "userSelect",
  "willChange",
];
const selector =
  ".openui-modal-root,.openui-modal-overlay,.openui-modal-content,.openui-modal-header,.openui-modal-title,.openui-modal-close,.openui-modal-close svg,.openui-modal-body,.openui-modal-sr-only,.openui-tooltip-content,.openui-tooltip-body,.openui-tooltip-heading,.openui-tooltip-text-content";
const settle = async (page) => {
  await page.waitForTimeout(150);
  await page.evaluate(async () => {
    document.querySelectorAll('[class*="openui-"]').forEach((node) => getComputedStyle(node).color);
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect.getComputedTiming().iterations)) animation.finish();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  // Closed panels must finish hiding, not merely finish their CSS animation.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('#zone .openui-accordion-content[data-state="closed"]')].every(
      (node) => node.hidden,
    ),
  );
};
const snapshot = async (page) => {
  await settle(page);
  return page.locator(selector).evaluateAll(
    (nodes, props) =>
      nodes.map((node) => ({
        tag: node.tagName,
        classes: [...node.classList]
          .filter((name) => name.startsWith("openui-") && !name.startsWith("openui-theme-"))
          .sort(),
        style: Object.fromEntries(props.map((key) => [key, getComputedStyle(node)[key]])),
        disabled: node.hasAttribute("disabled") || node.hasAttribute("data-disabled"),
        state: node.getAttribute("data-state"),
        side: node.getAttribute("data-side"),
        rect: Object.fromEntries(
          ["x", "y", "width", "height"].map((key) => [
            key,
            Math.round(node.getBoundingClientRect()[key] * 1000) / 1000,
          ]),
        ),
      })),
    properties,
  );
};
const configure = async (pages, next) => {
  for (const page of pages) {
    await page.evaluate((next) => window.configure(next), next);
    await page.waitForFunction((next) => {
      const current = JSON.parse(
        document.querySelector("[data-ready]").getAttribute("data-config"),
      );
      return Object.entries(next).every(([key, value]) => current[key] === value);
    }, next);
  }
};
const closeTips = async (pages) => {
  for (const page of pages) {
    await page.mouse.move(0, 0);
    await page.keyboard.press("Escape");
    await page.locator("#outside-before").focus();
    await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
  }
};
const openTip = async (page) => {
  await page.locator("#tip-trigger").hover();
  await page.locator(".openui-tooltip-content").waitFor({ state: "visible" });
};
const openModal = async (page) => {
  await page.locator("#modal-opener").click();
  await page.getByRole("dialog").waitFor();
};
result.inheritedObservations = [];
try {
  for (const framework of (process.env.CORE_MATRIX_FRAMEWORKS || "plain,tailwind3,tailwind4").split(
    ",",
  ))
    for (const order of ["before", "after"])
      for (const kind of (process.env.CORE_MATRIX_CASES || "modal,tooltip").split(",")) {
        const contexts = [],
          pages = [],
          errors = [];
        let comparisons = 0;
        try {
          for (const arm of ["baseline", "runtime"]) {
            const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
            contexts.push(context);
            const page = await context.newPage();
            pages.push(page);
            page.setDefaultTimeout(7000);
            page.on("pageerror", (e) => errors.push(e.message));
            await page.clock.install({ time: new Date("2026-10-25T12:00:00Z") });
            await page.goto(
              `http://127.0.0.1:${server.address().port}/?arm=${arm}&case=${kind}&framework=${framework}`,
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
          const compare = async (label) => {
            const [expected, actual] = await Promise.all(pages.map(snapshot));
            assert.equal(
              actual.length,
              expected.length,
              `${framework}/${order}/${kind}/${label}: node count`,
            );
            for (let i = 0; i < expected.length; i++)
              assert.deepEqual(
                actual[i],
                expected[i],
                `${framework}/${order}/${kind}/${label}/${i}/${expected[i].classes}`,
              );
            comparisons += expected.length;
          };
          for (const theme of ["none", "light", "dark", "custom-light", "custom-dark"]) {
            await configure(pages, { theme, nestedTheme: false, overrides: false });
            if (kind === "modal") {
              for (const page of pages) {
                await openModal(page);
                assert.equal(
                  await page.getByRole("dialog").evaluate((el) => el === document.activeElement),
                  true,
                );
                assert.equal(await page.locator('#zone [role="dialog"]').count(), 0, "body portal");
              }
              for (const size of ["sm", "md", "lg"]) {
                await configure(pages, { size });
                await compare(`${theme}/${size}`);
              }
              for (const page of pages)
                await page.getByRole("button", { name: "Close", exact: true }).hover();
              await compare(`${theme}/close-hover`);
              for (const page of pages) {
                await page.getByRole("dialog").focus();
                await page.keyboard.press("Tab");
                assert.equal(
                  await page
                    .getByRole("button", { name: "Close", exact: true })
                    .evaluate((el) => el === document.activeElement),
                  true,
                );
              }
              await compare(`${theme}/keyboard-close-focus`);
              if (theme.startsWith("custom"))
                for (const page of pages)
                  assert.equal(
                    await page.getByRole("dialog").evaluate((el) => getComputedStyle(el).color),
                    "rgb(40, 70, 90)",
                    "portal custom token",
                  );
              await configure(pages, { overrides: true });
              for (const page of pages)
                assert.equal(
                  await page.getByRole("dialog").evaluate((el) => getComputedStyle(el).padding),
                  "32px",
                );
              await compare(`${theme}/explicit-css-override`);
              for (const page of pages)
                await page.getByRole("button", { name: "Close", exact: true }).hover();
              await compare(`${theme}/override-hover`);
              await configure(pages, { overrides: false });
              for (const width of [360, 1280]) {
                for (const page of pages) {
                  await page.setViewportSize({ width, height: 900 });
                  await page.mouse.move(0, 0);
                }
                await compare(`${theme}/responsive-${width}`);
              }
              await configure(pages, { long: true });
              for (const page of pages)
                await page.waitForFunction(() => {
                  const el = document.querySelector(".openui-modal-body");
                  return el.scrollHeight > el.clientHeight;
                });
              await compare(`${theme}/scrollable-body`);
              await configure(pages, { long: false });
              for (const page of pages) {
                await page.getByRole("button", { name: "Close", exact: true }).click();
                await page.getByRole("dialog").waitFor({ state: "detached" });
                await openModal(page);
                await page.keyboard.press("Escape");
                await page.getByRole("dialog").waitFor({ state: "detached" });
                await openModal(page);
                await page.locator(".openui-modal-overlay").click({ position: { x: 2, y: 2 } });
                await page.getByRole("dialog").waitFor({ state: "detached" });
                assert.equal(
                  await page.locator("#events").evaluate((el) =>
                    JSON.parse(el.textContent)
                      .slice(-3)
                      .every((v) => v[0] === "parent" && v[1] === false),
                  ),
                  true,
                );
              }
              await configure(pages, { pinned: true });
              for (const page of pages) {
                await openModal(page);
                await page.getByRole("button", { name: "Close", exact: true }).click();
                assert.equal(await page.getByRole("dialog").count(), 1, "controlled open pinned");
                await page.evaluate(() => window.setOpen(false));
                await page.getByRole("dialog").waitFor({ state: "detached" });
              }
              await configure(pages, { pinned: false });
            } else {
              for (const page of pages) {
                await openTip(page);
                assert.equal(
                  await page.locator(".openui-tooltip-heading").first().textContent(),
                  "Tooltip heading",
                );
                assert.equal(
                  await page.locator(".openui-tooltip-text-content").first().textContent(),
                  "Supporting tooltip content",
                );
                assert.equal(
                  await page.locator("#zone .openui-tooltip-content").count(),
                  0,
                  "body portal",
                );
              }
              for (const side of ["top", "right", "bottom", "left"]) {
                await configure(pages, { side });
                await compare(`${theme}/side-${side}`);
              }
              for (const align of ["start", "center", "end"]) {
                await configure(pages, { align, sideOffset: 15, alignOffset: 8 });
                await compare(`${theme}/align-${align}-offsets`);
              }
              await configure(pages, {
                side: "bottom",
                align: "start",
                sideOffset: 5,
                alignOffset: 0,
              });
              if (theme.startsWith("custom"))
                for (const page of pages)
                  assert.equal(
                    await page
                      .locator(".openui-tooltip-heading")
                      .first()
                      .evaluate((el) => getComputedStyle(el).color),
                    "rgb(40, 70, 90)",
                    "portal custom token",
                  );
              await configure(pages, { overrides: true });
              await compare(`${theme}/important-override`);
              for (const page of pages) {
                const tip = page.locator(".openui-tooltip-content");
                assert.equal(await tip.evaluate((el) => getComputedStyle(el).padding), "32px");
                await tip.hover();
              }
              await compare(`${theme}/override-hover`);
              await configure(pages, { overrides: false });
              await closeTips(pages);
              for (const page of pages) {
                await page.locator("#tip-trigger").focus();
                await page.locator(".openui-tooltip-content").waitFor();
                assert(await page.locator("#tip-trigger").getAttribute("aria-describedby"));
              }
              await compare(`${theme}/keyboard-focus`);
              for (const page of pages) {
                await page.keyboard.press("Escape");
                await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
                assert.equal(
                  await page
                    .locator("#tip-trigger")
                    .evaluate((el) => document.activeElement === el),
                  true,
                  "Escape preserves trigger focus",
                );
                await page.locator("#outside-before").focus();
                await page.locator("#tip-trigger").focus();
                await page.locator(".openui-tooltip-content").waitFor();
                await page.locator("#outside-before").click();
                await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
                await openTip(page);
                await page.locator("#tip-trigger").click();
                await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
              }
              for (const width of [360, 1280]) {
                for (const page of pages) {
                  await page.setViewportSize({ width, height: 900 });
                  await page.locator("#outside-before").focus();
                  await openTip(page);
                }
                await compare(`${theme}/responsive-${width}`);
                await closeTips(pages);
              }
              await configure(pages, { truncated: true, width: 600 });
              for (const page of pages) {
                await page.locator("#tip-trigger").hover();
                await page.waitForTimeout(150);
                assert.equal(
                  await page.locator(".openui-tooltip-content").count(),
                  0,
                  "untruncated content suppresses tooltip",
                );
                assert.equal(
                  await page
                    .locator(".fixture-heading")
                    .evaluate((el) => el.scrollWidth <= el.clientWidth),
                  true,
                );
              }
              await configure(pages, { width: 100 });
              for (const page of pages) {
                await page.mouse.move(0, 0);
                await openTip(page);
                assert.equal(
                  await page
                    .locator(".fixture-heading")
                    .evaluate((el) => el.scrollWidth > el.clientWidth),
                  true,
                );
              }
              await compare(`${theme}/real-truncation`);
              await closeTips(pages);
              await configure(pages, { selectors: true, content: false });
              for (const page of pages) await openTip(page);
              for (const page of pages)
                assert.equal(await page.locator(".openui-tooltip-text-content").count(), 0);
              await compare(`${theme}/custom-selector-heading-only`);
              await closeTips(pages);
              await configure(pages, { heading: false, content: true });
              for (const page of pages) await openTip(page);
              for (const page of pages)
                assert.equal(await page.locator(".openui-tooltip-heading").count(), 0);
              await compare(`${theme}/content-only`);
              await closeTips(pages);
              await configure(pages, {
                truncated: false,
                selectors: false,
                heading: true,
                content: true,
                width: 140,
                empty: true,
              });
              for (const page of pages) {
                await page.locator("#tip-trigger").click();
                assert.equal(await page.locator(".openui-tooltip-content").count(), 0);
                assert.equal(
                  await page.locator("#events").evaluate((el) => JSON.parse(el.textContent).at(-1)),
                  "trigger-click",
                );
              }
              await configure(pages, { empty: false, disabled: true });
              for (const page of pages) {
                assert.equal(await page.locator("#tip-trigger").isDisabled(), true);
                await page.locator("#outside-before").focus();
                await page.keyboard.press("Tab");
                assert.equal(
                  await page
                    .locator("#tip-trigger")
                    .evaluate((el) => el === document.activeElement),
                  false,
                );
              }
              await configure(pages, { disabled: false });
            }
          }
          await configure(pages, { theme: "light", nestedTheme: true });
          for (const page of pages) {
            if (kind === "modal") await openModal(page);
            else await openTip(page);
            const target = kind === "modal" ? ".openui-modal-content" : ".openui-tooltip-heading";
            assert.equal(
              await page
                .locator(target)
                .first()
                .evaluate((el) => getComputedStyle(el).color),
              "rgb(40, 70, 90)",
              "nested provider reaches portal",
            );
            assert.notEqual(
              await page.locator("#outer-color").evaluate((el) => getComputedStyle(el).color),
              "rgb(40, 70, 90)",
              "outer scope stays light",
            );
            assert.notEqual(
              await page.locator("#independent-color").evaluate((el) => getComputedStyle(el).color),
              "rgb(40, 70, 90)",
              "independent scope unchanged",
            );
          }
          await compare("nested-provider-portal");
          if (kind === "modal") {
            // Record inherited failures as diagnostics, never as successful desired behavior.
            const observations = [];
            for (const page of pages) {
              await page.locator("#inside-last").focus();
              await page.keyboard.press("Tab");
              const escaped = await page.evaluate(
                () => !document.activeElement.closest('[role="dialog"]'),
              );
              await page.locator("#inside-first").focus();
              await page.keyboard.press("Escape");
              await page.getByRole("dialog").waitFor({ state: "detached" });
              const returned = await page
                .locator("#modal-opener")
                .evaluate((el) => el === document.activeElement);
              await configure([page], { nestedModal: true });
              await openModal(page);
              await page.locator("#nested-opener").click();
              await page.getByRole("dialog").nth(1).waitFor();
              const labels = await page.getByRole("dialog").evaluateAll((nodes) =>
                nodes.map((el) => ({
                  title: el.querySelector("h2").textContent,
                  label: document.getElementById(el.getAttribute("aria-labelledby"))?.textContent,
                })),
              );
              await page.keyboard.press("Escape");
              await settle(page);
              const remainingTitles = await page
                .getByRole("dialog")
                .evaluateAll((nodes) => nodes.map((el) => el.querySelector("h2").textContent));
              observations.push({
                focusEscapesDialog: escaped,
                returnsFocusToOpener: returned,
                nestedLabels: labels,
                nestedEscapeRemainingTitles: remainingTitles,
              });
              await page.evaluate(() => {
                window.setOpen(false);
                window.setInner(false);
              });
              await page.waitForFunction(
                () => document.querySelectorAll('[role="dialog"]').length === 0,
              );
            }
            assert.deepEqual(observations[0], observations[1], "inherited diagnostics parity");
            result.inheritedObservations.push({
              framework,
              order,
              kind,
              observations: observations[1],
            });
            await configure(pages, { nestedModal: false, includeTooltip: true });
            for (const page of pages) {
              await openModal(page);
              await openTip(page);
              assert.equal(
                await page
                  .locator(".openui-tooltip-heading")
                  .first()
                  .evaluate((el) => getComputedStyle(el).color),
                "rgb(40, 70, 90)",
                "tooltip inside modal retains nested theme",
              );
            }
            await compare("tooltip-inside-modal");
            const composedDismissal = [];
            for (const page of pages) {
              await page.mouse.move(0, 0);
              await page.getByRole("dialog").focus();
              await settle(page);
              composedDismissal.push({
                tooltipCountAfterPointerLeaveAndDialogFocus: await page
                  .locator(".openui-tooltip-content")
                  .count(),
              });
              await page.evaluate(() => window.setOpen(false));
              await page.getByRole("dialog").waitFor({ state: "detached" });
              await page.locator(".openui-tooltip-content").waitFor({ state: "detached" });
            }
            assert.deepEqual(
              composedDismissal[0],
              composedDismissal[1],
              "inherited composed tooltip dismissal observation",
            );
            result.inheritedObservations.push({
              framework,
              order,
              kind: "modal-tooltip-composition",
              observation: composedDismissal[1],
            });
            await configure(pages, { includeTooltip: false });
          } else {
            await closeTips(pages);
            await configure(pages, { truncated: true, width: 100 });
            for (const page of pages) {
              await openTip(page);
              assert.equal(
                await page.evaluate(() => window.childRef()),
                null,
                "inherited truncation path replaces child ref",
              );
            }
            result.inheritedObservations.push({
              framework,
              order,
              kind,
              childRefReplacedWhenTruncated: true,
            });
            await closeTips(pages);
            await configure(pages, { truncated: false });
          }
          const host = await Promise.all(
            pages.map((p) =>
              p.locator("#unrelated").evaluate((el) => {
                const c = getComputedStyle(el);
                return {
                  font: c.font,
                  color: c.color,
                  padding: c.padding,
                  background: c.backgroundColor,
                };
              }),
            ),
          );
          assert.deepEqual(host[0], host[1]);
          assert.equal(host[1].color, "rgb(11, 22, 33)", "host color preserved");
          await configure(pages, { nestedTheme: false });
          const sheet = await pages[1].locator("#_goober").textContent();
          await configure(pages, { visible: false });
          for (const page of pages) {
            await page
              .locator(".openui-modal-root,.openui-tooltip-content")
              .waitFor({ state: "detached" });
          }
          await configure(pages, { visible: true });
          for (const page of pages) {
            if (kind === "modal") await openModal(page);
            else await openTip(page);
          }
          await compare("remount");
          assert.equal(
            await pages[1].locator("#_goober").textContent(),
            sheet,
            "no duplicate styling on remount",
          );
          assert.deepEqual(errors, [], "no uncaught browser errors");
          result.cases.push({ framework, order, kind, comparisons, status: "passed" });
          result.snapshots += comparisons;
          console.log(`${framework}/${order}/${kind}: ${comparisons} paired snapshots passed`);
        } finally {
          for (const context of contexts) await context.close();
        }
      }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  if (process.env.CORE_BROWSER_RESULTS)
    await fs.writeFile(process.env.CORE_BROWSER_RESULTS, JSON.stringify(result, null, 2) + "\n");
}

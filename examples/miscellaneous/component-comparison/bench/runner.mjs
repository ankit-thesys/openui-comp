import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { gzipSync } from "node:zlib";
import pixelmatch from "pixelmatch";
import {
  matrix,
  verdict,
  summarize,
  compareLayer,
  classifyKnown,
  validateCase,
  rendererNoticesPass,
  RUNNER_VERSION,
  CHROME_VERSION,
  DEFAULT_CHROME,
  NORMALIZATION,
} from "./model.mjs";
import { htmlReport } from "./report.mjs";
import { getThemePreset } from "../src/theme-presets.mjs";
import { measureDocument } from "./probes.mjs";
import { chartVariantAssertions } from "./chart-variant-oracles.mjs";
const root = path.resolve(import.meta.dirname, "..");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
export async function loadCases() {
  const builtin = await readJson(path.join(root, "bench/cases.json"));
  let saved = [];
  try {
    saved = await Promise.all(
      (await fs.readdir(path.join(root, ".bench-cases")))
        .filter((n) => n.endsWith(".json"))
        .map((n) => readJson(path.join(root, ".bench-cases", n))),
    );
  } catch {}
  return [...builtin, ...saved];
}
async function writeJson(p, v) {
  const temporary = p + "." + randomUUID() + ".tmp";
  await fs.writeFile(temporary, JSON.stringify(v, null, 2) + "\n");
  await fs.rename(temporary, p);
}
async function provenance(executable, browser, bundleDir, frozen) {
  const binary = await fs.readFile(executable);
  const artifacts = frozen?.artifacts ?? [];
  if (!frozen)
    for (const name of (await fs.readdir(path.join(root, ".artifacts")))
      .filter((n) => n.endsWith(".tgz"))
      .sort()) {
      const p = path.join(root, ".artifacts", name);
      const manifest = JSON.parse(
        execFileSync("tar", ["-xOf", p, "package/package.json"], {
          encoding: "utf8",
        }),
      );
      artifacts.push({
        file: name,
        name: manifest.name,
        version: manifest.version,
        sha256: sha(await fs.readFile(p)),
      });
    }
  const bundleFiles = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(p);
      else
        bundleFiles.push({
          path: path.relative(bundleDir, p),
          sha256: sha(await fs.readFile(p)),
        });
    }
  }
  await walk(bundleDir);
  if (
    frozen &&
    !isDeepStrictEqual(
      [...bundleFiles].sort((a, b) => a.path.localeCompare(b.path)),
      [...frozen.bundles].sort((a, b) => a.path.localeCompare(b.path)),
    )
  )
    throw Error("Historical runtime bundle integrity mismatch");
  return {
    runnerVersion: RUNNER_VERSION,
    runnerFiles: await Promise.all(
      [
        "runner.mjs",
        "probes.mjs",
        "model.mjs",
        "chart-variant-oracles.mjs",
      ].map(async (n) => ({
        file: n,
        sha256: sha(await fs.readFile(path.join(root, "bench", n))),
      })),
    ),
    browser: {
      version: browser.version(),
      expected: CHROME_VERSION,
      binary: executable,
      sha256: sha(binary),
      mode: "headless",
      locale: "en-US",
      timezone: "UTC",
      dpr: 1,
    },
    host: {
      platform: os.platform(),
      release: os.release(),
      architecture: os.arch(),
    },
    artifacts,
    bundles: bundleFiles,
    lockSha256:
      frozen?.lockSha256 ??
      sha(await fs.readFile(path.join(root, "package-lock.json"))),
    archiveIdentity: frozen
      ? "Inherited from the historical run; actual frozen browser bundles are rehashed. Original tarballs are identified but not silently relabeled as current."
      : "Current local archives and build",
    registries:
      frozen?.registries ??
      (await Promise.all(
        ["legacy", "migrated"].map(async (name) => ({
          name,
          sha256: sha(
            await fs.readFile(path.join(root, ".generated", name + ".json")),
          ),
        })),
      )),
    hostFixtures: await readJson(
      path.join(bundleDir, "bench-host/manifest.json"),
    ),
  };
}
function locator(frame, a) {
  if (a.role)
    return frame
      .getByRole(a.role, {
        ...(a.name !== undefined ? { name: a.name, exact: true } : {}),
      })
      .nth(a.index ?? 0);
  if (a.placeholder)
    return frame.getByPlaceholder(a.placeholder, { exact: true }).first();
  if (a.text) return frame.getByText(a.text, { exact: true }).first();
  return frame.locator(a.selector ?? "#comparison-pane").nth(a.index ?? 0);
}
async function assertion(frame, a, events, pane) {
  try {
    let actual, details;
    if (a.kind === "text")
      actual = a.exact
        ? (await (
            a.selector
              ? frame.locator(a.selector)
              : frame.locator("#comparison-pane")
          )
            .getByText(a.value, { exact: true })
            .count()) > 0
        : (
            await frame
              .locator(a.selector ?? "#comparison-pane")
              .allTextContents()
          )
            .join("\n")
            .includes(a.value);
    else if (a.kind === "count")
      actual = a.role
        ? await frame
            .getByRole(a.role, {
              ...(a.name ? { name: a.name, exact: true } : {}),
            })
            .count()
        : await frame.locator(a.selector).count();
    else if (a.kind === "empty")
      actual =
        (await frame.locator(".assistant-message").innerText()).trim() === "";
    else if (a.kind === "clipboardText")
      actual = await frame.evaluate(() => navigator.clipboard.readText());
    else if (a.kind === "value")
      actual = await locator(frame, a).inputValue({ timeout: 800 });
    else if (a.kind === "checked")
      actual = await locator(frame, a).isChecked({ timeout: 800 });
    else if (a.kind === "focused")
      actual = await locator(frame, a).evaluate(
        (e) => document.activeElement === e,
        { timeout: 800 },
      );
    else if (a.kind === "attribute")
      actual = await locator(frame, a).getAttribute(a.attribute, {
        timeout: 800,
      });
    else if (a.kind === "scrollLeft")
      actual = await locator(frame, a).evaluate((e) => e.scrollLeft);
    else if (a.kind === "stableHeight") {
      details = await frame.locator(a.selector).evaluate(async (e, frames) => {
        const values = [];
        for (let i = 0; i < frames; i++) {
          await new Promise((r) => requestAnimationFrame(r));
          values.push(e.getBoundingClientRect().height);
        }
        return values;
      }, a.frames ?? 12);
      actual = details.every((v) => v === details[0]) && details[0] > 0;
    } else if (a.kind === "actionCount")
      actual = events.filter(
        (e) => e.pane === pane && e.type === "action",
      ).length;
    else if (a.kind === "actions")
      actual = JSON.parse(
        JSON.stringify(
          events
            .filter((e) => e.pane === pane && e.type === "action")
            .map((e) => e.action),
        ),
      );
    else if (a.kind === "noNotices")
      actual = await frame.locator(".pane-error").count();
    else if (a.kind === "imagePending")
      actual = await frame
        .locator("img")
        .evaluateAll((es) => es.filter((e) => !e.complete).length);
    else if (a.kind === "imageError")
      actual = await frame
        .locator("img")
        .evaluateAll(
          (es) => es.filter((e) => e.complete && e.naturalWidth === 0).length,
        );
    else if (a.kind === "allDisabled")
      actual = await frame
        .locator(a.selector)
        .evaluateAll(
          (es) =>
            es.length > 0 &&
            es.every(
              (e) =>
                e.matches(":disabled") ||
                e.getAttribute("aria-disabled") === "true" ||
                e.closest("[data-disabled]"),
            ),
        );
    else if (a.kind === "css")
      actual = await locator(frame, a).evaluate(
        (e, p) => getComputedStyle(e)[p],
        a.property,
      );
    else throw Error("Unimplemented assertion " + a.kind);
    return {
      id: a.id,
      ...(details ? { details } : {}),
      expected: a.minimum === undefined ? a.expected : { minimum: a.minimum },
      actual,
      pass:
        a.minimum === undefined
          ? isDeepStrictEqual(actual, a.expected)
          : actual >= a.minimum,
    };
  } catch (error) {
    return {
      id: a.id,
      expected: a.expected ?? { minimum: a.minimum },
      actual: null,
      pass: false,
      error: error.message.split("\n")[0],
    };
  }
}
async function assertions(page, frames, list) {
  const events = await page.evaluate(() => window.benchEvents);
  return Promise.all(
    list.map(async (a) => {
      const arms = await Promise.all(
        frames.map((f, pane) => assertion(f, a, events, pane)),
      );
      return {
        id: a.id,
        pass: arms.every((a) => a.pass),
        expected: arms[0].expected,
        actual: arms.map((a) => a.actual),
        arms,
      };
    }),
  );
}
async function step(frame, s) {
  const l = locator(frame, s);
  if (s.op === "dblclick") await l.dblclick({ timeout: 1200 });
  if (s.op === "click") await l.click({ timeout: 1200 });
  if (s.op === "fill") await l.fill(s.value, { timeout: 1200 });
  if (s.op === "key") {
    await l.focus({ timeout: 1200 });
    await l.press(s.key === "Space" ? " " : s.key, {
      timeout: 1200,
      delay: 50,
    });
  }
  if (s.op === "hover") await l.hover({ timeout: 1200 });
  if (s.op === "scroll") await l.scrollIntoViewIfNeeded({ timeout: 1200 });
  if (s.op === "select") await l.selectOption(s.value, { timeout: 1200 });
}
async function captureArm(page, frame, cell, dir, label, arm) {
  await frame.evaluate(async (environment) => {
    const host = document.querySelector("link[data-bench-host]");
    if (!host) throw Error("Host fixture missing");
    const after = environment.endsWith("-after");
    if (
      host !==
      (after ? document.head.lastElementChild : document.head.firstElementChild)
    ) {
      if (after) document.head.append(host);
      else document.head.prepend(host);
    }
    for (let i = 0; i < 120 && !host.sheet; i++)
      await new Promise((r) => setTimeout(r, 10));
    if (!host.sheet || ![...document.styleSheets].includes(host.sheet))
      throw Error("Host stylesheet not registered");
    await new Promise((r) => requestAnimationFrame(r));
  }, cell.environment);
  let probe, aria;
  const image = path.join(
    "evidence",
    cell.id,
    `${label}-${arm === 0 ? "legacy" : "migrated"}.png`,
  );
  const height = await frame.evaluate(() =>
    Math.max(innerHeight, document.documentElement.scrollHeight),
  );
  if (height > 20000)
    throw Error(
      "Document exceeds bounded 20000px capture; not cropped or accepted",
    );
  const stitched = new PNG({ width: cell.width, height });
  const handle = await page.locator("iframe").nth(arm).elementHandle();
  const originalStyle = await handle.getAttribute("style");
  await handle.evaluate((e) => {
    e.style.position = "fixed";
    e.style.left = "0px";
    e.style.top = "0px";
    e.style.zIndex = "2147483647";
  });
  await frame.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  probe = await frame.evaluate(measureDocument);
  aria = await frame.locator("body").ariaSnapshot();
  try {
    for (let y = 0; y < height; y += cell.height) {
      const actual = await frame.evaluate(async (y) => {
        scrollTo(0, y);
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
        return scrollY;
      }, y);
      const tile = PNG.sync.read(
        await handle.screenshot({ animations: "disabled" }),
      );
      PNG.bitblt(
        tile,
        stitched,
        0,
        0,
        cell.width,
        Math.min(tile.height, height - actual),
        0,
        actual,
      );
    }
  } finally {
    await handle.evaluate((e, style) => {
      if (style === null) e.removeAttribute("style");
      else e.setAttribute("style", style);
    }, originalStyle);
  }
  await frame.evaluate(({ x, y }) => scrollTo(x, y), probe.scroll);
  await fs.writeFile(path.join(dir, image), PNG.sync.write(stitched));
  return { probe, aria, image };
}
async function compareCaptures(arms, cell, dir, label) {
  const probes = arms.map((a) => a.probe),
    aria = arms.map((a) => a.aria),
    images = arms.map((a) => a.image);
  const left = PNG.sync.read(await fs.readFile(path.join(dir, images[0]))),
    right = PNG.sync.read(await fs.readFile(path.join(dir, images[1])));
  let screenshot = { status: "Review", differentPixels: null };
  if (left.width === right.width && left.height === right.height) {
    const diff = new PNG({ width: left.width, height: left.height });
    const count = pixelmatch(
      left.data,
      right.data,
      diff.data,
      left.width,
      left.height,
      { threshold: 0, includeAA: true },
    );
    const p = path.join("evidence", cell.id, label + "-diff.png");
    await fs.writeFile(path.join(dir, p), PNG.sync.write(diff));
    images.push(p);
    screenshot = {
      status: count === 0 ? "Pass" : "Review",
      differentPixels: count,
      totalPixels: left.width * left.height,
      threshold: 0,
      includeAA: true,
    };
  }
  const layers = {
    semantics: compareLayer(
      { text: probes[0].text, aria: aria[0], bounded: probes[0].semantics },
      { text: probes[1].text, aria: aria[1], bounded: probes[1].semantics },
      "semantics",
    ),
    layout: compareLayer(probes[0].geometry, probes[1].geometry, "geometry"),
    styles: compareLayer(probes[0].styles, probes[1].styles, "computed-style"),
    screenshot,
  };
  return { label, probes, aria, layers, images };
}
async function capture(page, frames, cell, c, dir, label) {
  const arms = [];
  for (let arm = 0; arm < 2; arm++)
    arms.push(await captureArm(page, frames[arm], cell, dir, label, arm));
  return compareCaptures(arms, cell, dir, label);
}
function combineAssertions(byArm) {
  return byArm[0].map((left, i) => {
    const right = byArm[1][i];
    return {
      id: left.id,
      pass: left.pass && right.pass,
      expected: left.expected,
      actual: [left.actual, right.actual],
      arms: [left, right],
    };
  });
}
async function executeCell(browser, origin, c, cell, dir, themePreset, slot) {
  const evidenceDir = path.join(dir, "evidence", cell.id);
  await fs.mkdir(evidenceDir, { recursive: true });
  let context = slot.context,
    page = slot.page;
  const network = [],
    consoleErrors = [],
    pageErrors = [],
    held = [];
  let releaseAssets;
  const assetGate = new Promise((r) => (releaseAssets = r));
  if (!context || slot.caseId !== c.id) {
    await context?.close();
    context = await browser.newContext({
      viewport: { width: cell.width * 2 + 16, height: cell.height },
      deviceScaleFactor: 1,
      locale: "en-US",
      timezoneId: "UTC",
      reducedMotion: "reduce",
    });
    if (c.setup.clipboard)
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    page = await context.newPage();
    page.setDefaultTimeout(2500);
    slot.context = context;
    slot.page = page;
    slot.caseId = c.id;
    slot.loaded = false;
    slot.revision = 0;
    await context.route("**/*", async (route) => {
      const current = slot.current;
      if (!current) {
        try {
          await route.abort();
        } catch {}
        return;
      }
      const u = new URL(route.request().url());
      if (
        u.origin !== origin ||
        u.pathname.startsWith("/api/") ||
        u.pathname.startsWith("/bench-api/") ||
        u.pathname.startsWith("/bench-artifacts/")
      ) {
        current.network.push({
          url: u.origin === origin ? u.pathname : u.origin + u.pathname,
          method: route.request().method(),
        });
        try {
          await route.abort();
        } catch {}
        return;
      }
      if (c.setup.holdAssets && u.searchParams.has("bench-loading")) {
        current.held.push(u.pathname);
        await current.assetGate;
        if (page.isClosed()) return;
      }
      try {
        await route.continue();
      } catch {}
    });
    page.on("pageerror", (e) => slot.current?.pageErrors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning")
        slot.current?.consoleErrors.push({ type: m.type(), text: m.text() });
    });
  }
  slot.current = { network, consoleErrors, pageErrors, held, assetGate };
  let revision = slot.revision ?? 0;
  let frames = [];
  const checkpoints = [];
  const checks = [];
  const timeout = setTimeout(() => {
    slot.context = undefined;
    void context.close();
  }, 45000);
  let failure;
  try {
    if (!slot.loaded) {
      await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"));
      await page.goto(origin + "/bench-runner.html");
      slot.loaded = true;
    }
    await page.setViewportSize({
      width: cell.width * 2 + 16,
      height: cell.height,
    });
    await page.mouse.move(0, 0);
    await page.evaluate((viewId) => {
      window.benchEvents = [];
      window.benchViewId = viewId;
    }, cell.id);
    await page.evaluate(({ width, height }) => {
      for (const f of document.querySelectorAll("iframe")) {
        f.style.width = width + "px";
        f.style.height = height + "px";
      }
    }, cell);
    await page.waitForFunction(() => window.benchReady.size === 2);
    frames = page
      .frames()
      .filter((f) => /\/(legacy|migrated)\.html$/.test(f.url()));
    for (const f of frames) {
      if (!(await f.locator("style[data-bench-motion]").count())) {
        const style = await f.addStyleTag({
          content:
            "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
        });
        await style.evaluate((e) => (e.dataset.benchMotion = "true"));
      }
      await f.evaluate(async ({ environment }) => {
        document.querySelector("link[data-bench-host]")?.remove();
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.dataset.benchHost = environment;
        link.href =
          "/bench-host/" +
          (environment.startsWith("tailwind3")
            ? "tailwind3"
            : environment.startsWith("tailwind4")
              ? "tailwind4"
              : "plain") +
          ".css";
        const loaded = new Promise((resolve, reject) => {
          link.onload = resolve;
          link.onerror = reject;
        });
        if (environment.endsWith("-before") || environment === "plain")
          document.head.prepend(link);
        else document.head.append(link);
        await loaded;
      }, cell);
    }

    const viewId = cell.id;
    async function deliver(content, status = "idle") {
      await page.evaluate(
        ({
          content,
          status,
          revision,
          viewId,
          theme,
          pendingQuery,
          directHorizontal,
          themePreset,
        }) => {
          for (const f of document.querySelectorAll("iframe"))
            f.contentWindow.postMessage(
              {
                channel: "openui-component-comparison/v1",
                type: "snapshot",
                snapshot: {
                  messages: [{ id: viewId, role: "assistant", content }],
                  status,
                  error: "",
                  theme,
                  viewId,
                  revision,
                  allowActions: status === "idle",
                  presetId: themePreset.id,
                  themePreset,
                  bench: { pendingQuery, directHorizontal },
                },
              },
              location.origin,
            );
        },
        {
          content,
          status,
          revision: ++revision,
          viewId,
          theme: cell.theme,
          pendingQuery: !!c.setup.pendingQuery,
          directHorizontal: c.setup.directHorizontal,
          themePreset,
        },
      );
      await page.waitForFunction(
        ({ revision }) =>
          [...document.querySelectorAll("iframe")].every(
            (f) =>
              f.contentDocument.querySelector("#pane-revision")?.textContent ===
              String(revision),
          ),
        { revision },
      );
    }
    async function settle() {
      for (const f of frames)
        await f.evaluate(async (holdAssets) => {
          await document.fonts.ready;
          if (!holdAssets)
            await Promise.all(
              [...document.images].map(async (image) => {
                if (!image.complete)
                  await Promise.race([
                    new Promise((r) => {
                      image.addEventListener("load", r, { once: true });
                      image.addEventListener("error", r, { once: true });
                    }),
                    new Promise((_, reject) =>
                      setTimeout(
                        () => reject(Error("Image readiness timeout")),
                        3000,
                      ),
                    ),
                  ]);
                if (image.naturalWidth) await image.decode();
              }),
            );
          let previous = "",
            stable = 0;
          for (let n = 0; n < 60; n++) {
            const current = [...document.querySelectorAll("svg")]
              .map((e) => e.outerHTML)
              .join("");
            stable = current === previous ? stable + 1 : 0;
            if (stable >= 3) return;
            previous = current;
            await new Promise((r) => setTimeout(r, 30));
          }
          throw Error("SVG geometry did not settle");
        }, !!c.setup.holdAssets);
      await page.waitForTimeout(120);
      for (const frame of frames)
        await frame.evaluate(async () => {
          let previous = "",
            stable = 0;
          for (let n = 0; n < 60; n++) {
            const current = [
              ...document.querySelectorAll(".openui-carousel-content"),
            ]
              .map((e) => e.scrollLeft)
              .join(",");
            stable = current === previous ? stable + 1 : 0;
            if (stable >= 3) return;
            previous = current;
            await new Promise((r) => setTimeout(r, 30));
          }
          throw Error("Carousel scroll did not settle");
        });
      for (const f of frames)
        await f.evaluate(async ({ environment }) => {
          const host = document.querySelector("link[data-bench-host]");
          const after = environment.endsWith("-after");
          const edge = after
            ? document.head.lastElementChild
            : document.head.firstElementChild;
          if (edge !== host) {
            if (after) document.head.append(host);
            else document.head.prepend(host);
          }
          for (let tries = 0; tries < 120 && !host.sheet; tries++)
            await new Promise((r) => setTimeout(r, 10));
          if (!host.sheet || ![...document.styleSheets].includes(host.sheet))
            throw Error(
              "Host stylesheet is not registered; comparison aborted",
            );
          await new Promise((r) => requestAnimationFrame(r));
        }, cell);
    }
    if (cell.delivery === "stream") {
      const chunks =
        c.source.match(
          new RegExp("[\\s\\S]{1," + c.chunkSchedule.characters + "}", "g"),
        ) ?? [];
      let source = "";
      const boundaries = new Set([
        Math.ceil(chunks.length * 0.5),
        chunks.length,
      ]);
      for (let i = 0; i < chunks.length; i++) {
        source += chunks[i];
        await deliver(source, "streaming");
        if (boundaries.has(i + 1)) {
          await settle();
          const captured = await capture(
            page,
            frames,
            cell,
            c,
            dir,
            "chunk-" + (i + 1),
          );
          checkpoints.push(captured);
          if (i === chunks.length - 1 && c.streamingAssertions)
            checks.push(
              ...(await assertions(page, frames, c.streamingAssertions)),
            );
        }
        if (c.chunkSchedule.delayMs)
          await page.waitForTimeout(c.chunkSchedule.delayMs);
      }
    }
    await deliver(c.source, c.setup.isStreaming ? "streaming" : "idle");
    await settle();
    const notices = await Promise.all(
      frames.map((f) => f.locator(".pane-error").allTextContents()),
    );
    checks.push({
      id: "renderer-notices",
      expected: [[], []],
      actual: notices,
      pass: rendererNoticesPass(notices),
    });
    const finalArms = [],
      independent = [[], []],
      intermediate = [[], []];
    for (let arm = 0; arm < 2; arm++) {
      const frame = frames[arm];
      const frameElement = await page
        .locator("iframe")
        .nth(arm)
        .elementHandle();
      const armStyle = await frameElement.getAttribute("style");
      await frameElement.evaluate((e) => {
        e.style.position = "fixed";
        e.style.left = "0px";
        e.style.top = "0px";
        e.style.zIndex = "2147483646";
      });
      if (c.setup.clipboard) {
        await page.bringToFront();
        await frame.evaluate(() => window.focus());
        await frame.evaluate(() =>
          navigator.clipboard.writeText("__bench-unset__"),
        );
      }
      for (const s of c.steps) {
        if (s.op === "checkpoint") {
          const events = await page.evaluate(() => window.benchEvents);
          for (const a of s.assertions)
            intermediate[arm].push(await assertion(frame, a, events, arm));
        } else await step(frame, s);
      }
      await settle();
      const events = await page.evaluate(() => window.benchEvents);
      for (const a of c.assertions)
        independent[arm].push(await assertion(frame, a, events, arm));
      finalArms.push(await captureArm(page, frame, cell, dir, "complete", arm));
      await frameElement.evaluate((e, style) => {
        if (style === null) e.removeAttribute("style");
        else e.setAttribute("style", style);
      }, armStyle);
    }
    if (intermediate[0].length) checks.push(...combineAssertions(intermediate));
    checks.push(...combineAssertions(independent));
    const final = await compareCaptures(finalArms, cell, dir, "complete");
    checkpoints.push(final);
    checks.push(...chartVariantAssertions(c, final.probes));
    const unnamed = final.probes.map((p) => p.unnamedControls);
    checks.push({
      id: "interactive-accessible-names",
      expected: [[], []],
      actual: unnamed,
      pass: unnamed.every((a) => !a.length),
    });
    const references = final.probes.map((p) => p.brokenReferences);
    checks.push({
      id: "aria-references-resolve",
      expected: [[], []],
      actual: references,
      pass: references.every((a) => !a.length),
    });
    const events = await page.evaluate(() => window.benchEvents);
    checks.push({
      id: "exact-action-parity",
      expected: "Equal exact action payloads",
      actual: events
        .filter((e) => e.type === "action")
        .map((e) => ({ pane: e.pane, action: e.action })),
      pass: isDeepStrictEqual(
        events
          .filter((e) => e.type === "action" && e.pane === 0)
          .map((e) => e.action),
        events
          .filter((e) => e.type === "action" && e.pane === 1)
          .map((e) => e.action),
      ),
    });
  } catch (error) {
    failure = error.message;
    if (frames.length === 2 && !page.isClosed())
      try {
        checkpoints.push(await capture(page, frames, cell, c, dir, "failure"));
      } catch {}
  } finally {
    clearTimeout(timeout);
    releaseAssets();
    slot.current = null;
    slot.revision = revision;
  }
  const layers = {
    behavior: {
      status: failure ? "Fail" : checks.every((c) => c.pass) ? "Pass" : "Fail",
      assertions: checks,
      ...(failure ? { error: failure } : {}),
    },
    semantics: { status: "Pass", differences: [] },
    layout: { status: "Pass", differences: [] },
    styles: { status: "Pass", differences: [] },
    screenshot: { status: "Pass", captures: [] },
    network: { status: network.length ? "Fail" : "Pass", violations: network },
  };
  for (const captured of checkpoints) {
    for (const key of ["semantics", "layout", "styles"])
      if (captured.layers[key].status === "Fail") {
        layers[key].status = "Fail";
        layers[key].differences.push({
          checkpoint: captured.label,
          differences: captured.layers[key].differences,
        });
      }
    if (captured.layers.screenshot.status === "Review")
      layers.screenshot.status = "Review";
    layers.screenshot.captures.push({
      checkpoint: captured.label,
      ...captured.layers.screenshot,
    });
  }
  if (!checkpoints.length)
    for (const key of ["semantics", "layout", "styles", "screenshot"])
      layers[key] = {
        status: "Not covered",
        reason: "Capture did not complete",
      };
  if (failure)
    for (const key of ["semantics", "layout", "styles", "screenshot"])
      layers[key] = {
        status: "Not covered",
        reason:
          "Interaction aborted before equivalent states; failure screenshots retained for diagnosis.",
      };
  if (pageErrors.length) {
    layers.behavior.status = "Fail";
    layers.behavior.pageErrors = pageErrors;
  }
  if (!c.assertions.length) {
    layers.behavior.status = "Not covered";
    layers.behavior.reason =
      "Saved case has no independent expected assertions";
  }
  classifyKnown(layers, c.knownIssues);
  const evidence = path.join("evidence", cell.id, "measurements.json.gz");
  await fs.writeFile(
    path.join(dir, evidence),
    gzipSync(
      JSON.stringify({
        cell,
        caseVersion: c.version,
        layers,
        checkpoints,
        network,
        pageErrors,
        consoleErrors,
        heldAssets: held,
        normalization: NORMALIZATION,
      }),
    ),
  );
  for (const key of ["semantics", "layout", "styles"])
    if (layers[key].differences?.length) {
      layers[key].differenceCount = layers[key].differences.reduce(
        (n, d) => n + d.differences.length,
        0,
      );
      layers[key].differences = layers[key].differences.map((d) => ({
        ...d,
        total: d.differences.length,
        differences: d.differences.slice(0, 12),
      }));
    }
  return {
    cell,
    executed: true,
    verdict: verdict(layers),
    layers,
    images: checkpoints.at(-1)?.images ?? [],
    evidence,
    reproduce: `npm run bench -- --from-run=${path.basename(dir)} --case=${c.id} --width=${cell.width} --theme=${cell.theme} --delivery=${cell.delivery}`,
  };
}
async function executeSharedCell(browser, origin, c, cell, dir, themePreset) {
  const context = await browser.newContext({
    viewport: {
      width: Math.ceil((cell.width * 2 + 40) / 0.9) + 80,
      height: 1100,
    },
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(4000);
  const network = [],
    pageErrors = [],
    checks = [],
    captures = [];
  let frames = [];
  await fs.mkdir(path.join(dir, "evidence", cell.id), { recursive: true });
  const check = (id, expected, actual) =>
    checks.push({
      id,
      expected,
      actual,
      pass: isDeepStrictEqual(expected, actual),
    });
  await context.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (
      u.origin !== origin ||
      u.pathname.startsWith("/api/") ||
      u.pathname.startsWith("/bench-api/")
    ) {
      network.push(u.pathname);
      return route.abort();
    }
    return route.continue();
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.addInitScript(() => {
    window.benchJourneyEvents = [];
    addEventListener("message", (event) => {
      if (
        event.origin !== location.origin ||
        event.data?.channel !== "openui-component-comparison/v1" ||
        event.data.type !== "action"
      )
        return;
      const pane = [...document.querySelectorAll("iframe")].findIndex(
        (f) => f.contentWindow === event.source,
      );
      if (pane >= 0) window.benchJourneyEvents.push({ pane, ...event.data });
    });
  });
  let error;
  try {
    await page.goto(origin + "/?mode=offline");
    await page.getByRole("button", { name: "Render all instantly" }).waitFor();
    await page.evaluate(({ width, height }) => {
      for (const f of document.querySelectorAll("iframe")) {
        f.style.width = width + "px";
        f.style.height = height + "px";
      }
      document.querySelector(".panes").style.display = "flex";
    }, cell);
    await page
      .getByLabel("Shared theme", { exact: true })
      .selectOption(cell.theme);
    await page.getByLabel("Shared theme preset").selectOption(themePreset.id);
    frames = page
      .frames()
      .filter((f) => /\/(legacy|migrated)\.html$/.test(f.url()));
    for (const f of frames) {
      await f.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
      });
      await f.evaluate(async (environment) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.dataset.benchHost = environment;
        link.href =
          "/bench-host/" +
          (environment.startsWith("tailwind3")
            ? "tailwind3"
            : environment.startsWith("tailwind4")
              ? "tailwind4"
              : "plain") +
          ".css";
        const loaded = new Promise((resolve, reject) => {
          link.onload = resolve;
          link.onerror = reject;
        });
        if (environment.endsWith("-after")) document.head.append(link);
        else document.head.prepend(link);
        await loaded;
      }, cell.environment);
    }
    await page
      .getByRole("button", {
        name:
          cell.delivery === "stream" ? "Stream demo" : "Render all instantly",
        exact: true,
      })
      .click();
    await page.getByText("Local response ready", { exact: true }).waitFor();
    for (const f of frames) await f.getByPlaceholder("Offline name").waitFor();
    check(
      "session.identical-source",
      [c.source, c.source],
      await Promise.all(
        frames.map((f) => f.locator("#pane-source").textContent()),
      ),
    );
    await frames[0].getByPlaceholder("Offline name").fill("Ada");
    check(
      "session.independent-draft",
      "",
      await frames[1].getByPlaceholder("Offline name").inputValue(),
    );
    await frames[0]
      .getByRole("button", { name: "Log form values", exact: true })
      .click();
    await frames[1].getByPlaceholder("Offline name").fill("Ada");
    await frames[1]
      .getByRole("button", { name: "Log form values", exact: true })
      .click();
    await page.waitForFunction(() => window.benchJourneyEvents.length === 2);
    const actionEvents = await page.evaluate(() =>
      window.benchJourneyEvents.map((e) => ({
        pane: e.pane,
        action: JSON.parse(JSON.stringify(e.action)),
      })),
    );
    const expectedAction = {
      type: "continue_conversation",
      params: {},
      humanFriendlyMessage: "Submitted offline form",
      formName: "offline-form",
      formState: {
        "offline-form": {
          tags: { value: ["chat"], componentType: "Chips" },
          kit: { value: "chat", componentType: "OptionCards" },
          name: { value: "Ada" },
        },
      },
    };
    check(
      "session.exact-payloads",
      [
        { pane: 0, action: expectedAction },
        { pane: 1, action: expectedAction },
      ],
      actionEvents,
    );
    const activity = JSON.parse(
      await page.getByTestId("activity-log").innerText(),
    );
    check(
      "session.local-log-panes",
      ["legacy", "migrated"],
      activity.map((e) => e.pane),
    );
    await page
      .getByRole("button", { name: "Stream demo", exact: true })
      .click();
    await page.waitForFunction(() => {
      const d = document.querySelector("iframe").contentDocument;
      return (
        d.querySelector("#pane-source")?.textContent.length > 180 &&
        d.querySelector("#pane-status")?.textContent === "replaying"
      );
    });
    await page.getByRole("button", { name: "Stop", exact: true }).click();
    const stopped = await frames[0].locator("#pane-source").textContent();
    await page.waitForTimeout(70);
    check(
      "session.stop-retains-partial",
      true,
      stopped.length > 0 &&
        stopped.length < c.source.length &&
        (await frames[0].locator("#pane-source").textContent()) === stopped,
    );
    await page.getByRole("button", { name: "Replay", exact: true }).click();
    await page.getByText("Local response ready", { exact: true }).waitFor();
    check(
      "session.immutable-replay",
      [c.source, c.source],
      await Promise.all(
        frames.map((f) => f.locator("#pane-source").textContent()),
      ),
    );
    await frames[0]
      .getByText("Log an offline follow-up", { exact: true })
      .click();
    await page.waitForFunction(() => window.benchJourneyEvents.length === 3);
    const valid = await page.evaluate(() => window.benchJourneyEvents.at(-1));
    const before = JSON.parse(
      await page.getByTestId("activity-log").innerText(),
    ).length;
    await page.evaluate(
      (packet) => window.postMessage(packet, location.origin),
      valid,
    );
    await page.waitForTimeout(30);
    check(
      "session.wrong-source-rejected",
      before,
      JSON.parse(await page.getByTestId("activity-log").innerText()).length,
    );
    await page
      .getByRole("button", { name: "Stream demo", exact: true })
      .click();
    await page.getByLabel("Demo mode").selectOption("live");
    await page.getByLabel("Demo mode").selectOption("offline");
    await page.waitForTimeout(100);
    check(
      "session.mode-cancels-source",
      ["", ""],
      await Promise.all(
        frames.map((f) => f.locator("#pane-source").textContent()),
      ),
    );
    await frames[0].evaluate(
      (packet) => parent.postMessage(packet, location.origin),
      valid,
    );
    await page.waitForTimeout(30);
    check(
      "session.stale-action-rejected",
      [],
      JSON.parse(await page.getByTestId("activity-log").innerText()),
    );
    await page.mouse.move(0, 0);
    for (const f of frames) await f.evaluate(() => document.fonts.ready);
    const captured = await capture(page, frames, cell, c, dir, "complete");
    captures.push(captured);
  } catch (e) {
    error = e.message;
    if (frames.length === 2)
      try {
        captures.push(await capture(page, frames, cell, c, dir, "failure"));
      } catch {}
  } finally {
    await context.close();
  }
  const final = captures.at(-1);
  const layers = {
    behavior: {
      status:
        error || checks.some((c) => !c.pass) || pageErrors.length
          ? "Fail"
          : "Pass",
      assertions: checks,
      ...(error ? { error } : {}),
      pageErrors,
    },
    semantics: final?.layers.semantics ?? { status: "Not covered" },
    layout: final?.layers.layout ?? { status: "Not covered" },
    styles: final?.layers.styles ?? { status: "Not covered" },
    screenshot: final?.layers.screenshot ?? { status: "Not covered" },
    network: { status: network.length ? "Fail" : "Pass", violations: network },
  };
  if (error)
    for (const key of ["semantics", "layout", "styles", "screenshot"])
      layers[key] = {
        status: "Not covered",
        reason:
          "Journey stopped before equivalent states; diagnostic evidence retained",
      };
  const evidence = path.join("evidence", cell.id, "measurements.json.gz");
  await fs.writeFile(
    path.join(dir, evidence),
    gzipSync(
      JSON.stringify({
        cell,
        caseVersion: c.version,
        layers,
        captures,
        pageErrors,
        network,
        normalization: NORMALIZATION,
      }),
    ),
  );
  return {
    cell,
    executed: true,
    verdict: verdict(layers),
    layers,
    evidence,
    images: final?.images ?? [],
    reproduce: `npm run bench -- --from-run=${path.basename(dir)} --case=${c.id} --width=${cell.width} --theme=${cell.theme} --delivery=${cell.delivery}`,
  };
}

export async function runBench(options = {}) {
  const {
    bundleDir = path.join(root, "dist"),
    presetId = "default",
    origin,
    id = new Date().toISOString().replace(/[:.]/g, "-") +
      "-" +
      randomUUID().slice(0, 8),
    mode = "quick",
    caseIds,
    widths,
    themes,
    delivery,
    concurrency = 2,
    chrome = DEFAULT_CHROME,
    onProgress = () => {},
  } = options;
  const requestedLedger = structuredClone(
    options.checklistOverride ??
      (await readJson(path.join(root, "bench/checklist.json"))),
  );
  const all = structuredClone(options.casesOverride ?? (await loadCases()));
  if (new Set(all.map((c) => c.id)).size !== all.length)
    throw Error("Duplicate deterministic case IDs; run refused");
  const selected = caseIds?.length
    ? all.filter((c) => caseIds.includes(c.id))
    : all;
  if (caseIds?.some((id) => !all.some((c) => c.id === id)))
    throw Error("Unknown case");
  if (!selected.length) throw Error("No cases selected");
  selected.forEach(validateCase);
  const themePreset =
    options.themeDefinitionOverride ?? getThemePreset(presetId);
  const cells = matrix(selected, mode, widths, themes)
    .filter((c) => !delivery || c.delivery === delivery)
    .map((c) => ({
      ...c,
      presetId,
      themeDefinitionHash: themePreset.definitionHash,
    }));
  const dir = path.join(root, ".bench-runs", id);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(path.join(dir, "run.json"));
    throw Error("Immutable run already exists");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const run = {
    id,
    runnerVersion: RUNNER_VERSION,
    createdAt: new Date().toISOString(),
    mode,
    themePreset,
    reproducesRunId: options.reproducesRunId,
    status: "running",
    normalization: NORMALIZATION,
    isolation:
      "One isolated browser context per worker/case; renderer remounts with unique message/view IDs for every matrix cell. Stylesheet reset and actual order recorded per cell. Runtime assets are frozen per run.",
    options: {
      caseIds: selected.map((c) => c.id),
      widths: widths ?? [390, 768, 1280],
      themes: themes ?? ["light", "dark"],
      delivery: delivery ?? "both",
      concurrency,
    },
    cases: selected,
    results: [],
    summary: summarize([], cells.length),
  };
  let browser;
  try {
    browser = await chromium.launch({ executablePath: chrome, headless: true });
    if (browser.version() !== CHROME_VERSION)
      throw Error(
        "Exact pinned Chrome required: " +
          CHROME_VERSION +
          ", found " +
          browser.version(),
      );
    run.provenance = await provenance(
      chrome,
      browser,
      bundleDir,
      options.frozenProvenance,
    );
    let cursor = 0;
    let clipboardLock = Promise.resolve();
    async function worker() {
      const slot = {};
      try {
        while (cursor < cells.length) {
          try {
            await fs.access(path.join(dir, "cancel.requested"));
            return;
          } catch {}
          const cell = cells[cursor++];
          onProgress({
            id,
            total: cells.length,
            completed: run.results.length,
            running: cell.id,
          });
          await writeJson(path.join(dir, "progress.json"), {
            id,
            status: "running",
            total: cells.length,
            completed: run.results.length,
            running: cell.id,
          });
          const c = selected.find((c) => c.id === cell.caseId);
          let releaseClipboard;
          if (c.setup.clipboard) {
            const previous = clipboardLock;
            clipboardLock = new Promise((r) => (releaseClipboard = r));
            await previous;
          }
          let result;
          try {
            result = c.setup.sharedSession
              ? await executeSharedCell(
                  browser,
                  origin,
                  c,
                  cell,
                  dir,
                  themePreset,
                )
              : await executeCell(
                  browser,
                  origin,
                  c,
                  cell,
                  dir,
                  themePreset,
                  slot,
                );
          } finally {
            releaseClipboard?.();
          }
          run.results.push(result);
          onProgress({
            id,
            total: cells.length,
            completed: run.results.length,
            running: cell.id,
          });
          await writeJson(path.join(dir, "progress.json"), {
            id,
            status: "running",
            total: cells.length,
            completed: run.results.length,
            running: cell.id,
          });
        }
      } finally {
        await slot.context?.close();
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(concurrency, cells.length) }, worker),
    );
    run.results.sort(
      (a, b) =>
        cells.findIndex((c) => c.id === a.cell.id) -
        cells.findIndex((c) => c.id === b.cell.id),
    );
    try {
      await fs.access(path.join(dir, "cancel.requested"));
      run.status = "cancelled";
    } catch {
      run.status =
        run.results.length === cells.length ? "completed" : "cancelled";
    }
  } catch (error) {
    run.status = "infrastructure-error";
    run.error = error.message;
  } finally {
    await browser?.close();
  }
  const executed = new Set(run.results.map((r) => r.cell.id));
  for (const cell of cells)
    if (!executed.has(cell.id))
      run.results.push({
        cell,
        executed: false,
        verdict: "Not covered",
        layers: { execution: { status: "Not covered", reason: run.status } },
      });
  run.completedAt = new Date().toISOString();
  run.summary = summarize(run.results, cells.length);
  const ledger = requestedLedger;
  run.checklist = requestedLedger;
  run.coverage = ledger.map((l) => ({
    ...l,
    checks: l.checks.map((check) => {
      const applicable = check.applicable;
      const matched = run.results.filter((r) =>
        check.cases.includes(r.cell.caseId),
      );
      const assertions = matched
        .flatMap((r) => r.layers.behavior?.assertions ?? [])
        .filter((a) => check.assertions.includes(a.id));
      return {
        ...check,
        status: !applicable
          ? "Not applicable"
          : !matched.length || !assertions.length
            ? "Not covered"
            : assertions.some((a) => !a.pass)
              ? "Fail"
              : matched.some((r) => r.verdict !== "Pass")
                ? "Review"
                : "Pass",
        evidence: matched.map((r) => r.evidence).filter(Boolean),
      };
    }),
  }));
  run.uncoveredChecks = run.coverage.flatMap((l) =>
    l.checks
      .filter(
        (c) =>
          c.status === "Not covered" &&
          (!caseIds?.length || c.cases.some((id) => caseIds.includes(id))),
      )
      .map((c) => c.id),
  );
  if (
    (run.uncoveredChecks.length || run.status !== "completed") &&
    run.summary.verdict === "Pass"
  )
    run.summary.verdict = "Not covered";
  await writeJson(path.join(dir, "run.json"), run);
  await fs.writeFile(path.join(dir, "report.html"), htmlReport(run));
  const files = [];
  async function evidenceHashes(d) {
    for (const e of await fs.readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await evidenceHashes(p);
      else if (
        !["manifest.json", "progress.json", "cancel.requested"].includes(e.name)
      )
        files.push({
          path: path.relative(dir, p),
          sha256: sha(await fs.readFile(p)),
        });
    }
  }
  await evidenceHashes(dir);
  await writeJson(path.join(dir, "manifest.json"), { id, files });
  await writeJson(path.join(dir, "progress.json"), {
    id,
    status: run.status,
    total: cells.length,
    completed: run.summary.executed,
    summary: run.summary,
  });
  return run;
}

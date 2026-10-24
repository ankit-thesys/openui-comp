import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
const consumer = path.resolve(process.env.CORE_CONSUMER),
  kind = process.env.CORE_CASE || "slider";
const { build } = createRequire(
  path.resolve(process.env.CORE_BROWSER_TOOLS || consumer, "package.json"),
)("esbuild");
const { chromium } = await import(pathToFileURL(process.env.CORE_PLAYWRIGHT).href);
const source = await fs.readFile(new URL("controls.fixture.tsx", import.meta.url), "utf8");
const built = await build({
  stdin: { contents: source, resolveDir: consumer, loader: "tsx" },
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/app.js")) {
    res.setHeader("content-type", "text/javascript");
    res.end(built.outputFiles[0].text);
  } else {
    res.setHeader("content-type", "text/html");
    res.end(
      '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="app"></div><script type="module" src="/app.js"></script></body></html>',
    );
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  await page.clock.install({ time: new Date("2026-10-24T12:00:00Z") });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/?case=${kind}`);
  try {
    await page.locator("[data-ready]").waitFor({ timeout: 5000 });
  } catch (error) {
    assert.deepEqual(errors, [], "consumer rendering errors");
    throw error;
  }
  if (kind === "chips") {
    const gamma = page.getByRole("option", { name: "Gamma" });
    assert.equal(await page.getByRole("option", { name: "Beta" }).isDisabled(), true);
    await gamma.focus();
    await page.keyboard.press("Space");
    await page.waitForFunction(
      () => document.querySelector('[role="option"][aria-selected="true"]').textContent === "Gamma",
    );
    assert.equal(await gamma.getAttribute("aria-selected"), "true");
    await page.evaluate(() => window.setDisabled(true));
    await page.waitForFunction(
      () => document.querySelectorAll('[role="option"]:disabled').length === 3,
    );
    await page.locator("#start").focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.id), "end");
  }
  if (kind === "slider") {
    const thumb = page.getByRole("slider");
    await thumb.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "25");
    assert.equal(await page.locator("#value").textContent(), "[25]");
    assert((await page.locator("#events").textContent()).includes("commit"));
    assert.equal(await page.evaluate(() => window.getRef().getAttribute("aria-label")), "Volume");
    await page.evaluate(() => window.setValues([20, 80]));
    await page.getByRole("slider").nth(1).waitFor();
    assert.equal(await page.getByRole("slider").count(), 2);
    await page.evaluate(() => {
      window.setVariant("discrete");
      window.setDisabled(true);
    });
    await page.waitForTimeout(50);
    assert.equal(await page.locator(".openui-slider-dots-dot").count(), 21);
    assert.equal(await page.getByRole("slider").first().getAttribute("data-disabled"), "");
    await page.locator("#start").focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.id), "end");
  }
  if (kind === "sliderBlock") {
    const before = await page.evaluate(() => Date.now());
    await page.waitForTimeout(30);
    assert((await page.evaluate(() => Date.now())) > before, "Date.now must advance for debounce");
    const input = page.locator("input");
    assert.equal(await input.inputValue(), "20");
    await input.fill("140");
    await page.getByText("Value must be between 0 and 100").waitFor();
    await input.fill("35");
    await page.waitForFunction(() => document.querySelector("#events").textContent.includes("35"));
    assert.equal(await input.inputValue(), "35");
    await page.evaluate(() => window.setDisabled(true));
    await page.waitForFunction(() => document.querySelector("input").disabled);
    assert.equal(await input.isDisabled(), true);
    await page.evaluate(() => {
      window.setDisabled(false);
      window.setBlockRange(true);
    });
    await page.waitForFunction(() => document.querySelectorAll("#zone input").length === 2);
    assert.deepEqual(
      await page.locator("#zone input").evaluateAll((nodes) => nodes.map((node) => node.value)),
      ["20", "80"],
    );
    await page.evaluate(() => window.setVariant("discrete"));
    await page.getByRole("combobox").nth(1).waitFor();
    assert.equal(await page.getByRole("combobox").count(), 2);
    await page.evaluate(() => window.setStreaming(true));
    await page.waitForFunction(() => document.querySelectorAll('[role="combobox"]').length === 0);
    assert.equal(await page.locator(".openui-slider-dots-dot").count(), 0);
  }
  if (kind === "select") {
    const trigger = page.getByRole("combobox");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await page.getByRole("listbox").waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "option");
    await page.keyboard.press("ArrowDown");
    await page.waitForFunction(() => document.activeElement?.textContent.includes("Gamma"));
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector("#value").textContent === "c");
    assert.equal(await trigger.textContent(), "Gamma");
    await page.evaluate(() => window.setDisabled(true));
    await page.waitForFunction(() => document.querySelector("#trigger").disabled);
    await page.locator("#start").focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.id), "end");
  }
  if (kind === "calendar") {
    const day = page.locator('[data-day="2026-10-20"] button');
    await day.click();
    assert((await page.locator("#events").textContent()).includes("Oct 20 2026"));
    assert.equal(
      await page.evaluate(() => window.getRef().classList.contains("openui-calendar-container")),
      true,
    );
    await day.focus();
    await page.keyboard.press("ArrowRight");
    assert(
      (await page.evaluate(() => document.activeElement.getAttribute("aria-label"))).includes("21"),
    );
    await page.evaluate(() => window.setDisabled(true));
    await page.waitForFunction(
      () => document.querySelector('[data-day="2026-10-20"] button').disabled,
    );
    assert.equal(await day.isDisabled(), true);
    await page.evaluate(() => {
      window.setDisabled(false);
      window.setCalendarMode("multiple");
      window.setCalendarSelection([]);
    });
    await page.locator('[data-day="2026-10-20"] button').click();
    await page.locator('[data-day="2026-10-22"] button').click();
    assert.equal(await page.locator(".openui-calendar-single-day-selected").count(), 2);
    await page.evaluate(() => {
      window.setCalendarMode("range");
      window.setCalendarSelection(undefined);
    });
    await page.locator('[data-day="2026-10-20"] button').click();
    await page.locator('[data-day="2026-10-22"] button').click();
    assert.equal(await page.locator(".openui-calendar-range-start").count(), 1);
    assert.equal(await page.locator(".openui-calendar-range-end").count(), 1);
  }
  if (kind === "datePicker") {
    const trigger = page.locator(".openui-date-picker-renderer-floating-input-container");
    await trigger.click();
    await page.locator(".openui-date-picker-renderer-floating-content").waitFor();
    assert.equal(
      await page.locator("#zone .openui-date-picker-renderer-floating-content").count(),
      0,
      "calendar is in a portal",
    );
    await page.locator('[data-day="2026-10-20"] button').click();
    assert((await page.locator("#events").textContent()).includes("Oct 20 2026"));
    await page.locator("#unrelated").click();
    await page
      .locator(".openui-date-picker-renderer-floating-content")
      .waitFor({ state: "detached" });
    assert((await trigger.textContent()).includes("20"));
    await page.evaluate(() => window.setPickerMode("range"));
    await trigger.click();
    await page.locator('[data-day="2026-10-20"] button').click();
    await page.locator('[data-day="2026-10-22"] button').click();
    assert.equal(await page.locator(".openui-calendar-range-start").count(), 1);
    assert.equal(await page.locator(".openui-calendar-range-end").count(), 1);
    await page.locator("#unrelated").click();
    assert((await trigger.textContent()).includes("22"));
  }
  assert.deepEqual(errors, []);
  console.log(`${kind}: browser interactions passed (${browser.version()})`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

import { expect, test, type Page } from "@playwright/test";
import type { sheetFixture } from "./fixtures/sheet";

type FixtureWindow = Window & {
  sheetFixture?: typeof sheetFixture;
  reservedSheet?: HTMLElement;
};

const ready = async (page: Page) => {
  await page.waitForFunction(() => !!(window as FixtureWindow).sheetFixture);
};

test("prepends its sheet and keeps defaults and host Goober separate", async ({ page }) => {
  await page.goto("/sheet.html?css=.consumer{color:red}");
  await ready(page);
  const result = await page.evaluate(() => {
    const { imported, animation, getComponentStyles } = (window as FixtureWindow).sheetFixture!;
    const sheet = document.getElementById("openui-styles")!;
    return {
      first: document.head.firstElementChild === sheet,
      text: sheet.textContent,
      stored: getComponentStyles(),
      imported,
      animation,
      host: document.getElementById("_goober"),
      defaults: document.getElementById("openui-defaults")!.textContent,
      markers: [...document.documentElement.classList],
    };
  });
  expect(result.first).toBe(true);
  expect(result.text).toBe(result.stored);
  expect(result.text).toContain(`.${result.imported}{`);
  expect(result.text).toContain(`@keyframes ${result.animation}{`);
  expect(result.text).not.toContain("openui-defaults");
  expect(result.host).toBeNull();
  expect(result.defaults).toContain("@layer openui-defaults");
  expect(result.markers).toHaveLength(1);
  expect(result.defaults).toContain(`:where(.${result.markers[0]}:root)`);
});

test("adopts an existing sheet in place without touching the host sheet", async ({ page }) => {
  await page.route("**/sheet-adoption.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head>
        <style id="recipe">@layer theme,base,openui,components,utilities;</style>
        <style id="openui-styles"></style><style id="consumer">.consumer{color:red}</style>
        <style id="_goober">.host-existing{color:blue}</style>
        <script>window.reservedSheet=document.getElementById("openui-styles")</script>
        </head><body><script type="module" src="/sheet.js"></script></body></html>`,
    }),
  );
  await page.goto("/sheet-adoption.html");
  await ready(page);
  const result = await page.evaluate(() => {
    const fixture = (window as FixtureWindow).sheetFixture!;
    const sheet = document.getElementById("openui-styles")!;
    return {
      same: sheet === (window as FixtureWindow).reservedSheet,
      previous: sheet.previousElementSibling?.id,
      next: sheet.nextElementSibling?.id,
      count: document.querySelectorAll("#openui-styles").length,
      text: sheet.textContent,
      stored: fixture.getComponentStyles(),
      host: document.getElementById("_goober")!.textContent,
    };
  });
  expect(result.same).toBe(true);
  expect(result.previous).toBe("recipe");
  expect(result.next).toBe("consumer");
  expect(result.count).toBe(1);
  expect(result.text).toBe(result.stored);
  expect(result.host).toBe(".host-existing{color:blue}");
});

test("batches many registrations into one sheet write per microtask", async ({ page }) => {
  await page.goto("/sheet.html");
  await ready(page);
  const result = await page.evaluate(async () => {
    const fixture = (window as FixtureWindow).sheetFixture!;
    const tag = document.getElementById("openui-styles")!;
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((mutations) => records.push(...mutations));
    observer.observe(tag, { childList: true, characterData: true, subtree: true });
    const before = tag.textContent;
    const names = Array.from({ length: 100 }, (_, i) => fixture.css`--sheet-batch: ${i};`);
    const unchangedInTask = before === tag.textContent;
    const registeredInTask = names.every((name) =>
      fixture.getComponentStyles().includes(`.${name}{`),
    );
    await Promise.resolve();
    records.push(...observer.takeRecords());
    const firstWrites = records.length;
    const firstSheet = tag.textContent;
    fixture.css`--sheet-next-batch: 1;`;
    fixture.css`--sheet-next-batch: 2;`;
    await Promise.resolve();
    records.push(...observer.takeRecords());
    observer.disconnect();
    return {
      unchangedInTask,
      registeredInTask,
      firstWrites,
      totalWrites: records.length,
      allWritten: names.every((name) => firstSheet!.includes(`.${name}{`)),
      upToDate: tag.textContent === fixture.getComponentStyles(),
    };
  });
  expect(result).toEqual({
    unchangedInTask: true,
    registeredInTask: true,
    firstWrites: 1,
    totalWrites: 2,
    allWritten: true,
    upToDate: true,
  });
});

test("host Goober global replacement and extraction leave component rules alone", async ({
  page,
}) => {
  await page.goto("/sheet.html");
  await ready(page);
  const result = await page.evaluate(() => {
    const fixture = (window as FixtureWindow).sheetFixture!;
    const before = fixture.getComponentStyles();
    fixture.glob`body { --host-global: first; }`;
    fixture.glob`body { --host-global: second; }`;
    const extracted = fixture.extractCss();
    return {
      before,
      after: fixture.getComponentStyles(),
      written: document.getElementById("openui-styles")!.textContent,
      extracted,
      imported: fixture.imported,
      animation: fixture.animation,
    };
  });
  expect(result.after).toBe(result.before);
  expect(result.written).toBe(result.before);
  expect(result.extracted).toContain("--host-global:second");
  expect(result.extracted).not.toContain("--host-global:first");
  expect(result.extracted).not.toContain(result.imported);
  expect(result.extracted).not.toContain(result.animation);
  expect(result.extracted).not.toContain("openui-defaults");
});

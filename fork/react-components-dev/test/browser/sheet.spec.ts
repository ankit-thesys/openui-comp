import { expect, test, type Page } from "@playwright/test";
import type { sheetFixture } from "./fixtures/sheet";

type FixtureWindow = Window & {
  sheetFixture?: typeof sheetFixture;
  reservedSheet?: HTMLElement;
};

const ready = async (page: Page) => {
  await page.waitForFunction(() => !!(window as FixtureWindow).sheetFixture);
};

test("places its sheet after the token defaults and keeps host Goober separate", async ({
  page,
}) => {
  await page.goto("/sheet.html?css=.consumer{color:red}");
  await ready(page);
  const result = await page.evaluate(() => {
    const { imported, animation, getComponentStyles } = (window as FixtureWindow).sheetFixture!;
    const sheet = document.getElementById("openui-styles")!;
    const head = [...document.head.children];
    const order = head.findIndex((el) => el.hasAttribute("data-openui-layer-order"));
    return {
      // The layer-order tag first, then the defaults, then component rules, then app CSS.
      sequence: [
        order,
        head.indexOf(document.getElementById("openui-defaults")!),
        head.indexOf(sheet),
      ],
      beforeConsumer: head.indexOf(sheet) < head.indexOf(document.getElementById("consumer")!),
      text: sheet.textContent,
      stored: getComponentStyles(),
      imported,
      animation,
      host: document.getElementById("_goober"),
      defaults: document.getElementById("openui-defaults")!.textContent,
      markers: [...document.documentElement.classList],
    };
  });
  expect(result.sequence).toEqual([0, 1, 2]);
  expect(result.beforeConsumer).toBe(true);
  expect(result.text).toBe(result.stored);
  expect(result.text).toContain(`.${result.imported}{`);
  expect(result.text).toContain(`@keyframes ${result.animation}{`);
  expect(result.text).not.toContain("openui-defaults");
  expect(result.host).toBeNull();
  expect(result.defaults).toContain("@layer openui-defaults");
  expect(result.markers).toEqual([]);
  expect(result.defaults).toContain(":where(:root){");
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

// Serves `head` as the page's static <head>, before the sheet fixture's bundle loads.
const openWithHead = async (
  page: Page,
  head: string,
  name = "sheet-head",
  { headers = {}, script = "sheet" }: { headers?: Record<string, string>; script?: string } = {},
) => {
  await page.route(`**/${name}.html`, (route) =>
    route.fulfill({
      contentType: "text/html",
      headers,
      body: `<!doctype html><html><head>${head}</head><body><script type="module" src="/${script}.js"></script></body></html>`,
    }),
  );
  await page.goto(`/${name}.html`);
  if (script === "sheet") await ready(page);
};

test("keeps a server-rendered sheet's rules when the client registers its own", async ({
  page,
}) => {
  const server = ".go1{color:red;}.go2{color:blue;}";
  await openWithHead(page, `<style id="openui-styles">${server}</style>`);
  const result = await page.evaluate(async () => {
    const fixture = (window as FixtureWindow).sheetFixture!;
    const added = fixture.css`--sheet-after-adoption: 1;`;
    await Promise.resolve();
    const text = document.getElementById("openui-styles")!.textContent!;
    return { text, added, stored: fixture.getComponentStyles() };
  });
  expect(result.text.startsWith(server)).toBe(true);
  expect(result.text).toContain(`.${result.added}{`);
  expect(result.text).toBe(result.stored);
  // A server rule the client registers again is not written twice.
  expect(result.text.split(".go1{").length - 1).toBe(1);
});

test("two copies of the module on one page keep each other's rules", async ({ page }) => {
  await page.goto("/sheet.html");
  await ready(page);
  const result = await page.evaluate(async () => {
    const first = (window as FixtureWindow).sheetFixture!;
    // The fixture imports the package from a shared chunk; a query string loads a second copy,
    // with its own store and its own Goober, as an ESM and a CJS build on one page would.
    const source = await (await fetch("/sheet.js")).text();
    const [, specifiers, chunk] = source.match(/^import \{([^}]*)\} from "\.\/([\w-]+\.js)"/)!;
    // The bundler may suffix a local name that collides with another import, as `css$1`.
    const exported = (local: string) =>
      specifiers!.match(new RegExp(`(\\w+) as ${local}(?:\\$\\d+)?(?=[\\s,]|$)`))![1]!;
    const copy = (await import(/* @vite-ignore */ `/${chunk}?second-copy`)) as Record<
      string,
      (...args: unknown[]) => string
    >;
    const secondCss = copy[exported("css")]!;
    const secondStyles = copy[exported("getComponentStyles")]!;
    const fromFirst = first.css`--sheet-first-copy: 1;`;
    const fromSecond = secondCss(["--sheet-second-copy: 2;"] as unknown as TemplateStringsArray);
    await Promise.resolve();
    await Promise.resolve();
    const later = first.css`--sheet-first-copy-later: 3;`;
    await Promise.resolve();
    return {
      text: document.getElementById("openui-styles")!.textContent!,
      fromFirst,
      fromSecond,
      later,
      imported: first.imported,
      count: document.querySelectorAll("#openui-styles").length,
      secondStored: secondStyles(),
    };
  });
  expect(result.count).toBe(1);
  for (const name of [result.imported, result.fromFirst, result.fromSecond, result.later])
    expect(result.text).toContain(`.${name}{`);
  expect(result.secondStored).toContain(`.${result.fromSecond}{`);
});

test("gives its sheet the page's CSP nonce, created or adopted", async ({ page }) => {
  await openWithHead(page, `<script>window.__nonce__ = "sheet-nonce";</script>`, "sheet-nonce");
  expect(await page.evaluate(() => document.getElementById("openui-styles")!.nonce)).toBe(
    "sheet-nonce",
  );
  await openWithHead(
    page,
    `<script>window.__nonce__ = "adopted-nonce";</script><style id="openui-styles"></style>`,
    "sheet-adopted-nonce",
  );
  expect(await page.evaluate(() => document.getElementById("openui-styles")!.nonce)).toBe(
    "adopted-nonce",
  );
});

// Under a nonce-only style-src, a style tag without the nonce is blocked for good, and one that
// gets it only after insertion still reports a violation. Every tag the library writes, token
// defaults and ThemeProvider included, must carry the nonce when it enters the document.
test("writes every style tag with the CSP nonce under a nonce-only policy", async ({ page }) => {
  await openWithHead(
    page,
    `<script>window.__nonce__ = "csp-nonce"; window.violations = [];
document.addEventListener("securitypolicyviolation", (event) =>
  window.violations.push(event.effectiveDirective + " " + event.sourceFile + ":" + event.lineNumber));</script>`,
    "sheet-csp",
    { headers: { "content-security-policy": "style-src 'nonce-csp-nonce'" }, script: "sheet-csp" },
  );
  type CspWindow = Window & {
    sheetCspFixture?: { render(mode: "light" | "dark"): void };
    violations?: string[];
  };
  await page.waitForFunction(() => !!(window as CspWindow).sheetCspFixture);
  await page.evaluate(() => (window as CspWindow).sheetCspFixture!.render("dark"));
  await expect(page.locator("i")).toHaveCSS("color", "rgb(7, 8, 9)");
  const result = await page.evaluate(() => ({
    violations: (window as CspWindow).violations,
    tags: [...document.querySelectorAll("style")].map((tag) => ({
      tag: tag.id || [...tag.attributes].map((attribute) => attribute.name).join(" "),
      nonce: tag.nonce,
      applied: !!tag.sheet,
    })),
    token: getComputedStyle(document.body).getPropertyValue("--openui-background").trim(),
  }));
  expect(result.violations).toEqual([]);
  expect(result.tags.filter(({ nonce, applied }) => nonce !== "csp-nonce" || !applied)).toEqual([]);
  expect(result.tags.map(({ tag }) => tag)).toEqual([
    "data-openui-layer-order",
    "openui-defaults",
    "openui-styles",
    "data-openui-theme",
  ]);
  expect(result.token).not.toBe("");
});

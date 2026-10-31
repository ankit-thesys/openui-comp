import { expect, test } from "@playwright/test";
import defaultTheme from "../../shared/default-theme.json" with { type: "json" };
import { smoke } from "../../shared/smoke";

const mode = process.env.OPENUI_COMPAT_MODE ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
const paths = ["/", "/dynamic/request-time", "/stream"];
for (const path of paths) {
  test(`${path}: default theme, hydration, deduplication and equal-weight override (${mode})`, async ({
    page,
  }) => {
    // Keep listening through the local assertions too; shared smoke listens during its checks.
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || /hydrat|did not match/i.test(message.text()))
        errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await smoke(page, expect, {
      path,
      layer: mode === "layered" ? "openui" : false,
      serverSheets: 1,
      ready: `[data-compat-ready][data-compat-mode="${mode}"][data-compat-hydrated="true"]`,
      enableOverrides: async (target) => {
        await target.emulateMedia({ media: "print" });
      },
    });
    if (path.startsWith("/dynamic/"))
      await expect(page.locator("[data-dynamic-slug]")).toHaveText("request-time");
    const sheets = await page.evaluate(() => {
      const server = document.querySelector<HTMLStyleElement>(
        'style[data-openui-styles], style[data-href="openui-styles"]',
      );
      const browser = document.querySelector<HTMLStyleElement>("style#openui-styles");
      const appSheets = [...document.styleSheets].filter((sheet) => {
        const containsOverride = (rules: CSSRuleList): boolean =>
          [...rules].some(
            (rule) =>
              (rule instanceof CSSStyleRule &&
                rule.selectorText === ".openui-button" &&
                rule.style.backgroundColor === "rgb(1, 2, 3)") ||
              ("cssRules" in rule && containsOverride((rule as CSSGroupingRule).cssRules)),
          );
        return containsOverride(sheet.cssRules);
      });
      return {
        inHead: server?.parentElement === document.head,
        // These apps register no browser-only rules, so even one browser rule is unexpected.
        browserRules: browser?.sheet?.cssRules.length ?? 0,
        appSheets: appSheets.length,
        appBeforeServer: appSheets.every(
          (sheet) =>
            !!server &&
            !!(server.compareDocumentPosition(sheet.ownerNode!) & Node.DOCUMENT_POSITION_PRECEDING),
        ),
        appAfterServer: appSheets.every(
          (sheet) =>
            !!server &&
            !!(server.compareDocumentPosition(sheet.ownerNode!) & Node.DOCUMENT_POSITION_FOLLOWING),
        ),
      };
    });
    expect(sheets.inHead, "full server sheet stays in head").toBe(true);
    expect(sheets.browserRules, "hydration must not re-emit server rules").toBe(0);
    expect(sheets.appSheets, "real app stylesheet contains the one-class override").toBeGreaterThan(
      0,
    );
    if (mode === "unlayered")
      expect(sheets.appAfterServer, "README Next CSS order recipe").toBe(true);
    if (mode === "layered")
      expect(sheets.appBeforeServer, "README layered root CSS recipe").toBe(true);
    expect(errors, "console and hydration errors through all local checks").toEqual([]);
  });
}

// External application scripts are held back. Inline React stream-reveal scripts may run,
// but no client module can hydrate the late components before their styles are inspected.
test(`streamed late components are styled before hydration (${mode})`, async ({
  page,
  baseURL,
}) => {
  const response = await fetch(`${baseURL}/stream`);
  expect(response.ok).toBe(true);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let shellBeforeLate = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
    if (html.includes("data-stream-fallback") && !html.includes("data-stream-late")) {
      shellBeforeLate = true;
      const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
      expect(head).toContain('data-href="openui-styles"');
      const sheet = head.match(
        /<style[^>]*data-href="openui-styles"[^>]*>([\s\S]*?)<\/style>/,
      )?.[1];
      expect(
        sheet?.length ?? 0,
        "full eager component sheet is already in the shell",
      ).toBeGreaterThan(100_000);
      expect(head.includes("@layer openui{")).toBe(mode === "layered");
    }
  }
  expect(
    shellBeforeLate,
    "server sends the full sheet and fallback before the delayed boundary",
  ).toBe(true);
  expect(html).toContain("data-stream-late");
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") await route.abort();
    else await route.continue();
  });
  await page.goto("/stream");
  await expect(page.locator("[data-stream-late] .openui-button")).toBeVisible();
  await expect(page.locator("[data-compat-ready]")).toHaveAttribute(
    "data-compat-hydrated",
    "false",
  );
  for (const sample of defaultTheme.slice(0, 4)) {
    for (const [property, value] of Object.entries(sample.styles)) {
      await expect(
        page.locator(sample.selector),
        `${sample.name} before hydration: ${property}`,
      ).toHaveCSS(property, value);
    }
  }
  await expect(page.locator("style#openui-styles")).toHaveCount(0);
});

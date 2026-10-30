import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";

const mode = process.env.OPENUI_COMPAT_MODE ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);
const paths = ["/", "/dynamic/request-time"];
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
    expect(errors, "console and hydration errors through all local checks").toEqual([]);
  });
}

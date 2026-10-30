// Type-only imports resolve through each app's tsconfig paths. Runtime Playwright comes from
// the caller, so this shared directory needs neither node_modules nor a second test-runner copy.
import type { ConsoleMessage, Page } from "@compat/playwright";
import defaultTheme from "./default-theme.json" with { type: "json" };

type Expect = typeof import("@compat/playwright").expect;
type Assertion = "console" | "styles" | "sheets" | "duplicates" | "override" | "layer";

export interface SmokeOptions {
  /** false also verifies that the component rules are unlayered. */
  layer: string | false;
  /** Separate server tags (data-openui-styles or React's data-href), excluding #openui-styles. */
  serverSheets?: 0 | 1;
  path?: string;
  ready?: string;
  assertions?: Partial<Record<Assertion, boolean>>;
  samples?: Array<{ name: string; selector: string; styles: Record<string, string> }>;
  /** Enable the app's existing normal stylesheet after comparing the default theme. */
  enableOverrides?: (page: Page) => Promise<void>;
}

export async function smoke(page: Page, expect: Expect, options: SmokeOptions): Promise<void> {
  const enabled = (assertion: Assertion) => options.assertions?.[assertion] !== false;
  const errors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (
      message.type() === "error" ||
      /hydrat|server[- ](?:rendered|html)|did not match/i.test(message.text())
    ) {
      errors.push(`${message.type()}: ${message.text()}`);
    }
  };
  const onPageError = (error: Error) => errors.push(`pageerror: ${error.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  try {
    await page.goto(options.path ?? "/");
    await expect(page.locator(options.ready ?? "[data-compat-ready]")).toBeVisible();
    await page.mouse.move(0, 0);

    if (enabled("styles")) {
      for (const sample of options.samples ?? defaultTheme) {
        const element = page.locator(sample.selector);
        await expect(element, sample.name).toHaveCount(1);
        await expect(element, sample.name).toBeVisible();
        for (const [property, value] of Object.entries(sample.styles)) {
          await expect(element, `${sample.name}: ${property}`).toHaveCSS(property, value);
        }
      }
      // A non-empty drawing prevents an empty chart placeholder from satisfying the root checks.
      if (!options.samples) {
        await expect(page.locator(".openui-mini-line-chart-line")).toHaveAttribute("d", /\S+/);
        await expect(page.locator(".openui-mini-line-chart-line")).toHaveCSS("fill", "none");
      }
    }

    if (enabled("override")) {
      if (options.enableOverrides) await options.enableOverrides(page);
      else {
        const link = page.locator("link[data-compat-overrides]");
        await expect(link).toHaveCount(1);
        await link.evaluate((element) => {
          (element as HTMLLinkElement).media = "all";
        });
      }
      await expect(page.locator(".openui-button")).toHaveCSS("background-color", "rgb(1, 2, 3)");
    }

    if (enabled("sheets") || enabled("duplicates") || enabled("layer")) {
      const sheets = await page.evaluate((configuredLayer) => {
        const browser = [...document.querySelectorAll<HTMLStyleElement>("style#openui-styles")];
        const server = [
          ...document.querySelectorAll<HTMLStyleElement>(
            'style[data-openui-styles], style[data-href="openui-styles"]',
          ),
        ].filter((tag) => tag.id !== "openui-styles");
        const seen = new Set<string>();
        const duplicates: string[] = [];
        const wrongLayer: string[] = [];
        let ruleCount = 0;
        const walk = (rules: CSSRuleList, layer: string, context: string[]) => {
          for (const rule of rules) {
            if (rule instanceof CSSLayerBlockRule) {
              walk(rule.cssRules, [layer, rule.name].filter(Boolean).join("."), context);
            } else if (rule instanceof CSSGroupingRule) {
              // Style rules expose `cssRules` too (CSS nesting) but are not grouping rules; they
              // and keyframes count as whole rules below, nested children included in cssText.
              // Media/supports/container rules affect meaning. Layer wrappers do not affect
              // duplicate identity, so split append batches and server/browser tags compare alike.
              const header = rule.cssText.slice(0, rule.cssText.indexOf("{"));
              walk(rule.cssRules, layer, [...context, header]);
            } else {
              ruleCount++;
              const identity = JSON.stringify([context, rule.cssText]);
              if (seen.has(identity)) duplicates.push(rule.cssText);
              seen.add(identity);
              if (
                configuredLayer
                  ? layer !== configuredLayer && !layer.startsWith(`${configuredLayer}.`)
                  : layer !== ""
              ) {
                wrongLayer.push(rule.cssText);
              }
            }
          }
        };
        for (const tag of [...browser, ...server]) {
          if (!tag.sheet) throw new Error("Component style tag has no CSSStyleSheet");
          walk(tag.sheet.cssRules, "", []);
        }
        return {
          browser: browser.length,
          server: server.length,
          ruleCount,
          duplicates,
          wrongLayer,
        };
      }, options.layer);

      expect(sheets.ruleCount, "component sheets must contain parsed CSS rules").toBeGreaterThan(0);
      if (enabled("sheets")) {
        expect(sheets.browser, "at most one browser sheet").toBeLessThanOrEqual(1);
        expect(sheets.server, "at most one server sheet").toBeLessThanOrEqual(1);
        if (options.serverSheets !== undefined) expect(sheets.server).toBe(options.serverSheets);
      }
      if (enabled("duplicates")) expect(sheets.duplicates, "exact duplicate rules").toEqual([]);
      if (enabled("layer")) expect(sheets.wrongLayer, "rules in the wrong layer").toEqual([]);
    }
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    if (enabled("console")) expect(errors, "console, hydration and uncaught errors").toEqual([]);
  }
}

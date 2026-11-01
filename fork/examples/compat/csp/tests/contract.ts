import { expect, type Page } from "@playwright/test";

// Shared smoke navigates on every call. Keep this local equivalent for checks AFTER interactions.
export async function assertSheets(page: Page, layer: string | false) {
  const result = await page.evaluate((layer) => {
    const tags = [
      ...document.querySelectorAll<HTMLStyleElement>(
        'style#openui-styles, style[data-openui-styles], style[data-href="openui-styles"]',
      ),
    ];
    const seen = new Set<string>();
    const duplicates: string[] = [];
    const wrongLayer: string[] = [];
    let count = 0;
    function walk(rules: CSSRuleList, current = "", context: string[] = []) {
      for (const rule of rules) {
        if (rule instanceof CSSLayerBlockRule)
          walk(rule.cssRules, [current, rule.name].filter(Boolean).join("."), context);
        else if ("cssRules" in rule && !(rule instanceof CSSKeyframesRule)) {
          walk((rule as CSSGroupingRule).cssRules, current, [
            ...context,
            rule.cssText.slice(0, rule.cssText.indexOf("{")),
          ]);
        } else {
          count++;
          const key = JSON.stringify([context, rule.cssText]);
          if (seen.has(key)) duplicates.push(rule.cssText);
          seen.add(key);
          if (layer ? current !== layer : current !== "") wrongLayer.push(rule.cssText);
        }
      }
    }
    for (const tag of tags) {
      if (!tag.sheet) throw new Error("Missing CSSStyleSheet");
      walk(tag.sheet.cssRules);
    }
    return {
      duplicates,
      wrongLayer,
      count,
      browser: document.querySelectorAll("style#openui-styles").length,
      server: document.querySelectorAll("style[data-openui-styles]").length,
    };
  }, layer);
  expect(result.duplicates, "exact duplicate rules after interaction").toEqual([]);
  expect(result.wrongLayer).toEqual([]);
  expect(result.count).toBeGreaterThan(0);
  expect(result.browser).toBeLessThanOrEqual(1);
  expect(result.server).toBe(1);
  return result.count;
}

export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      /hydrat|did not match|server[- ](?:rendered|html)/i.test(message.text())
    )
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

export async function hydrated(page: Page) {
  await expect.poll(() => page.evaluate(() => window.__compat.hydrated)).toBe(true);
  expect(await page.evaluate(() => window.__compat.recoverable)).toEqual([]);
}

export async function headOrder(page: Page) {
  expect(
    await page.evaluate(() => {
      const sheet = document.querySelector("style[data-openui-styles]")!;
      return (
        sheet.parentElement === document.head &&
        [...document.querySelectorAll('link[rel="stylesheet"]')].every((link) =>
          Boolean(sheet.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING),
        )
      );
    }),
  ).toBe(true);
}

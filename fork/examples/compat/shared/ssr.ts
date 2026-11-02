// Server-rendered component rules (#178). The server HTML carries the rules of the components it
// rendered, and only those; the page is styled before any script runs; once hydrated, no rule
// appears twice across the server's tags and the browser sheet.
import type { Browser, Page } from "@compat/playwright";
import defaultTheme from "./default-theme.json" with { type: "json" };

type Expect = typeof import("@compat/playwright").expect;

export interface RenderedRulesOptions {
  path?: string;
  /** Selector that exists once the server HTML is parsed, without scripts. */
  ready?: string;
  /** Skip the no-script style check, e.g. for a page whose content streams in behind Suspense. */
  scripted?: boolean;
}

export interface RenderedRules {
  servedClasses: number;
  usedClasses: number;
  servedBytes: number;
  unusedClasses: number;
}

// The component library's generated classes in markup: those on elements that also carry its
// stable `openui-*` classes. An app's own Goober (or its own `css` without styleRules) uses the
// same `go` prefix, and the browser sheet or the app styles those.
const classesIn = (html: string) => {
  const used = new Set<string>();
  for (const [, value] of html.matchAll(/\sclass="([^"]*)"/g)) {
    const names = value!.split(/\s+/);
    if (!names.some((name) => name.startsWith("openui-"))) continue;
    for (const name of names) if (/^go\d+$/.test(name)) used.add(name);
  }
  return used;
};

export async function renderedRules(
  page: Page,
  browser: Browser,
  expect: Expect,
  options: RenderedRulesOptions = {},
): Promise<RenderedRules> {
  const path = options.path ?? "/";
  const response = await page.request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();

  // React's hoisted tags: <style data-precedence="openui" data-href="go1 go2">…</style>
  const served = new Set<string>();
  let servedBytes = 0;
  for (const [, attrs, text] of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    if (!/data-precedence="openui"/.test(attrs!)) continue;
    servedBytes += text!.length;
    for (const name of /data-href="([^"]*)"/.exec(attrs!)?.[1]?.split(" ") ?? []) served.add(name);
  }
  const markup = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, "");
  const used = classesIn(markup);

  expect(served.size, "the server sends component rules").toBeGreaterThan(0);
  // React hoists <style> only from HTML; inside SVG it would stay in place and break hydration.
  expect(
    [...html.matchAll(/<svg[\s>][\s\S]*?<\/svg>/g)].filter(([svg]) => /<style[\s>]/.test(svg!))
      .length,
    "<style> inside <svg>",
  ).toBe(0);
  expect(
    [...used].filter((name) => !served.has(name)),
    "rendered classes without a served rule",
  ).toEqual([]);
  // Keyframes are referenced from rules, not markup. Rules for classes the page did not render
  // (other variants of a rendered component) are measured, not failed: that is the granularity.
  const keyframes = new Set([...html.matchAll(/@keyframes (go\d+)/g)].map((match) => match[1]));
  const unused = [...served].filter((name) => !used.has(name) && !keyframes.has(name));

  if (options.scripted !== false) {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const bare = await context.newPage();
      await bare.goto(path);
      await expect(bare.locator(options.ready ?? "[data-compat-ready]")).toBeVisible();
      for (const sample of defaultTheme) {
        const element = bare.locator(sample.selector);
        if ((await element.count()) === 0) continue;
        for (const [property, value] of Object.entries(sample.styles))
          await expect(element.first(), `${sample.name} without scripts: ${property}`).toHaveCSS(
            property,
            value,
          );
      }
    } finally {
      await context.close();
    }
  }

  return {
    servedClasses: served.size,
    usedClasses: used.size,
    servedBytes,
    unusedClasses: unused.length,
  };
}

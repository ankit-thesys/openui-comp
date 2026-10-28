// Browser-only chart parts are exercised through the public charts, including the portal.
// Run: pnpm exec playwright test chart-foundations.spec.ts (requires built fixtures and Chromium).
import { expect, test, type Page } from "@playwright/test";

test("a portal tooltip exposes flat override targets through a public chart", async ({ page }) => {
  await page.goto("/chart-foundations.html");
  await page
    .getByTestId("tooltip-chart")
    .getByRole("img", { name: "Line chart", exact: true })
    .hover({ position: { x: 120, y: 80 } });
  await expect(page.locator(".openui-chart-tooltip-portal")).toBeVisible();
  await expect(page.locator(".openui-chart-tooltip")).toBeVisible();
  await expect(page.locator(".openui-chart-tooltip-label-text")).toHaveText("sales");
});

import { readStableNames } from "../../scripts/selector-reference.mjs";
import { classViolation, ruleViolation, rulesOf } from "../unit/contract/checks";
import { blocksIn, namesIn } from "../unit/contract/collect";

const constants = (await readStableNames())
  .filter(({ component }) => component.startsWith("Charts/"))
  .map(({ names }) => names);
const targets = [...namesIn(constants)];
const values = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-top-color": "rgb(11, 12, 13)",
  fill: "rgb(14, 15, 16)",
};
const declarations = Object.entries(values)
  .map(([key, value]) => `${key}: ${value};`)
  .join(" ");
const open = async (page: Page, className: string, query = "") => {
  await page.goto(`/chart-foundations.html?series=11&${query}`);
  if (className.startsWith("openui-chart-tooltip")) {
    await page
      .getByTestId("tooltip-chart")
      .getByRole("img", { name: "Line chart", exact: true })
      .hover({ position: { x: 120, y: 80 } });
    await expect(page.locator(".openui-chart-tooltip")).toBeVisible();
  }
  await expect(page.locator(`.${className}`).first()).toBeAttached();
};

// Add the same single state the library uses, exactly as the public override contract promises.
const statesOn = (page: Page, className: string) =>
  page.locator(`.${className}`).evaluateAll((elements) => {
    const states = new Set<string>();
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          const state = rule.selectorText.match(/^\.go\d+((?::[\w-]+|\[[^\]]+\]))$/)?.[1];
          if (state && elements.some((el) => el.matches(rule.selectorText))) states.add(state);
        } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
    return [...states];
  });

for (const className of targets) {
  for (const order of ["before", "after", "layer"] as const) {
    test(`.${className} overrides chart foundations: ${order}`, async ({ page }) => {
      await open(page, className, order === "layer" ? "layer=1" : "");
      const states = await statesOn(page, className);
      const css =
        ["", ...states].map((state) => `.${className}${state}`).join(",") + ` { ${declarations} }`;
      if (order === "before") await open(page, className, `css=${encodeURIComponent(css)}`);
      else await page.addStyleTag({ content: css });
      const actual = await page.locator(`.${className}`).evaluateAll(
        (els, properties) =>
          els.map((el) => {
            el.getAnimations().forEach((animation) => animation.finish());
            const style = getComputedStyle(el);
            return Object.fromEntries(
              properties.map((property) => [property, style.getPropertyValue(property)]),
            );
          }),
        Object.keys(values),
      );
      expect(actual.length).toBeGreaterThan(0);
      for (const style of actual) expect(style).toEqual(values);
    });
  }
}

for (const layer of [false, true]) {
  test(`portal rules obey the contract in ${layer ? "layer" : "default"} mode`, async ({
    page,
  }) => {
    await open(page, "openui-chart-tooltip", layer ? "layer=1" : "");
    const observation = await page.locator(".openui-chart-tooltip-portal").evaluate((portal) => {
      const elements = [portal, ...portal.querySelectorAll("*")];
      return {
        generated: elements.flatMap((el) =>
          [...el.classList].filter((name) => /^go\d+$/.test(name)),
        ),
        stable: elements.flatMap((el) =>
          [...el.classList].filter((name) => name.startsWith("openui-chart-tooltip")),
        ),
        css: document.getElementById("_goober")!.textContent!,
      };
    });
    const generated = new Set(observation.generated);
    const rules = rulesOf(observation.css).filter(({ selector }) =>
      [...selector.matchAll(/\bgo\d+\b/g)].some(([name]) => generated.has(name)),
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.map((rule) => ruleViolation(rule, layer ? "openui" : "")).filter(Boolean)).toEqual(
      [],
    );
    expect(
      observation.stable.map((name) => classViolation(name, blocksIn(constants))).filter(Boolean),
    ).toEqual([]);
  });
}

test("default legend expands and hidden series remain overridable", async ({ page }) => {
  await page.goto("/chart-foundations.html");
  const legend = page.locator(
    '[data-parity-case="default-legend/collapsed"] .openui-default-legend',
  );
  const list = legend.locator(".openui-default-legend-list");
  await expect(list).toHaveAttribute("data-state", "collapsed");
  await legend.getByRole("button", { name: /more/i }).click();
  await expect(list).toHaveAttribute("data-state", "expanded");
  await expect(legend.locator(".openui-default-legend-item")).toHaveCount(9);
  await legend.getByRole("button", { name: /less/i }).click();
  await expect(list).toHaveAttribute("data-state", "collapsed");
});

test("stacked legend state and color transforms are independently overridable", async ({
  page,
}) => {
  await page.goto("/chart-foundations.html");
  const item = page.locator('.openui-stacked-legend-item[data-state="active"]').first();
  await page.addStyleTag({
    content:
      '.openui-stacked-legend-item[data-state="active"] { background-color: rgb(7, 8, 9); } .openui-stacked-legend-item-color { transform: scale(2); }',
  });
  await expect(item).toHaveCSS("background-color", "rgb(7, 8, 9)");
  const color = item.locator(".openui-stacked-legend-item-color");
  await expect(color).toHaveCSS("transform", "matrix(2, 0, 0, 2, 0, 0)");
});

test("hover takes precedence over the stacked legend active color scale as in #72", async ({
  page,
}) => {
  await page.goto("/chart-foundations.html");
  const item = page.locator(
    '[data-parity-case="stacked/percentage-active-hidden"] .openui-stacked-legend-item[data-state="active"]',
  );
  const color = item.locator(".openui-stacked-legend-item-color");
  await page.mouse.move(0, 0);
  await expect(color).toHaveCSS("transform", "matrix(1.3, 0, 0, 1.3, 0, 0)");
  await item.hover();
  await expect(color).toHaveCSS("transform", "matrix(1.2, 0, 0, 1.2, 0, 0)");
  await page.mouse.down();
  await expect(color).toHaveCSS("transform", "matrix(1.2, 0, 0, 1.2, 0, 0)");
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await expect(color).toHaveCSS("transform", "matrix(1.3, 0, 0, 1.3, 0, 0)");
});

test("scroll controls keep native disabled state on both axes", async ({ page }) => {
  await page.goto("/chart-foundations.html");
  for (const [axis, back, forward] of [
    ["horizontal", "left", "right"],
    ["vertical", "up", "down"],
  ]) {
    const chart = page.locator(`[data-parity-case="scroll/${axis}"]`);
    // Disabled controls are intentionally visibility:hidden, so role queries omit them.
    const backButton = chart.locator(`.openui-scroll-buttons-${axis}-${back}`);
    const forwardButton = chart.locator(`.openui-scroll-buttons-${axis}-${forward}`);
    await expect(backButton).toBeDisabled();
    await expect(backButton).toBeHidden();
    await forwardButton.click();
    await expect(backButton).toBeEnabled();
    await expect(backButton).toBeVisible();
    await backButton.click();
    await expect(backButton).toBeDisabled();
    await expect(backButton).toBeHidden();
  }
});

test("draw-line and fade-appear animate to their final values", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/chart-foundations.html");
  const draw = page.locator('[data-testid="draw-line"] .openui-line-chart-line').first();
  const fade = page
    .locator(".openui-mini-line-chart--is-animation-active .openui-mini-line-chart-line")
    .first();
  for (const [target, name, duration, property, final] of [
    [draw, "openui-chart-draw-line", 1000, "stroke-dashoffset", "0px"],
    [fade, "openui-chart-fade-appear", 600, "opacity", "1"],
  ] as const) {
    const animation = await target.evaluate(
      (el, args) => {
        const animation = el
          .getAnimations()
          .find(
            (animation) =>
              animation instanceof CSSAnimation && animation.animationName === args.name,
          );
        if (!animation) return null;
        animation.pause();
        animation.currentTime = 0;
        const start = getComputedStyle(el).getPropertyValue(args.property);
        const duration = animation.effect!.getTiming().duration;
        animation.finish();
        return { start, end: getComputedStyle(el).getPropertyValue(args.property), duration };
      },
      { name, property },
    );
    expect(animation).not.toBeNull();
    expect(animation!.duration).toBe(duration);
    expect(animation!.start).not.toBe(final);
    expect(animation!.end).toBe(final);
  }
});

test("reduced motion leaves the mini marks visible without animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/chart-foundations.html");
  const mark = page
    .locator(".openui-mini-line-chart--is-animation-active .openui-mini-line-chart-line")
    .first();
  await expect(mark).toHaveCSS("opacity", "1");
  expect(await mark.evaluate((el) => el.getAnimations().length)).toBe(0);
});

test("rewriting html classes preserves foundation styles including the portal", async ({
  page,
}) => {
  await open(page, "openui-chart-tooltip");
  await expect(page.locator(".openui-chart-tooltip")).toHaveCount(1);
  await expect(page.locator(".openui-default-legend").first()).toBeVisible();
  await expect(page.locator(".openui-mini-line-chart").first()).toBeVisible();
  const sample = () =>
    page
      .locator(".openui-chart-tooltip, .openui-default-legend, .openui-mini-line-chart")
      .evaluateAll((els) =>
        els.map((el) => {
          const style = getComputedStyle(el);
          // Only check properties the foundation owns. DefaultLegend has no min-width:
          // its auto value resolves differently once its unmigrated parent loses display:flex.
          const properties = el.classList.contains("openui-default-legend")
            ? ["display", "padding-top", "font-size", "gap", "background-color"]
            : ["display", "padding-top", "font-size", "min-width", "background-color"];
          return Object.fromEntries(
            properties.map((property) => [property, style.getPropertyValue(property)]),
          );
        }),
      );
  const before = await sample();
  await page.evaluate(() => {
    document.documentElement.className = "app-dark";
  });
  expect(await sample()).toEqual(before);
});

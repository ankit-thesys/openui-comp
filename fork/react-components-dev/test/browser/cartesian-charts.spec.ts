// Ticket #103, public-package Chromium seam. Every stable target accepts single-class overrides
// before/after the library and in layer mode; data states use the same single attribute shape.
// Run after build: pnpm exec playwright test cartesian-charts.spec.ts
import { expect, test, type Page } from "@playwright/test";
import { readStableNames } from "../../scripts/selector-reference.mjs";
import { ruleViolation, rulesOf } from "../unit/contract/checks";
import { namesIn } from "../unit/contract/collect";

const modules = ["areaChart", "barChart", "horizontalBarChart", "lineChart", "scatterChart"];
const constants = (await readStableNames()).filter((entry) => modules.includes(entry.module));
const targets = [...namesIn(constants.map((entry) => entry.names))];
const values = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-top-color": "rgb(11, 12, 13)",
  fill: "rgb(14, 15, 16)",
  stroke: "rgb(17, 18, 19)",
  "stroke-width": "3px",
  "fill-opacity": "0.6",
  "stroke-opacity": "0.5",
  opacity: "0.7",
  "animation-name": "none",
  "animation-delay": "0.123s",
  "stroke-dasharray": "5px, 6px",
  "transform-origin": "7px 8px",
};
const declarations = Object.entries(values)
  .map(([key, value]) => `${key}: ${value};`)
  .join(" ");
const open = async (page: Page, query = "") => {
  await page.goto(`/cartesian-charts.html?${query}`);
  await expect(page.locator(".openui-scatter-chart-dot").first()).toBeAttached();
};
const statesOn = (page: Page, className: string) =>
  page.locator(`.${className}`).evaluateAll((elements) => {
    const states = new Set<string>();
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          const state = rule.selectorText.match(/^\.go\d+((?::[\w-]+|\[[^\]]+\]))$/)?.[1];
          if (state && elements.some((element) => element.matches(rule.selectorText)))
            states.add(state);
        } else if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
        } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("openui-styles") as HTMLStyleElement).sheet!.cssRules);
    return [...states];
  });

for (const className of targets)
  for (const order of ["before", "after", "layer"] as const) {
    test(`.${className} accepts cartesian overrides: ${order}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open(page, order === "layer" ? "layer=1" : "");
      await expect(page.locator(`.${className}`).first()).toBeAttached();
      const states = await statesOn(page, className);
      const css =
        ["", ...states].map((state) => `.${className}${state}`).join(",") + ` { ${declarations} }`;
      if (order === "before") await open(page, `css=${encodeURIComponent(css)}`);
      else await page.addStyleTag({ content: css });
      const actual = await page.locator(`.${className}`).evaluateAll(
        (elements, properties) =>
          elements.map((element) => {
            element.getAnimations().forEach((animation) => animation.finish());
            const style = getComputedStyle(element);
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

for (const layer of [false, true])
  test(`cartesian SVG rules obey the ${layer ? "openui layer" : "default"} contract`, async ({
    page,
  }) => {
    await open(page, layer ? "layer=1" : "");
    const observation = await page.evaluate(
      (targets) => ({
        classes: [...document.querySelectorAll("[class]")]
          .filter((element) => targets.some((target) => element.classList.contains(target)))
          .flatMap((element) => [...element.classList].filter((name) => /^go\d+$/.test(name))),
        css: document.getElementById("openui-styles")!.textContent!,
      }),
      targets,
    );
    const generated = new Set(observation.classes);
    const rules = rulesOf(observation.css).filter((rule) =>
      [...rule.selector.matchAll(/\bgo\d+\b/g)].some(([name]) => generated.has(name)),
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.map((rule) => ruleViolation(rule, layer ? "openui" : "")).filter(Boolean)).toEqual(
      [],
    );
  });

test("cartesian frame, tick and stroke styles survive rewriting html classes", async ({ page }) => {
  await open(page);
  const sample = () =>
    page
      .locator(
        ".openui-area-chart, .openui-bar-chart, .openui-horizontal-bar-chart, .openui-line-chart, .openui-scatter-chart, .openui-line-chart-y-tick, .openui-area-chart-area-line, .openui-scatter-chart-dot",
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          element.getAnimations().forEach((animation) => animation.finish());
          const style = getComputedStyle(element);
          return [
            style.display,
            style.overflowX,
            style.fontSize,
            style.fill,
            style.stroke,
            style.strokeWidth,
          ];
        }),
      );
  const before = await sample();
  await page.evaluate(() => {
    document.documentElement.className = "application-theme";
  });
  expect(await sample()).toEqual(before);
});

test("negative bar entrances anchor at their zero edge and zero gridlines are solid", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page);
  for (const [family, negative, positive] of [
    ["bar-chart", "center top", "center bottom"],
    ["horizontal-bar-chart", "right center", "left center"],
  ]) {
    const negativeBar = page
      .locator(`.openui-${family}-bar--is-animation-active[data-negative]`)
      .first();
    const positiveBar = page
      .locator(`.openui-${family}-bar--is-animation-active:not([data-negative])`)
      .first();
    const anchor = (element: Element, value: string) => {
      // Resolve keyword expectations against the SVG fill-box, as the browser does.
      const box = (element as SVGGraphicsElement).getBBox();
      const style = getComputedStyle(element);
      const expected =
        value === "center top"
          ? [box.width / 2, 0]
          : value === "center bottom"
            ? [box.width / 2, box.height]
            : value === "right center"
              ? [box.width, box.height / 2]
              : [0, box.height / 2];
      return { actual: style.transformOrigin.split(" ").slice(0, 2).map(parseFloat), expected };
    };
    for (const [target, value] of [
      [negativeBar, negative!],
      [positiveBar, positive!],
    ] as const) {
      const result = await target.evaluate(anchor, value);
      result.actual.forEach((actual, index) =>
        expect(actual).toBeCloseTo(result.expected[index]!, 2),
      );
    }
  }
  await expect(page.locator(".openui-bar-chart-grid-line[data-zero]").first()).toHaveCSS(
    "stroke-dasharray",
    "none",
  );
  await expect(page.locator(".openui-bar-chart-grid-line:not([data-zero])").first()).toHaveCSS(
    "stroke-dasharray",
    "3px, 3px",
  );
});

for (const media of ["reduce", "print"] as const)
  test(`cartesian marks remain visible with ${media}`, async ({ page }) => {
    await page.emulateMedia(media === "reduce" ? { reducedMotion: "reduce" } : { media: "print" });
    await open(page);
    if (media === "print")
      await expect(page.locator('[class*="--is-animation-active"]')).toHaveCount(0);
    const marks = page.locator(
      ".openui-area-chart-area-path, .openui-line-chart-line, .openui-bar-chart-bar, .openui-horizontal-bar-chart-bar, .openui-scatter-chart-dot",
    );
    // The print hook removes entrance classes in an effect. Area paths retain #72's opacity
    // transition, so class removal alone is not readiness. Wait for natural settlement; never
    // finish animations here, which would hide a broken print/reduced-motion implementation.
    const check = async () => {
      const states = await marks.evaluateAll((elements) =>
        elements.map((element) => ({
          opacity: getComputedStyle(element).opacity,
          animations: element.getAnimations().length,
        })),
      );
      expect(states.length).toBeGreaterThan(0);
      for (const state of states) expect(state).toEqual({ opacity: "1", animations: 0 });
    };
    if (media === "print") await expect(check).toPass({ timeout: 5_000 });
    else await check();
  });

for (const [fixture, mount] of [
  ["cartesian-charts", "mountCartesianCharts"],
  ["chart-foundations", "mountMiniCharts"],
] as const) {
  test(`${fixture} registers all generated styles before mount without an html marker`, async ({
    page,
  }) => {
    await page.goto(`/${fixture}.html?lazy=1`);
    await page.waitForFunction(
      (name) => typeof (window as unknown as Record<string, unknown>)[name] === "function",
      mount,
    );
    const before = await page.evaluate(() => ({
      sheet: document.getElementById("openui-styles")?.textContent ?? "",
      html: document.documentElement.className,
    }));
    await page.evaluate(
      (name) => (window as unknown as Record<string, () => void>)[name]!(),
      mount,
    );
    await expect(page.locator("#root svg").first()).toBeAttached();
    const generated = await page
      .locator("#root [class]")
      .evaluateAll((elements) =>
        elements.flatMap((element) =>
          [...element.classList].filter((name) => /^go\d+$/.test(name)),
        ),
      );
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(before.sheet).toMatch(new RegExp(`\\.${name}(?![0-9])`));
    expect(await page.locator("#openui-styles").textContent()).toBe(before.sheet);
    expect(await page.evaluate(() => document.documentElement.className)).toBe(before.html);
    for (const name of generated) expect(before.html.split(/\s+/)).not.toContain(name);
  });
}

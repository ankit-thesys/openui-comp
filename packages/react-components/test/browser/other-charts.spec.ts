// Ticket #104: every public chart target overrides from either load order and in a CSS layer.
// Run after build: pnpm exec playwright test other-charts.spec.ts (orchestrator: Chromium required).
import { expect, test, type Page } from "@playwright/test";
import { readStableNames } from "../../scripts/selector-reference.mjs";
import { chartSlug, otherCharts, type OtherChart } from "../fixtures/other-charts";
import { classViolation, ruleViolation, rulesOf } from "../unit/contract/checks";
import { blocksIn, namesIn } from "../unit/contract/collect";

const entries = await readStableNames();
const constants = (chart: OtherChart) =>
  entries.filter(({ component }) => component === `Charts/${chart}`).map(({ names }) => names);
const values = {
  color: "rgb(1, 2, 3)",
  "background-color": "rgb(4, 5, 6)",
  "padding-top": "7px",
  "border-top-color": "rgb(11, 12, 13)",
  fill: "rgb(14, 15, 16)",
};
const declarations = Object.entries(values)
  .map(([property, value]) => `${property}: ${value};`)
  .join(" ");
const url = (chart: OtherChart, query = "") => `/other-charts.html?chart=${chart}&${query}`;
const open = async (page: Page, chart: OtherChart, className: string, query = "") => {
  await page.goto(url(chart, query));
  await expect(page.locator(`.${className}`).first()).toBeAttached();
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
    visit((document.getElementById("_goober") as HTMLStyleElement).sheet!.cssRules);
    return [...states];
  });

for (const chart of otherCharts) {
  for (const className of namesIn(constants(chart))) {
    for (const order of ["before", "after", "layer"] as const) {
      test(`${chart} .${className} overrides: ${order}`, async ({ page }) => {
        await open(page, chart, className, order === "layer" ? "layer=1" : "");
        const selectors = ["", ...(await statesOn(page, className))].map(
          (state) => `.${className}${state}`,
        );
        const rule = `${selectors.join(", ")} { ${declarations} }`;
        if (order === "before")
          await open(page, chart, className, `css=${encodeURIComponent(rule)}`);
        else await page.addStyleTag({ content: rule });
        const observed = await page.locator(`.${className}`).evaluateAll(
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
        expect(observed.length).toBeGreaterThan(0);
        for (const actual of observed) expect(actual).toEqual(values);
      });
    }
  }
  for (const layer of [false, true]) {
    test(`${chart} obeys the selector, layer and naming contract: ${layer}`, async ({ page }) => {
      await page.goto(url(chart, layer ? "layer=1" : ""));
      const prefix = `openui-${chartSlug(chart)}`;
      await expect(page.locator(`.${prefix}`).first()).toBeAttached();
      const observation = await page.locator("#root").evaluate((root, prefix) => {
        const elements = [...root.querySelectorAll("*")].filter((element) =>
          [...element.classList].some((name) => name === prefix || name.startsWith(`${prefix}-`)),
        );
        return {
          generated: elements.flatMap((element) =>
            [...element.classList].filter((name) => /^go\d+$/.test(name)),
          ),
          stable: elements.flatMap((element) =>
            [...element.classList].filter(
              (name) => name === prefix || name.startsWith(`${prefix}-`),
            ),
          ),
          css: document.getElementById("_goober")!.textContent!,
        };
      }, prefix);
      const generated = new Set(observation.generated);
      const rules = rulesOf(observation.css).filter(({ selector }) =>
        [...selector.matchAll(/\bgo\d+\b/g)].some(([name]) => generated.has(name)),
      );
      expect(rules.length).toBeGreaterThan(0);
      expect(
        rules.map((rule) => ruleViolation(rule, layer ? "openui" : "")).filter(Boolean),
      ).toEqual([]);
      expect(
        observation.stable
          .map((name) => classViolation(name, blocksIn(constants(chart))))
          .filter(Boolean),
      ).toEqual([]);
      expect([...new Set(observation.stable)].sort()).toEqual(
        [...namesIn(constants(chart))].sort(),
      );
    });
  }
  test(`${chart} registers only on render and needs no html marker`, async ({ page }) => {
    await page.goto(url(chart, "lazy=1"));
    await page.waitForFunction(
      () =>
        typeof (window as Window & { mountOtherCharts?: () => void }).mountOtherCharts ===
        "function",
    );
    const before = await page.evaluate(() => ({
      html: document.documentElement.className,
      css: document.getElementById("_goober")?.textContent ?? "",
    }));
    await page.evaluate(() =>
      (window as Window & { mountOtherCharts?: () => void }).mountOtherCharts!(),
    );
    const root = page.locator(`.openui-${chartSlug(chart)}`).first();
    await expect(root).toBeAttached();
    const generated = await root.evaluate((element) =>
      [...element.classList].filter((name) => /^go\d+$/.test(name)),
    );
    expect(generated.length).toBeGreaterThan(0);
    for (const name of generated) expect(before.css).not.toContain(`.${name}{`);
    expect(await page.evaluate(() => document.documentElement.className)).toBe(before.html);
    const read = () =>
      root.evaluate((element) => {
        const style = getComputedStyle(element);
        return { display: style.display, gap: style.gap, position: style.position };
      });
    const styled = await read();
    await page.evaluate(() => {
      document.documentElement.className = "host-rewritten";
    });
    expect(await read()).toEqual(styled);
    expect(styled.display).toBe("flex");
  });
}

for (const order of ["before", "after", "layer"] as const) {
  test(`HeatmapChart's diverging notch overrides: ${order}`, async ({ page }) => {
    const rule =
      ".openui-heatmap-chart-color-scale-ramp--ramp-mode-diverging::after { width: 7px; background-color: rgb(1, 2, 3); }";
    await page.goto(
      url(
        "HeatmapChart",
        order === "before" ? `css=${encodeURIComponent(rule)}` : order === "layer" ? "layer=1" : "",
      ),
    );
    const ramp = page
      .locator(".openui-heatmap-chart-color-scale-ramp--ramp-mode-diverging")
      .first();
    await expect(ramp).toBeAttached();
    if (order !== "before") await page.addStyleTag({ content: rule });
    expect(
      await ramp.evaluate((element) => {
        const style = getComputedStyle(element, "::after");
        return [style.width, style.backgroundColor];
      }),
    ).toEqual(["7px", "rgb(1, 2, 3)"]);
  });
}

test("CalendarHeatmap highlights levels through cell attributes and restores ghost opacity", async ({
  page,
}) => {
  await page.goto(url("CalendarHeatmap"));
  const frame = page.locator('[data-parity-case="fluid/swatches/false/false"]');
  const cell = frame.locator('.openui-calendar-heatmap-cell[data-level="1"]').first();
  const ghost = frame.locator(".openui-calendar-heatmap-cell[data-ghost]").first();
  await frame.locator(".openui-calendar-heatmap-legend-swatch-slot").nth(2).hover();
  await expect(cell).toHaveAttribute("data-dimmed", "");
  await expect(cell).toHaveCSS("fill-opacity", "0.3");
  await page.addStyleTag({
    content: ".openui-calendar-heatmap-cell[data-dimmed] { fill-opacity: 0.8; }",
  });
  await expect(cell).toHaveCSS("fill-opacity", "0.8");
  await page.mouse.move(0, 0);
  await expect(cell).not.toHaveAttribute("data-dimmed", "");
  await expect(ghost).toHaveCSS("fill-opacity", "0.4");
});

test("HeatmapChart's empty and hovered cells accept state overrides", async ({ page }) => {
  const rule =
    ".openui-heatmap-chart-cell[data-empty] { fill: rgb(1, 2, 3); fill-opacity: 0.8; } .openui-heatmap-chart-cell:hover { stroke: rgb(4, 5, 6); stroke-width: 4px; }";
  await page.goto(url("HeatmapChart", `css=${encodeURIComponent(rule)}`));
  const cell = page.locator(".openui-heatmap-chart-cell[data-empty]").first();
  await expect(cell).toHaveCSS("fill", "rgb(1, 2, 3)");
  await expect(cell).toHaveCSS("fill-opacity", "0.8");
  await cell.hover();
  await expect(cell).toHaveCSS("stroke", "rgb(4, 5, 6)");
  await expect(cell).toHaveCSS("stroke-width", "4px");
});

for (const orientation of ["horizontal", "vertical"] as const) {
  test(`FunnelChart blooms on its ${orientation} cross axis`, async ({ page }) => {
    await page.goto(url("FunnelChart"));
    const frame = page.locator(`[data-parity-case="${orientation}/curved/false"]`);
    const ring = frame.locator('.openui-funnel-chart-ring[data-motion="spring"]').nth(2);
    await frame.locator(".openui-funnel-chart-hitbox").first().hover();
    await expect
      .poll(() =>
        ring.evaluate((element, orientation) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
          return orientation === "horizontal" ? matrix.d : matrix.a;
        }, orientation),
      )
      .toBeGreaterThan(1.05);
    await expect
      .poll(() =>
        ring.evaluate((element, orientation) => {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
          return orientation === "horizontal" ? matrix.a : matrix.d;
        }, orientation),
      )
      .toBe(1);
  });
}

for (const chart of ["PieChart", "RadialChart"] as const) {
  test(`${chart} keeps hovered and dimmed drawing parts overridable`, async ({ page }) => {
    await page.goto(url(chart));
    const frame = page.locator(
      chart === "PieChart"
        ? '[data-parity-case="pie/circular/false/none"]'
        : '[data-parity-case="circular/false/false/none"]',
    );
    const marks = frame.locator(
      chart === "PieChart" ? ".openui-pie-chart-slice" : ".openui-radial-chart-bar",
    );
    if (chart === "PieChart") await frame.locator(".openui-pie-chart-hitbox").first().hover();
    else {
      const bar = marks.first();
      const box = await bar.boundingBox();
      if (!box) throw new Error("Radial bar has no geometry");
      await bar.hover({ position: { x: 4, y: box.height / 2 } });
    }
    await expect(marks.first()).toHaveCSS("filter", "brightness(1.08)");
    await expect(marks.nth(1)).toHaveCSS("fill-opacity", "0.4");
    const selector = chart === "PieChart" ? ".openui-pie-chart-slice" : ".openui-radial-chart-bar";
    await page.addStyleTag({ content: `${selector} { fill-opacity: 0.8; filter: none; }` });
    await expect(marks.first()).toHaveCSS("filter", "none");
    await expect(marks.nth(1)).toHaveCSS("fill-opacity", "0.8");
  });
}

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
// A sentinel for every property a #104 library rule declares (longhands, as the CSSOM lists them).
// Each override test checks that this table covers every property the library sets on the class,
// so a new declaration cannot slip past the override contract untested.
const sentinels: Record<string, string> = {
  "align-items": "baseline",
  "animation-delay": "0.123s",
  "animation-direction": "reverse",
  "animation-duration": "0.456s",
  "animation-fill-mode": "backwards",
  "animation-iteration-count": "3",
  "animation-name": "none",
  "animation-play-state": "paused",
  "animation-range-end": "90%",
  "animation-range-start": "10%",
  "animation-timeline": "none",
  "animation-timing-function": "linear",
  "background-attachment": "fixed",
  "background-clip": "content-box",
  "background-color": "rgb(4, 5, 6)",
  "background-image": "linear-gradient(rgb(1, 2, 3), rgb(4, 5, 6))",
  "background-origin": "content-box",
  "background-position-x": "7px",
  "background-position-y": "8px",
  "background-repeat": "no-repeat",
  "background-size": "9px 10px",
  "border-bottom-left-radius": "3px",
  "border-bottom-right-radius": "4px",
  "border-top-left-radius": "5px",
  "border-top-right-radius": "6px",
  bottom: "7px",
  "box-shadow": "rgb(1, 2, 3) 1px 2px 3px 0px",
  "box-sizing": "content-box",
  color: "rgb(1, 2, 3)",
  "column-gap": "7px",
  cursor: "crosshair",
  display: "grid",
  fill: "rgb(14, 15, 16)",
  "fill-opacity": "0.6",
  filter: "blur(1px)",
  "flex-basis": "7px",
  "flex-direction": "column-reverse",
  "flex-grow": "2",
  "flex-shrink": "3",
  "font-family": "monospace",
  "font-feature-settings": '"smcp"',
  "font-kerning": "none",
  "font-optical-sizing": "none",
  "font-size": "17px",
  "font-size-adjust": "0.5",
  "font-stretch": "75%",
  "font-style": "italic",
  "font-variant-alternates": "historical-forms",
  "font-variant-caps": "small-caps",
  "font-variant-east-asian": "ruby",
  "font-variant-emoji": "text",
  "font-variant-ligatures": "none",
  "font-variant-numeric": "tabular-nums",
  "font-variant-position": "sub",
  "font-variation-settings": '"wdth" 80',
  "font-weight": "300",
  height: "41px",
  "justify-content": "space-around",
  left: "7px",
  "letter-spacing": "3px",
  "line-height": "19px",
  "margin-top": "7px",
  "min-height": "9px",
  "min-width": "9px",
  opacity: "0.7",
  "overflow-x": "scroll",
  "overflow-y": "scroll",
  "padding-bottom": "7px",
  "padding-left": "7px",
  "padding-right": "7px",
  "padding-top": "7px",
  "pointer-events": "all",
  position: "absolute",
  "row-gap": "7px",
  stroke: "rgb(17, 18, 19)",
  "stroke-dasharray": "5px, 6px",
  "stroke-width": "3px",
  "text-wrap-mode": "wrap",
  top: "7px",
  transform: "translate(1px, 2px)",
  "transform-box": "content-box",
  "transform-origin": "7px 8px",
  "transition-behavior": "allow-discrete",
  "transition-delay": "0.1s",
  "transition-duration": "0.2s",
  "transition-property": "opacity",
  "transition-timing-function": "linear",
  "user-select": "all",
  "vertical-align": "7px",
  "white-space-collapse": "preserve",
  width: "41px",
  "z-index": "7",
};
const url = (chart: OtherChart, query = "") => `/other-charts.html?chart=${chart}&${query}`;
const open = async (page: Page, chart: OtherChart, className: string, query = "") => {
  await page.goto(url(chart, query));
  await expect(page.locator(`.${className}`).first()).toBeAttached();
};
// Q18 runtime states a consumer matches with the same (0,2,0) shape, and pseudo-elements, which
// are separate boxes. Anything else on a library rule (a constant attribute, a structural
// pseudo-class) would make a plain single-class override lose, so the override tests leave it
// out of the consumer selector and fail if the library depends on it.
const runtimeState =
  /^(?::(?:hover|focus|focus-visible|focus-within|active|disabled)|\[(?:aria-[\w-]+|data-(?:state|orientation|highlighted|dimmed|empty|ghost))(?:="[^"]*")?\]|::[\w-]+)$/;
// Every state and property the library's rules declare on the elements carrying `className`.
// Pseudo-element rules style another box; the dedicated ::after test covers them.
const libraryRulesOn = (page: Page, className: string) =>
  page.locator(`.${className}`).evaluateAll((elements) => {
    const states = new Set<string>();
    const properties = new Set<string>();
    const visit = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          const [, base, state = ""] = rule.selectorText.match(/^(\.go\d+)(.*)$/) ?? [];
          if (!base || !elements.some((element) => element.matches(base))) continue;
          if (state) states.add(state);
          if (!state.startsWith("::"))
            for (const property of rule.style)
              if (!property.startsWith("--")) properties.add(property);
        } else if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules);
        } else if (rule instanceof CSSGroupingRule) visit(rule.cssRules);
      }
    };
    visit((document.getElementById("openui-styles") as HTMLStyleElement).sheet!.cssRules);
    return { states: [...states], properties: [...properties].sort() };
  });
// The computed form of each sentinel, read from a probe of the same tag outside any component.
const computedSentinels = (page: Page, className: string, properties: string[]) =>
  page
    .locator(`.${className}`)
    .first()
    .evaluate(
      (element, { properties, sentinels }) => {
        const svg = element instanceof SVGElement;
        const host = svg
          ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
          : document.createElement("div");
        const probe = svg
          ? document.createElementNS("http://www.w3.org/2000/svg", element.tagName)
          : document.createElement(element.tagName);
        for (const property of properties)
          (probe as HTMLElement).style.setProperty(property, sentinels[property]!);
        host.append(probe);
        document.body.append(host);
        const style = getComputedStyle(probe);
        const values = Object.fromEntries(
          properties.map((property) => [property, style.getPropertyValue(property)]),
        );
        host.remove();
        return values;
      },
      { properties, sentinels },
    );
const read = (page: Page, className: string, properties: string[]) =>
  page.locator(`.${className}`).evaluateAll(
    (elements, properties) =>
      elements.map((element) => {
        element.getAnimations().forEach((animation) => animation.finish());
        const style = getComputedStyle(element);
        return Object.fromEntries(
          properties.map((property) => [property, style.getPropertyValue(property)]),
        );
      }),
    properties,
  );
for (const chart of otherCharts) {
  for (const className of namesIn(constants(chart))) {
    for (const order of ["before", "after", "layer"] as const) {
      test(`${chart} .${className} overrides: ${order}`, async ({ page }) => {
        await open(page, chart, className, order === "layer" ? "layer=1" : "");
        const { states, properties } = await libraryRulesOn(page, className);
        expect(properties.filter((property) => !(property in sentinels))).toEqual([]);
        // A plain single class, plus only the runtime states the library styles.
        const selectors = ["", ...states.filter((state) => runtimeState.test(state))].map(
          (state) => `.${className}${state}`,
        );
        const declarations = properties
          .map((property) => `${property}: ${sentinels[property]};`)
          .join(" ");
        const rule = `${selectors.join(", ")} { ${declarations} }`;
        const expected = await computedSentinels(page, className, properties);
        if (order === "before")
          await open(page, chart, className, `css=${encodeURIComponent(rule)}`);
        else await page.addStyleTag({ content: rule });
        const observed = await read(page, className, properties);
        expect(observed.length).toBeGreaterThan(0);
        for (const actual of observed) expect(actual).toEqual(expected);
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
          css: document.getElementById("openui-styles")!.textContent!,
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
      css: document.getElementById("openui-styles")?.textContent ?? "",
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
    const ring = frame.locator(".openui-funnel-chart-ring").nth(2);
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

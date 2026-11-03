import { expect, test, type Page } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { failures, render } from "../harness/render";

/**
 * Layout that the sweep's general checks can't see, ported from #160's layout and schema-fixes
 * suites. Elements are found by their text, their tag or MapLibre's classes, never the library's.
 */
const host = () => test.info().project.metadata["host"] as Host;
const phone = () => host().width < 768;

/** The nearest box behind some text that draws an edge, such as the Card around it. */
const frameOf = (page: Page, text: string) =>
  page.evaluate((text) => {
    const leaf = [...document.querySelectorAll("#host *")].find(
      (element) => element.childElementCount === 0 && element.textContent === text,
    );
    for (let element = leaf?.parentElement; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      const drawn =
        style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        style.boxShadow !== "none" ||
        parseFloat(style.borderTopWidth) > 0;
      if (drawn) {
        const { top, bottom, left, right } = element.getBoundingClientRect();
        return { top, bottom, left, right };
      }
    }
    return null;
  }, text);

const clean = async (page: Page, program: string) => {
  const rendered = await render(page, host(), program);
  expect(await failures(rendered)).toEqual([]);
  return rendered;
};

test("a Grid stacks on a phone and sits side by side on a desktop", async ({ page }) => {
  await clean(page, "layout-grid");
  const a = (await frameOf(page, "Cell A"))!;
  const b = (await frameOf(page, "Cell B"))!;
  if (phone()) {
    expect(b.top).toBeGreaterThan(a.bottom - 1);
  } else {
    expect(Math.round(b.top)).toBe(Math.round(a.top));
    expect(b.left).toBeGreaterThan(a.right - 1);
  }
});

test("radio cards stack on a phone", async ({ page }) => {
  test.skip(!phone(), "on a desktop they share a row");
  await clean(page, "layout-radio-cards");
  const tops = await Promise.all(
    ["One", "Two", "Three"].map(async (label) => Math.round((await frameOf(page, label))!.top)),
  );
  expect(new Set(tops).size).toBe(3);
});

test("a Map has a real size", async ({ page }) => {
  await clean(page, "map");
  const canvas = await page.locator("#host .maplibregl-canvas").first().boundingBox();
  expect(canvas!.width).toBeGreaterThan(300);
  expect(canvas!.height).toBeGreaterThan(200);
});

test("HtmlView sandboxes its page so it can't reach the host's", async ({ page }) => {
  await clean(page, "html");
  const frame = page.locator("#host iframe").first();
  const sandbox = (await frame.getAttribute("sandbox"))?.split(/\s+/) ?? [];
  expect(sandbox).toContain("allow-scripts");
  expect(sandbox).not.toContain("allow-same-origin");
  expect((await frame.boundingBox())!.height).toBeGreaterThan(100);
});

test("a shape outside an Svg is still drawn", async ({ page }) => {
  await clean(page, "layout-shape-outside-svg");
  const circle = page.locator("#host svg circle").first();
  expect((await circle.boundingBox())!.width).toBeGreaterThan(0);
});

test("a Text given to an Svg shows below the drawing", async ({ page }) => {
  await clean(page, "layout-text-in-svg");
  const caption = page.getByText("A caption for the drawing");
  await expect(caption).toBeVisible();
  expect(await caption.evaluate((element) => element.closest("svg") === null)).toBe(true);
  const drawing = (await page.locator("#host svg").first().boundingBox())!;
  expect((await caption.boundingBox())!.y).toBeGreaterThanOrEqual(drawing.y + drawing.height - 1);
});

test("a MapMarker outside a Map shows as a labelled place", async ({ page }) => {
  await clean(page, "layout-marker-outside-map");
  await expect(page.getByText("Ferry Building")).toBeVisible();
});

test("a Badge inside Text keeps the HTML valid", async ({ page }) => {
  // React's nesting warnings are console errors, which `clean` already fails on.
  await clean(page, "layout-badge-in-text");
  expect(await page.locator("#host p div, #host p p").count()).toBe(0);
  await expect(page.getByText("Live")).toBeVisible();
});

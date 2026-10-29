import type { Page } from "@playwright/test";

// Area and Line morph their path data with a JavaScript spring on requestAnimationFrame, which
// `getAnimations()` cannot finish. Wait until every path's data and every SVG box hold still,
// on #72 and this build alike, so geometry is read at rest rather than mid-morph.
export const settleCartesianChart = (page: Page, id: string) =>
  page.locator(`[data-parity-case="${id}"]`).evaluate(async (root) => {
    root.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
    let previous = "";
    let quiet = 0;
    for (let frame = 0; frame < 240; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const current = [...root.querySelectorAll("svg *")]
        .map((element) => {
          const box = element.getBoundingClientRect();
          return `${element.getAttribute("d")}/${getComputedStyle(element).transform}/${box.x},${box.y},${box.width},${box.height}`;
        })
        .join("|");
      quiet = current === previous ? quiet + 1 : 0;
      if (quiet >= 5) return;
      previous = current;
    }
    throw new Error("Chart data morph did not settle before its parity observation");
  });

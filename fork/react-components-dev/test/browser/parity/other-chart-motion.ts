import type { Page } from "@playwright/test";

// Finish CSS entrances and settle JavaScript hover springs identically on #72 and this build.
export const settleOtherChart = (page: Page, id: string) =>
  page.locator(`[data-parity-case="${id}"]`).evaluate(async (root) => {
    root.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
    let previous = "";
    let quiet = 0;
    for (let frame = 0; frame < 240; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const current = [...root.querySelectorAll("svg g, svg path")]
        .map((element) => {
          const style = getComputedStyle(element);
          return `${style.transform}/${style.fillOpacity}/${style.filter}`;
        })
        .join("|");
      quiet = current === previous ? quiet + 1 : 0;
      if (quiet >= 5) return;
      previous = current;
    }
    throw new Error("Chart hover motion did not settle before its parity observation");
  });

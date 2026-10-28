// Pages that client-render each migrated component (fixtures/migrated-server.tsx) through the
// `elements` fixture, the way a client-only app renders them.
import type { Page } from "@playwright/test";

// Built by build-fixtures.ts (Playwright's global setup) before any spec runs.
const { migrated } = (await import(
  new URL("../.fixtures/server/migrated-server.mjs", import.meta.url).href
)) as typeof import("../fixtures/migrated-server");

export type MigratedComponent = (typeof migrated)[number];
export { migrated };

/** Opens a page rendering `component`, with `head` (consumer CSS, say) before the bundle. */
export async function openMigrated(page: Page, component: MigratedComponent, head = "") {
  const path = `/migrated-${component.folder}.html`;
  // SegmentedBar deliberately inherits the page's font. Give the chart bench explicit page
  // typography so Preflight's html font/line-height reset does not change that input. Use body
  // so portalled chart parts inherit the same typography as the elements inside #root. Load
  // the page rule after head CSS: Tailwind 3 also declares body { line-height: inherit }.
  const typography = component.folder === "Charts" ? "font: 16px/normal serif;" : "";
  const body =
    // A margin-free body, so percentage sizes do not depend on whether a reset removed its margin.
    `<!doctype html><html><head><meta charset="utf-8">${head}<style>body { margin: 0; ${typography} }</style>` +
    `</head><body><div id="root"></div><script type="module" src="/elements.js"></script></body></html>`;
  await page.route(`**${path}?*`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(`${path}?component=${encodeURIComponent(component.folder)}`);
  // Any stable class will do: which parts and modifiers render depends on the elements.
  await page
    .locator(component.stableClasses.map((name) => `#root .${name}`).join(", "))
    .first()
    .waitFor();
  if (component.folder === "Charts") {
    await page
      .getByTestId("bench-chart-tooltip")
      .getByRole("img", { name: "Line chart", exact: true })
      .hover({ position: { x: 120, y: 80 } });
    // The portal wrapper is a positioning element. Its visible panel is readiness, and lives
    // outside #root; the override and Tailwind snapshots must include it.
    await page.locator(".openui-chart-tooltip").waitFor({ state: "visible" });
    await page
      .locator(".openui-chart-tooltip-portal[data-positioned]")
      .waitFor({ state: "attached" });
  }
}

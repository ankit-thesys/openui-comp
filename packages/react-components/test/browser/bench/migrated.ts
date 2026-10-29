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
  const body =
    // Normalize page-owned defaults in both runs: margins affect percentage sizes, and native
    // button text color affects currentColor from `border: none` inside Citation's tooltip.
    // Tailwind inherits that color; use the same baseline without changing library declarations.
    `<!doctype html><html><head><meta charset="utf-8"><style>body { margin: 0; } button { color: inherit; }</style>${head}` +
    `</head><body><div id="root"></div><script type="module" src="/elements.js"></script></body></html>`;
  await page.route(`**${path}?*`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(`${path}?component=${encodeURIComponent(component.folder)}`);
  // Any stable class will do: which parts and modifiers render depends on the elements.
  await page
    .locator(component.stableClasses.map((name) => `#root .${name}`).join(", "))
    .first()
    .waitFor();
  if (component.folder === "Citation") {
    // The contract includes portalled parts. Pin a real tooltip and wait for its lazy icon;
    // the benches query the whole document so the portal participates alongside the trigger.
    await page.getByRole("button", { name: "Citations", exact: true }).click();
    await page.locator(".openui-citation-tooltip").waitFor();
    await page.locator("svg.openui-citation-icon").waitFor();
    await page.mouse.move(0, 700);
  }
  // #96: owned lazy SVG parts must participate in overrides and preflight comparisons.
  if (component.folder === "IconTag" || component.folder === "IconText")
    await page.locator("svg.openui-icon-tag-icon").first().waitFor();
  if (component.folder === "SourceFaviconImage")
    await page.locator("svg.openui-source-favicon-image").waitFor();
}

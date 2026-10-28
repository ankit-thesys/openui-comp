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
    // A margin-free body, so percentage sizes do not depend on whether a reset removed its margin.
    `<!doctype html><html><head><meta charset="utf-8"><style>body { margin: 0; }</style>${head}` +
    `</head><body><div id="root"></div><script type="module" src="/elements.js"></script></body></html>`;
  await page.route(`**${path}?*`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(`${path}?component=${encodeURIComponent(component.folder)}`);
  // Wait for a visible stable part: a Modal portal root has no box because its children
  // are fixed-positioned. Selecting that root first would time out despite an open dialog.
  await page
    .locator(component.stableClasses.map((name) => `.${name}:visible`).join(", "))
    .first()
    .waitFor();
}

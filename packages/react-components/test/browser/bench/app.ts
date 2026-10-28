// Opens the bench app (fixtures/bench-app.tsx), server-rendered by either package and hydrated in
// Chromium, the way an SSR app ships it.
import type { Page } from "@playwright/test";
import type { Mode } from "../fixtures/bench-app";
import type { Package } from "../fixtures/bench-server";

export const PACKAGES = ["react-components", "react-ui"] as const satisfies Package[];
export type { Mode, Package };

// Built by build-fixtures.ts (Playwright's global setup) before any spec runs.
const server = (): Promise<typeof import("../fixtures/bench-server")> =>
  import(new URL("../.fixtures/server/bench-server.mjs", import.meta.url).href);

/** Opens the bench app once hydration has finished; errors are in `window.__hydration`. */
export async function openBench(page: Page, pkg: Package, mode: Mode = "light") {
  const path = `/bench-${pkg}-${mode}.html`;
  const body = (await server()).serverPage(pkg, mode);
  await page.route(`**${path}`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(path);
  await page.waitForFunction(() => window.__hydration?.done === true);
}

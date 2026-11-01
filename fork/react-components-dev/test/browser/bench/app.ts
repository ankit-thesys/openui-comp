// Opens the bench app (fixtures/bench-app.tsx), server-rendered by either package and hydrated in
// Chromium, the way an SSR app ships it.
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Mode } from "../fixtures/bench-app";
import type { Package } from "../fixtures/bench-server";

export const PACKAGES = ["react-components", "react-ui"] as const satisfies Package[];
export type { Mode, Package };

/** Opens the bench app once hydration has finished; errors are in `window.__hydration`. */
export async function openBench(page: Page, pkg: Package, mode: Mode = "light") {
  const path = `/bench-${pkg}-${mode}.html`;
  // Built and server-rendered by global setup, using the same app that the page hydrates.
  const body = readFileSync(new URL(`../.fixtures/server${path}`, import.meta.url), "utf8");
  await page.route(`**${path}`, (route) => route.fulfill({ contentType: "text/html", body }));
  await page.goto(path);
  await page.waitForFunction(() => window.__hydration?.done === true);
}

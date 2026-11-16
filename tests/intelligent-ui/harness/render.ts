import type { Page } from "@playwright/test";
import { checks, watchConsole, type Rendered } from "./checks";
import { hostUrl, type Host } from "./matrix";
import { isolate } from "./network";

/** How long charts, maps and ResizeObservers get to settle after the first parse. */
const SETTLE_MS = 600;

/** Loads one program on one host and waits for it to settle. */
export async function render(
  page: Page,
  host: Host,
  program: string,
  extra?: Record<string, string>,
): Promise<Rendered> {
  const console = watchConsole(page);
  await isolate(page);
  await page.goto(hostUrl(host, program, extra));
  await page.waitForFunction(
    () => window.__iu?.rendered === true || window.__iu?.hostErrors.length > 0,
  );
  await page.waitForTimeout(SETTLE_MS);
  const state = await page.evaluate(() => window.__iu);
  return { page, state, console };
}

/** Runs every check, and returns only the ones that found something. */
export async function failures(rendered: Rendered) {
  const found: { check: string; problems: string[] }[] = [];
  for (const check of checks) {
    const problems = await check.run(rendered);
    if (problems.length > 0) found.push({ check: check.name, problems });
  }
  return found;
}

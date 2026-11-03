import { expect, test } from "@playwright/test";
import { watchConsole } from "../harness/checks";
import { hostUrl, type Host } from "../harness/matrix";
import { isolate } from "../harness/network";
import { programs } from "../harness/programs";
import { failures } from "../harness/render";

/**
 * #203: every program streamed in chunks, as a chat delivers a model's answer, logs no console
 * error at any point, and the finished program passes every check. Chunks are uneven, so cuts land
 * inside names, strings, numbers and argument lists.
 */
const host = () => test.info().project.metadata["host"] as Host;

/** Chunk lengths from a fixed seed, 1 to 48 characters, so every run cuts the same places. */
function chunks(code: string) {
  const cuts: string[] = [];
  let seed = 203;
  for (let at = 0; at < code.length;) {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    const size = 1 + (seed % 48);
    cuts.push(code.slice(0, at + size));
    at += size;
  }
  return cuts;
}

for (const program of programs.filter((entry) => entry.set !== "self-test")) {
  test(`${program.id} streams without console errors`, async ({ page }) => {
    test.setTimeout(120_000);
    const console = watchConsole(page);
    await isolate(page);
    await page.goto(`${hostUrl(host(), program.id)}&stream=1`);
    await page.waitForFunction(() => typeof window.__iuStream === "function");

    // One chunk per frame, as a stream arrives, fed from inside the page so a run stays quick.
    const fed = await page.evaluate(async (partials) => {
      for (const partial of partials) {
        window.__iuStream!(partial, true);
        await new Promise((done) => requestAnimationFrame(done));
      }
      return partials.length;
    }, chunks(program.code));
    expect(fed).toBeGreaterThan(1);
    expect(console, "console errors while streaming").toEqual([]);
    await page.evaluate((response) => window.__iuStream!(response, false), program.code);
    await page.waitForFunction(() => window.__iu.rendered);
    await page.waitForTimeout(600);

    const state = await page.evaluate(() => window.__iu);
    const found = await failures({ page, state, console });
    // The bad-input functions program reports its bad calls by design (specs/functions.spec.ts).
    const expected = program.id === "behaviour-functions-null" ? ["no render errors"] : [];
    expect(
      found.map((entry) => entry.check),
      JSON.stringify(found),
    ).toEqual(expected);
  });
}

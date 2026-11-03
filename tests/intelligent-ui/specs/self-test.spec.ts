import { expect, test } from "@playwright/test";
import type { Host } from "../harness/matrix";
import { failures, render } from "../harness/render";

/**
 * The checks themselves: each broken program has to fail the check meant to catch it. Without
 * these, a check that silently stopped finding problems would leave the run green.
 */
const host = () => test.info().project.metadata["host"] as Host;

test("a missing required argument fails 'parses'", async ({ page }) => {
  const found = await failures(await render(page, host(), "self-test-invalid-props"));
  expect(found.find((entry) => entry.check === "parses")?.problems).toEqual([
    expect.stringContaining("parse error:"),
  ]);
});

test("an unresolved reference fails 'parses'", async ({ page }) => {
  const found = await failures(await render(page, host(), "self-test-unresolved"));
  expect(found.find((entry) => entry.check === "parses")?.problems).toEqual([
    "unresolved reference: missing",
  ]);
});

test("an orphaned statement fails 'parses'", async ({ page }) => {
  const found = await failures(await render(page, host(), "self-test-orphaned"));
  expect(found.find((entry) => entry.check === "parses")?.problems).toEqual([
    "orphaned statement: extra",
  ]);
});

test("a console error fails 'no console errors'", async ({ page }) => {
  const rendered = await render(page, host(), "text");
  await page.evaluate(() => console.error("self-test error"));
  expect(await failures(rendered)).toEqual([
    { check: "no console errors", problems: ["console error: self-test error"] },
  ]);
});

test("an unknown program id fails 'host'", async ({ page }) => {
  const found = await failures(await render(page, host(), "no-such-program"));
  expect(found.find((entry) => entry.check === "host")?.problems).toEqual([
    'no program called "no-such-program"',
  ]);
});

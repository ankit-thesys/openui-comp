// On-demand review screenshots: every parity fixture, light and dark, saved as full-page PNGs under
// test/browser/.screenshots/ (gitignored) for attaching to a PR. Skipped unless
// OPENUI_SCREENSHOTS=1, so CI never runs it: `pnpm test:screenshots`.
// Fixtures are discovered from test/browser/fixtures/parity-*.tsx, so a new parity fixture is
// included once it is added to `fixtures` in build-fixtures.ts (the parity checklist requires that).
import { expect, test } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const outDir = here("./.screenshots/");
const parityFixtures = readdirSync(here("./fixtures/"))
  .filter((file) => /^parity-[\w-]+\.tsx$/.test(file))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort();

const PNG_SIGNATURE = "89504e470d0a1a0a";
const REVIEW_LAYOUT = `
  body { margin: 0; background: var(--openui-background, #fff); }
  #root { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; padding: 16px; }
`;

test.describe("review screenshots", () => {
  test.skip(
    !process.env["OPENUI_SCREENSHOTS"],
    "Run with OPENUI_SCREENSHOTS=1 (pnpm test:screenshots).",
  );

  test("covers at least the converted components", () => {
    expect(parityFixtures).toEqual(expect.arrayContaining(["parity-button", "parity-icon-button"]));
  });

  for (const fixture of parityFixtures) {
    for (const mode of ["light", "dark"] as const) {
      test(`${fixture} in ${mode}`, async ({ page }) => {
        test.setTimeout(120_000);
        expect(
          existsSync(here(`./.fixtures/${fixture}.js`)),
          `${fixture} is not bundled: add it to \`fixtures\` in build-fixtures.ts`,
        ).toBe(true);
        const path = `${outDir}${fixture}-${mode}.png`;
        mkdirSync(outDir, { recursive: true });

        await page.goto(`/${fixture}.html?mode=${mode}`);
        await expect(page.locator("[data-parity-case]").first()).toBeVisible();
        // Presentation only, for a readable image: lay the cases out in wrapping rows and paint the
        // page with the theme's background so dark-mode cases are visible. Only the page and #root
        // are styled; fixtures render their cases directly under #root, so the cases themselves are
        // not restyled, only placed as flex items.
        await page.addStyleTag({ content: REVIEW_LAYOUT });
        // Let transitions settle so idle cases are captured in their resting state.
        await page.evaluate(() =>
          document.getAnimations().forEach((animation) => animation.finish()),
        );
        await page.screenshot({ path, fullPage: true });

        const png = readFileSync(path);
        expect(png.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE);
        expect(png.length).toBeGreaterThan(1_000);
      });
    }
  }
});

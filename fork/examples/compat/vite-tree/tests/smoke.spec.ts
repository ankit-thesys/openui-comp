import { expect, test } from "@playwright/test";
import defaultTheme from "../../shared/default-theme.json" with { type: "json" };
import { smoke } from "../../shared/smoke";

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

test(`Button-only production bundle (${mode})`, async ({ page, request }) => {
  const response = await request.get("/tree-report.json");
  expect(response.ok()).toBe(true);
  const report = await response.json();
  expect(report.mode).toBe(mode);
  expect(report.button.styleModules).toEqual(["components/Button/button.styles.mjs"]);
  expect(report.all.styleModules.length).toBeGreaterThan(50);
  expect(report.button.gzipBytes).toBeLessThan(report.all.gzipBytes);

  await smoke(page, expect, {
    layer: mode === "layered" ? "openui" : false,
    serverSheets: 0,
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
    samples: defaultTheme
      .filter((sample) => sample.selector === ".openui-button")
      .map((sample) => ({
        ...sample,
        styles: Object.fromEntries(
          Object.entries(sample.styles).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        ),
      })),
  });
  expect(defaultTheme.filter((sample) => sample.selector === ".openui-button")).toHaveLength(1);
  const css = await page.locator("#openui-styles").textContent();
  expect(css).toContain("--_openui-button-primary-bg");
  expect(css).not.toMatch(/--_openui-(?!button-)[a-z-]+/);
});

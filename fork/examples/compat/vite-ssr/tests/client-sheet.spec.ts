// #1523 sends no server sheet: the browser writes every component rule after hydration.
// The shared contract: default theme, console and hydration errors, one browser sheet, no
// repeated rules, equal-weight override and the configured layer.
import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

for (const path of ["/"]) {
  test(`${path}: client-written styles (${mode})`, async ({ page }) => {
    await smoke(page, expect, {
      path,
      layer: mode === "layered" ? "openui" : false,
      serverSheets: 0,
      ready: `[data-compat-ready][data-compat-mode="${mode}"] [data-streamed][data-hydrated="true"]`,
      
    });
  });
}

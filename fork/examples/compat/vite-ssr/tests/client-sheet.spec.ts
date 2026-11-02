// The server sends the rendered components' rules in React's hoisted tags (#178); the browser
// writes the rest. The shared contract: default theme, console and hydration errors, at most one
// browser sheet, no repeated rules across server and browser tags, equal-weight override and the
// configured layer.
import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

for (const path of ["/"]) {
  test(`${path}: client-written styles (${mode})`, async ({ page }) => {
    await smoke(page, expect, {
      path,
      layer: mode === "layered" ? "openui" : false,
      serverSheets: true,
      ready: `[data-compat-ready][data-compat-mode="${mode}"] [data-streamed][data-hydrated="true"]`,
      
    });
  });
}

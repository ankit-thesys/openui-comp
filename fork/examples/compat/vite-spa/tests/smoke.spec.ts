import { expect, test } from "@playwright/test";
import { smoke } from "../../shared/smoke";

const mode = process.env["OPENUI_COMPAT_MODE"] ?? "unlayered";
if (mode !== "layered" && mode !== "unlayered") throw new Error(`Invalid mode: ${mode}`);

test(`default theme and style contract (${mode})`, async ({ page }) => {
  await smoke(page, expect, {
    layer: mode === "layered" ? "openui" : false,
    serverSheets: 0,
    ready: `[data-compat-ready][data-compat-mode="${mode}"]`,
  });
});

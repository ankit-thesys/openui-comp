// No intentional visual differences from #72.
import { test } from "@playwright/test";
import { checkParity } from "./parity/parity";

test("CodeBlock matches the #72 computed styles", async ({ page }) => {
  test.setTimeout(180_000);
  // Hold CodeBlock's one-second copied-state reset across all snapshots in both builds.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
    }),
  );
  await checkParity(page, "code-block");
});
